import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore, GamePiece } from '../gameStore';
import { PIECES, getSeededRandomPieces } from '../../game/pieces';
import { createEmptyGrid, canPlaceAnyPiece, Grid } from '../../game/engine';
import { GRID_SIZE } from '../../constants/config';

function gamePiece(id: string): GamePiece {
  return { piece: PIECES.find((p) => p.id === id)!, colorIndex: 1, placed: false };
}

function fullGrid(): Grid {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(1));
}

describe('gameStore', () => {
  beforeEach(() => {
    useGameStore.getState().startNewGame('classic');
  });

  describe('daily mode', () => {
    beforeEach(() => {
      useGameStore.getState().startNewGame('daily');
    });

    it('ends the game when no piece fits, even with moves left', () => {
      useGameStore.setState({ grid: fullGrid(), currentPieces: [gamePiece('sq3'), null, null] });
      useGameStore.getState().checkGameOver();

      const state = useGameStore.getState();
      expect(state.dailyMovesLeft).toBeGreaterThan(0);
      expect(state.isGameOver).toBe(true);
    });

    it('draws the next seeded set from the set counter, not from the score', () => {
      useGameStore.setState({ score: 999, currentPieces: [gamePiece('dot'), null, null] });
      expect(useGameStore.getState().tryPlacePiece(0, 0, 0)).toBe(true);

      const state = useGameStore.getState();
      const expected = getSeededRandomPieces(state.dailySeed, 1, 3).map((p) => p.id);
      expect(state.dailySetIndex).toBe(1);
      expect(state.currentPieces.map((p) => p?.piece.id)).toEqual(expected);
    });
  });

  describe('zen mode', () => {
    it('clears enough rows for a vertical 5-line to fit', () => {
      useGameStore.getState().startNewGame('zen');
      useGameStore.setState({ grid: fullGrid(), currentPieces: [gamePiece('v5'), null, null] });
      useGameStore.getState().checkGameOver();

      const { grid, isGameOver } = useGameStore.getState();
      expect(isGameOver).toBe(false);
      expect(canPlaceAnyPiece(grid, [gamePiece('v5').piece])).toBe(true);
      // Rows are only cleared as far as needed
      expect(grid[GRID_SIZE - 6].every((cell) => cell !== 0)).toBe(true);
    });
  });

  describe('classic mode stuck state', () => {
    it('flags the player as stuck instead of ending the game', () => {
      useGameStore.setState({ grid: fullGrid(), currentPieces: [gamePiece('dot'), null, null] });
      useGameStore.getState().checkGameOver();

      const state = useGameStore.getState();
      expect(state.isStuck).toBe(true);
      expect(state.isGameOver).toBe(false);
    });

    it('clears the stuck flag once a power-up frees space', () => {
      useGameStore.setState({ grid: fullGrid(), currentPieces: [gamePiece('dot'), null, null] });
      useGameStore.getState().checkGameOver();
      useGameStore.getState().applyBombToGrid(5, 5);

      expect(useGameStore.getState().isStuck).toBe(false);
    });

    it('re-checks after a rotation', () => {
      // Only column 0, rows 0-4 are free: a horizontal 5-line doesn't fit, a vertical one does
      const grid = fullGrid();
      for (let r = 0; r < 5; r++) grid[r][0] = 0;
      useGameStore.setState({ grid, currentPieces: [gamePiece('h5'), null, null] });
      useGameStore.getState().checkGameOver();
      expect(useGameStore.getState().isStuck).toBe(true);

      useGameStore.getState().rotatePieceInTray(0);
      expect(useGameStore.getState().isStuck).toBe(false);
    });

    it('endGame ends a stuck game', () => {
      useGameStore.setState({ grid: fullGrid(), currentPieces: [gamePiece('dot'), null, null] });
      useGameStore.getState().checkGameOver();
      useGameStore.getState().endGame();

      const state = useGameStore.getState();
      expect(state.isGameOver).toBe(true);
      expect(state.isStuck).toBe(false);
    });

    it('starts a new game unstuck', () => {
      useGameStore.setState({ grid: fullGrid(), isStuck: true });
      useGameStore.getState().startNewGame('classic');

      const state = useGameStore.getState();
      expect(state.isStuck).toBe(false);
      expect(state.grid).toEqual(createEmptyGrid());
    });
  });
});
