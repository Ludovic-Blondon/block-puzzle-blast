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
import { GameMode, BLITZ_DURATION, BLITZ_COMBO_TIME_BONUS, LEVEL_THRESHOLD } from '../constants/config';

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
  dailyMovesLeft: number;
  dailyObjective: number;
  dailyLinesCleared: number;

  // Actions
  startNewGame: (mode?: GameMode) => void;
  tryPlacePiece: (pieceIndex: number, row: number, col: number) => boolean;
  checkGameOver: () => void;
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
  lastClearResult: null,
  lastScoreResult: null,

  mode: 'classic',
  level: 1,
  lastLevel: 1,

  timeRemaining: BLITZ_DURATION,
  timerRunning: false,

  zenLinesCleared: 0,

  dailySeed: getDailySeed(),
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
      lastClearResult: null,
      lastScoreResult: null,
      mode,
      level: 1,
      lastLevel: 1,
      timeRemaining: BLITZ_DURATION,
      timerRunning: mode === 'blitz',
      zenLinesCleared: 0,
      dailySeed: seed,
      dailyMovesLeft: 15,
      dailyObjective: 8,
      dailyLinesCleared: 0,
    });
  },

  tryPlacePiece: (pieceIndex: number, row: number, col: number) => {
    if (placementLock) return false;
    placementLock = true;

    try {
      const { grid, currentPieces, score, streak, mode, dailyMovesLeft, dailyLinesCleared, dailySeed, zenLinesCleared } = get();
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
      if (allPlaced) {
        if (mode === 'daily') {
          // Generate seeded pieces for consistency
          const pieceSetIndex = Math.floor(score / 100) + 1;
          finalPieces = generateSeededPieces(dailySeed, pieceSetIndex);
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
      }

      if (mode === 'zen') {
        updates.zenLinesCleared = zenLinesCleared + clearResult.linesCleared;
      }

      set(updates as any);

      // Check game over after state update
      queueMicrotask(() => get().checkGameOver());

      return true;
    } finally {
      placementLock = false;
    }
  },

  checkGameOver: () => {
    const { grid, currentPieces, mode, dailyMovesLeft, dailyObjective, dailyLinesCleared, timeRemaining } = get();

    // Zen mode: never game over from pieces, do partial clear instead
    if (mode === 'zen') {
      const remainingPieces = currentPieces
        .filter((p): p is GamePiece => p !== null)
        .map((p) => p.piece);
      if (remainingPieces.length > 0 && isGameOver(grid, remainingPieces)) {
        get().zenPartialClear();
      }
      return;
    }

    // Daily mode: game over when no moves left
    if (mode === 'daily') {
      if (dailyMovesLeft <= 0) {
        set({ isGameOver: true });
      }
      return;
    }

    // Blitz mode: game over when time runs out (handled by tickTimer)
    if (mode === 'blitz' && timeRemaining <= 0) {
      set({ isGameOver: true, timerRunning: false });
      return;
    }

    // Classic & Blitz: standard game over check
    const remainingPieces = currentPieces
      .filter((p): p is GamePiece => p !== null)
      .map((p) => p.piece);

    if (remainingPieces.length > 0 && isGameOver(grid, remainingPieces)) {
      set({ isGameOver: true, timerRunning: false });
    }
  },

  applyBombToGrid: (row, col) => {
    const { grid } = get();
    const newGrid = applyBomb(grid, row, col);
    set({ grid: newGrid });
    queueMicrotask(() => get().checkGameOver());
  },

  applyClearLineToGrid: (row) => {
    const { grid } = get();
    const newGrid = applyClearRow(grid, row);
    set({ grid: newGrid });
    queueMicrotask(() => get().checkGameOver());
  },

  rotatePieceInTray: (pieceIndex) => {
    const { currentPieces } = get();
    const gamePiece = currentPieces[pieceIndex];
    if (!gamePiece) return;
    const rotatedPiece = rotatePiece(gamePiece.piece);
    const newPieces = [...currentPieces];
    newPieces[pieceIndex] = { ...gamePiece, piece: rotatedPiece };
    set({ currentPieces: newPieces });
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
    const { grid } = get();
    // Clear bottom 3 rows to give player breathing room
    const newGrid = grid.map((row, rowIndex) => {
      if (rowIndex >= 7) return row.map(() => 0);
      return [...row];
    });
    set({ grid: newGrid });
  },
}));
