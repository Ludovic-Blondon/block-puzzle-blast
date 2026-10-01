import { create } from 'zustand';
import {
  Grid,
  createEmptyGrid,
  canPlacePiece,
  placePiece,
  clearLines,
  isGameOver,
  ClearResult,
} from '../game/engine';
import { PieceShape, getRandomPieces, getSeededRandomPieces } from '../game/pieces';
import { calculateScore, ScoreResult } from '../game/scoring';
import { BLOCK_COLORS } from '../utils/colors';
import { applyBomb, applyClearRow, rotatePiece } from '../game/powerups';
import { GameMode, GRID_SIZE, BLITZ_DURATION, BLITZ_COMBO_TIME_BONUS, LEVEL_THRESHOLD } from '../constants/config';

export interface GamePiece {
  piece: PieceShape;
  colorIndex: number;
  placed: boolean;
}

interface GameState {
  grid: Grid;
  currentPieces: (GamePiece | null)[];
  score: number;
  streak: number;
  isGameOver: boolean;
  // Classic & Blitz: no remaining piece fits, but a power-up may still save the game
  isStuck: boolean;
  lastClearResult: ClearResult | null;
  lastScoreResult: ScoreResult | null;

  // Game mode
  mode: GameMode;

  // Classic mode: levels
  level: number;
  lastLevel: number; // Track for level-up detection

  // Blitz mode
  timeRemaining: number;
  timerRunning: boolean;

  // Zen mode
  zenLinesCleared: number;

  // Daily challenge
  dailySeed: string;
  dailySetIndex: number; // Index of the current seeded piece set, same sequence for every player
  dailyMovesLeft: number;
  dailyObjective: number;
  dailyLinesCleared: number;

  // Actions
  startNewGame: (mode?: GameMode) => void;
  tryPlacePiece: (pieceIndex: number, row: number, col: number) => boolean;
  checkGameOver: () => void;
  endGame: () => void;
  applyBombToGrid: (row: number, col: number) => void;
  applyClearLineToGrid: (row: number) => void;
  rotatePieceInTray: (pieceIndex: number) => void;
  tickTimer: () => void;
  zenPartialClear: () => void;
}

function generateNewPieces(): GamePiece[] {
  const pieces = getRandomPieces(3);
  return pieces.map((piece) => ({
    piece,
    colorIndex: Math.floor(Math.random() * BLOCK_COLORS.length) + 1,
    placed: false,
  }));
}

function generateSeededPieces(seed: string, index: number): GamePiece[] {
  const pieces = getSeededRandomPieces(seed, index, 3);
  return pieces.map((piece) => ({
    piece,
    colorIndex: Math.floor(Math.random() * BLOCK_COLORS.length) + 1,
    placed: false,
  }));
}

