import { describe, it, expect } from 'vitest';
import {
  createEmptyGrid,
  canPlacePiece,
  placePiece,
  findCompletedLines,
  clearLines,
  canPlaceAnyPiece,
  isGameOver,
  Grid,
} from '../engine';
import { PIECES, PieceShape } from '../pieces';
import { GRID_SIZE } from '../../constants/config';

const dot: PieceShape = PIECES.find((p) => p.id === 'dot')!;
const h3: PieceShape = PIECES.find((p) => p.id === 'h3')!;
const sq2: PieceShape = PIECES.find((p) => p.id === 'sq2')!;
const sq3: PieceShape = PIECES.find((p) => p.id === 'sq3')!;

function createFullGrid(): Grid {
  return Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => 1)
  );
}

function fillRow(grid: Grid, row: number, color = 1): Grid {
  const g = grid.map((r) => [...r]);
  for (let c = 0; c < GRID_SIZE; c++) g[row][c] = color;
  return g;
}

function fillCol(grid: Grid, col: number, color = 1): Grid {
  const g = grid.map((r) => [...r]);
  for (let r = 0; r < GRID_SIZE; r++) g[r][col] = color;
  return g;
}

describe('createEmptyGrid', () => {
  it('returns a 10x10 grid', () => {
    const grid = createEmptyGrid();
    expect(grid).toHaveLength(GRID_SIZE);
    grid.forEach((row) => expect(row).toHaveLength(GRID_SIZE));
  });

  it('all cells are 0', () => {
    const grid = createEmptyGrid();
    grid.forEach((row) => row.forEach((cell) => expect(cell).toBe(0)));
  });
});

describe('canPlacePiece', () => {
  it('allows placement on empty grid', () => {
    const grid = createEmptyGrid();
    expect(canPlacePiece(grid, sq2, 0, 0)).toBe(true);
    expect(canPlacePiece(grid, h3, 5, 5)).toBe(true);
  });

  it('rejects out of bounds', () => {
    const grid = createEmptyGrid();
    expect(canPlacePiece(grid, sq2, 9, 9)).toBe(false);
    expect(canPlacePiece(grid, h3, 0, 8)).toBe(false);
  });

  it('rejects collision with occupied cell', () => {
    let grid = createEmptyGrid();
    grid = placePiece(grid, dot, 0, 0, 1);
    expect(canPlacePiece(grid, sq2, 0, 0)).toBe(false);
  });

  it('allows placement adjacent to occupied cell', () => {
    let grid = createEmptyGrid();
    grid = placePiece(grid, dot, 0, 0, 1);
    expect(canPlacePiece(grid, dot, 0, 1)).toBe(true);
  });
});

describe('placePiece', () => {
  it('sets correct color index', () => {
    const grid = createEmptyGrid();
    const result = placePiece(grid, sq2, 0, 0, 5);
    expect(result[0][0]).toBe(5);
    expect(result[0][1]).toBe(5);
    expect(result[1][0]).toBe(5);
    expect(result[1][1]).toBe(5);
  });

  it('does not modify original grid', () => {
    const grid = createEmptyGrid();
    placePiece(grid, dot, 0, 0, 3);
    expect(grid[0][0]).toBe(0);
  });

  it('does not overwrite cells outside piece shape', () => {
    const grid = createEmptyGrid();
    const result = placePiece(grid, dot, 5, 5, 2);
    expect(result[5][4]).toBe(0);
    expect(result[4][5]).toBe(0);
  });
});

describe('findCompletedLines', () => {
  it('detects a completed row', () => {
    const grid = fillRow(createEmptyGrid(), 3);
    const { rows, cols } = findCompletedLines(grid);
    expect(rows).toEqual([3]);
    expect(cols).toEqual([]);
  });

  it('detects a completed column', () => {
    const grid = fillCol(createEmptyGrid(), 7);
    const { rows, cols } = findCompletedLines(grid);
    expect(rows).toEqual([]);
    expect(cols).toEqual([7]);
  });

  it('detects both row and column', () => {
    let grid = fillRow(createEmptyGrid(), 3);
    grid = fillCol(grid, 5);
    const { rows, cols } = findCompletedLines(grid);
    expect(rows).toEqual([3]);
    expect(cols).toEqual([5]);
  });

  it('returns empty arrays for empty grid', () => {
    const { rows, cols } = findCompletedLines(createEmptyGrid());
    expect(rows).toEqual([]);
    expect(cols).toEqual([]);
  });
});

describe('clearLines', () => {
  it('clears a completed row', () => {
    const grid = fillRow(createEmptyGrid(), 5);
    const result = clearLines(grid);
    expect(result.linesCleared).toBe(1);
    expect(result.cellsCleared).toBe(GRID_SIZE);
    expect(result.clearedRows).toEqual([5]);
    result.grid[5].forEach((cell) => expect(cell).toBe(0));
  });

  it('handles row+col overlap correctly', () => {
    let grid = fillRow(createEmptyGrid(), 3);
    grid = fillCol(grid, 5);
    const result = clearLines(grid);
    expect(result.linesCleared).toBe(2);
    // Overlap cell (3,5) counted only once via the if-check
    expect(result.cellsCleared).toBe(GRID_SIZE + GRID_SIZE - 1);
  });

  it('returns original grid when no lines', () => {
    const grid = createEmptyGrid();
    const result = clearLines(grid);
    expect(result.linesCleared).toBe(0);
    expect(result.cellsCleared).toBe(0);
    expect(result.grid).toBe(grid); // same reference
  });
});

describe('canPlaceAnyPiece', () => {
  it('returns true on empty grid', () => {
    expect(canPlaceAnyPiece(createEmptyGrid(), [dot, h3])).toBe(true);
  });

  it('returns false on full grid', () => {
    expect(canPlaceAnyPiece(createFullGrid(), [dot])).toBe(false);
  });
});

describe('isGameOver', () => {
  it('returns true when no piece fits', () => {
    expect(isGameOver(createFullGrid(), [dot])).toBe(true);
  });

  it('returns false on empty grid', () => {
    expect(isGameOver(createEmptyGrid(), [sq3])).toBe(false);
  });

  it('returns false with empty pieces array', () => {
    expect(isGameOver(createFullGrid(), [])).toBe(false);
  });
});
