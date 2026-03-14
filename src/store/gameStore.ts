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
import { PieceShape, getRandomPieces } from '../game/pieces';
import { calculateScore, ScoreResult } from '../game/scoring';
import { BLOCK_COLORS } from '../utils/colors';
import { applyBomb, applyClearRow, rotatePiece } from '../game/powerups';

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

  // Actions
  startNewGame: () => void;
  tryPlacePiece: (pieceIndex: number, row: number, col: number) => boolean;
  checkGameOver: () => void;
  applyBombToGrid: (row: number, col: number) => void;
  applyClearLineToGrid: (row: number) => void;
  rotatePieceInTray: (pieceIndex: number) => void;
}

function generateNewPieces(): GamePiece[] {
  const pieces = getRandomPieces(3);
  return pieces.map((piece) => ({
    piece,
    colorIndex: Math.floor(Math.random() * BLOCK_COLORS.length) + 1,
    placed: false,
  }));
}

// Lock to prevent concurrent tryPlacePiece calls from corrupting the grid
let placementLock = false;

export const useGameStore = create<GameState>((set, get) => ({
  grid: createEmptyGrid(),
  currentPieces: generateNewPieces(),
  score: 0,
  streak: 0,
  isGameOver: false,
  lastClearResult: null,
  lastScoreResult: null,

  startNewGame: () => {
    set({
      grid: createEmptyGrid(),
      currentPieces: generateNewPieces(),
      score: 0,
      streak: 0,
      isGameOver: false,
      lastClearResult: null,
      lastScoreResult: null,
    });
  },

  tryPlacePiece: (pieceIndex: number, row: number, col: number) => {
    if (placementLock) return false;
    placementLock = true;

    try {
      const { grid, currentPieces, score, streak } = get();
      const gamePiece = currentPieces[pieceIndex];
      if (!gamePiece || gamePiece.placed) return false;

      if (!canPlacePiece(grid, gamePiece.piece, row, col)) return false;

      // Place the piece
      const newGrid = placePiece(grid, gamePiece.piece, row, col, gamePiece.colorIndex);

      // Check for completed lines
      const clearResult = clearLines(newGrid);

      // Calculate score
      const newStreak = clearResult.linesCleared > 0 ? streak + 1 : 0;
      const scoreResult = calculateScore(
        clearResult.linesCleared,
        clearResult.cellsCleared,
        newStreak
      );

      // Mark piece as placed
      const newPieces = [...currentPieces];
      newPieces[pieceIndex] = null;

      // Check if all pieces are placed -> generate new ones
      const allPlaced = newPieces.every((p) => p === null);
      const finalPieces = allPlaced ? generateNewPieces() : newPieces;

      set({
        grid: clearResult.grid,
        currentPieces: finalPieces,
        score: score + scoreResult.points,
        streak: newStreak,
        lastClearResult: clearResult,
        lastScoreResult: scoreResult,
      });

      // Check game over after state update
      queueMicrotask(() => get().checkGameOver());

      return true;
    } finally {
      placementLock = false;
    }
  },

  checkGameOver: () => {
    const { grid, currentPieces } = get();
    const remainingPieces = currentPieces
      .filter((p): p is GamePiece => p !== null)
      .map((p) => p.piece);

    if (remainingPieces.length > 0 && isGameOver(grid, remainingPieces)) {
      set({ isGameOver: true });
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
}));