function getDailySeed(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

// Lock to prevent concurrent tryPlacePiece calls
let placementLock = false;

export const useGameStore = create<GameState>((set, get) => ({
  grid: createEmptyGrid(),
  currentPieces: generateNewPieces(),
  score: 0,
  streak: 0,
  isGameOver: false,
  isStuck: false,
  lastClearResult: null,
  lastScoreResult: null,

  mode: 'classic',
  level: 1,
  lastLevel: 1,

  timeRemaining: BLITZ_DURATION,
  timerRunning: false,

  zenLinesCleared: 0,

  dailySeed: getDailySeed(),
  dailySetIndex: 0,
  dailyMovesLeft: 15,
  dailyObjective: 8,
  dailyLinesCleared: 0,

  startNewGame: (mode = 'classic') => {
    const seed = getDailySeed();
    const pieces = mode === 'daily' ? generateSeededPieces(seed, 0) : generateNewPieces();

    set({
      grid: createEmptyGrid(),
      currentPieces: pieces,
      score: 0,
      streak: 0,
      isGameOver: false,
      isStuck: false,
      lastClearResult: null,
      lastScoreResult: null,
      mode,
      level: 1,
      lastLevel: 1,
      timeRemaining: BLITZ_DURATION,
      timerRunning: mode === 'blitz',
      zenLinesCleared: 0,
      dailySeed: seed,
      dailySetIndex: 0,
      dailyMovesLeft: 15,
      dailyObjective: 8,
      dailyLinesCleared: 0,
    });
  },

  tryPlacePiece: (pieceIndex: number, row: number, col: number) => {
    if (placementLock) return false;
    placementLock = true;

    try {
      const { grid, currentPieces, score, streak, mode, dailyMovesLeft, dailyLinesCleared, dailySeed, dailySetIndex, zenLinesCleared } = get();
      const gamePiece = currentPieces[pieceIndex];
      if (!gamePiece || gamePiece.placed) return false;

      // Daily: check moves remaining
      if (mode === 'daily' && dailyMovesLeft <= 0) return false;

      if (!canPlacePiece(grid, gamePiece.piece, row, col)) return false;

      const newGrid = placePiece(grid, gamePiece.piece, row, col, gamePiece.colorIndex);
      const clearResult = clearLines(newGrid);

      const newStreak = clearResult.linesCleared > 0 ? streak + 1 : 0;
      const scoreResult = calculateScore(
        clearResult.linesCleared,
        clearResult.cellsCleared,
        newStreak
      );

      // Mark piece as placed
      const newPieces = [...currentPieces];
      newPieces[pieceIndex] = null;

      // Check if all pieces placed -> generate new ones
      const allPlaced = newPieces.every((p) => p === null);
      let finalPieces: (GamePiece | null)[];
      let nextDailySetIndex = dailySetIndex;
      if (allPlaced) {
        if (mode === 'daily') {
          // Next seeded set: depends only on how many sets were drawn, not on the player's score
          nextDailySetIndex = dailySetIndex + 1;
          finalPieces = generateSeededPieces(dailySeed, nextDailySetIndex);
        } else {
          finalPieces = generateNewPieces();
        }
      } else {
        finalPieces = newPieces;
      }

      // Calculate level for classic mode
      const newScore = score + scoreResult.points;
      const newLevel = Math.floor(newScore / LEVEL_THRESHOLD) + 1;

      // Blitz: add time bonus for combos
      let timeBonus = 0;
      if (mode === 'blitz' && clearResult.linesCleared >= 2) {
        timeBonus = BLITZ_COMBO_TIME_BONUS;
      }

      const updates: Partial<GameState> = {
        grid: clearResult.grid,
        currentPieces: finalPieces,
        score: newScore,
        streak: newStreak,
        lastClearResult: clearResult,
        lastScoreResult: scoreResult,
        level: newLevel,
      };

      if (mode === 'blitz' && timeBonus > 0) {
        updates.timeRemaining = get().timeRemaining + timeBonus;
      }

      if (mode === 'daily') {
        updates.dailyMovesLeft = dailyMovesLeft - 1;
        updates.dailyLinesCleared = dailyLinesCleared + clearResult.linesCleared;
        updates.dailySetIndex = nextDailySetIndex;
      }

      if (mode === 'zen') {
        updates.zenLinesCleared = zenLinesCleared + clearResult.linesCleared;
      }

      set(updates as any);

      // Check game over after state update (synchronously, so no render sees a stale stuck state)
      get().checkGameOver();

      return true;
    } finally {
      placementLock = false;
    }
  },

  checkGameOver: () => {
    const { grid, currentPieces, mode, dailyMovesLeft, timeRemaining } = get();
    if (get().isGameOver) return;

    const remainingPieces = currentPieces
      .filter((p): p is GamePiece => p !== null)
      .map((p) => p.piece);
    const stuck = remainingPieces.length > 0 && isGameOver(grid, remainingPieces);

    // Zen mode: never game over from pieces, do partial clear instead
    if (mode === 'zen') {
      if (stuck) get().zenPartialClear();
      return;
    }

    // Daily mode: game over when no moves left, or when no piece fits (no power-ups in this mode)
    if (mode === 'daily') {
      if (dailyMovesLeft <= 0 || stuck) {
        set({ isGameOver: true });
      }
      return;
    }

    // Blitz mode: game over when time runs out (handled by tickTimer)
    if (mode === 'blitz' && timeRemaining <= 0) {
      set({ isGameOver: true, isStuck: false, timerRunning: false });
      return;
    }

    // Classic & Blitz: the screen ends the game (endGame) once no power-up can get the player unstuck
    set({ isStuck: stuck });
  },

  endGame: () => {
    if (get().isGameOver) return;
    set({ isGameOver: true, isStuck: false, timerRunning: false });
  },

  applyBombToGrid: (row, col) => {
    const { grid } = get();
    const newGrid = applyBomb(grid, row, col);
    set({ grid: newGrid });
    get().checkGameOver();
  },

  applyClearLineToGrid: (row) => {
    const { grid } = get();
    const newGrid = applyClearRow(grid, row);
    set({ grid: newGrid });
    get().checkGameOver();
  },

  rotatePieceInTray: (pieceIndex) => {
    const { currentPieces } = get();
    const gamePiece = currentPieces[pieceIndex];
    if (!gamePiece) return;
    const rotatedPiece = rotatePiece(gamePiece.piece);
    const newPieces = [...currentPieces];
    newPieces[pieceIndex] = { ...gamePiece, piece: rotatedPiece };
    set({ currentPieces: newPieces });
    // A rotated piece may fit (or no longer fit)
    get().checkGameOver();
  },

  tickTimer: () => {
    const { timeRemaining, timerRunning, mode } = get();
    if (!timerRunning || mode !== 'blitz') return;

    const newTime = timeRemaining - 1;
    if (newTime <= 0) {
      set({ timeRemaining: 0, isGameOver: true, timerRunning: false });
    } else {
      set({ timeRemaining: newTime });
    }
  },

  zenPartialClear: () => {
    const { grid, currentPieces } = get();
    const remainingPieces = currentPieces
      .filter((p): p is GamePiece => p !== null)
      .map((p) => p.piece);

    // Clear bottom rows to give player breathing room: 3 rows, more if a piece
    // still doesn't fit (a vertical 5-line needs 5 free rows in one column)
    let newGrid = grid;
    for (let rowsToClear = 3; rowsToClear <= GRID_SIZE; rowsToClear++) {
      newGrid = grid.map((row, rowIndex) => {
        if (rowIndex >= GRID_SIZE - rowsToClear) return row.map(() => 0);
        return [...row];
      });
      if (!isGameOver(newGrid, remainingPieces)) break;
    }
    set({ grid: newGrid });
  },
}));
