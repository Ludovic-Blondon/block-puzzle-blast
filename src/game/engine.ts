import { GRID_SIZE } from '../constants/config';
import { PieceShape, getPieceHeight, getPieceWidth } from './pieces';

// Grid cell: 0 = empty, positive number = color index (1-8)
export type Grid = number[][];

export interface ClearResult {
  grid: Grid;
  linesCleared: number;
  cellsCleared: number;
  clearedRows: number[];
  clearedCols: number[];
}

export function createEmptyGrid(): Grid {
  return Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => 0)
  );
}

export function canPlacePiece(
  grid: Grid,
  piece: PieceShape,
  row: number,
  col: number
): boolean {
  const height = getPieceHeight(piece);
  const width = getPieceWidth(piece);

  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      if (piece.shape[r][c] === 0) continue;

      const gridRow = row + r;
      const gridCol = col + c;

      // Out of bounds
      if (gridRow < 0 || gridRow >= GRID_SIZE || gridCol < 0 || gridCol >= GRID_SIZE) {
        return false;
      }

      // Cell already occupied
      if (grid[gridRow][gridCol] !== 0) {
        return false;
      }
    }
  }

  return true;
}

export function placePiece(
  grid: Grid,
  piece: PieceShape,
  row: number,
  col: number,
  colorIndex: number
): Grid {
  const newGrid = grid.map((r) => [...r]);
  const height = getPieceHeight(piece);
  const width = getPieceWidth(piece);

  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      if (piece.shape[r][c] === 1) {
        newGrid[row + r][col + c] = colorIndex;
      }
    }
  }

  return newGrid;
}

export function findCompletedLines(grid: Grid): { rows: number[]; cols: number[] } {
  const rows: number[] = [];
  const cols: number[] = [];

  // Check rows
  for (let r = 0; r < GRID_SIZE; r++) {
    if (grid[r].every((cell) => cell !== 0)) {
      rows.push(r);
    }
  }

  // Check columns
  for (let c = 0; c < GRID_SIZE; c++) {
    let complete = true;
    for (let r = 0; r < GRID_SIZE; r++) {
      if (grid[r][c] === 0) {
        complete = false;
        break;
      }
    }
    if (complete) {
      cols.push(c);
    }
  }

  return { rows, cols };
}

export function clearLines(grid: Grid): ClearResult {
  const { rows, cols } = findCompletedLines(grid);
  const totalLines = rows.length + cols.length;

  if (totalLines === 0) {
    return {
      grid,
      linesCleared: 0,
      cellsCleared: 0,
      clearedRows: [],
      clearedCols: [],
    };
  }

  const newGrid = grid.map((r) => [...r]);
  let cellsCleared = 0;

  // Clear completed rows
  for (const r of rows) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (newGrid[r][c] !== 0) {
        newGrid[r][c] = 0;
        cellsCleared++;
      }
    }
  }

  // Clear completed columns
  for (const c of cols) {
    for (let r = 0; r < GRID_SIZE; r++) {
      if (newGrid[r][c] !== 0) {
        newGrid[r][c] = 0;
        cellsCleared++;
      }
    }
  }

  return {
    grid: newGrid,
    linesCleared: totalLines,
    cellsCleared,
    clearedRows: rows,
    clearedCols: cols,
  };
}

export function canPlaceAnyPiece(grid: Grid, pieces: PieceShape[]): boolean {
  for (const piece of pieces) {
    const height = getPieceHeight(piece);
    const width = getPieceWidth(piece);
    for (let r = 0; r <= GRID_SIZE - height; r++) {
      for (let c = 0; c <= GRID_SIZE - width; c++) {
        if (canPlacePiece(grid, piece, r, c)) {
          return true;
        }
      }
    }
  }
  return false;
}

export function isGameOver(grid: Grid, pieces: PieceShape[]): boolean {
  // Filter out already-placed pieces (null entries)
  const remainingPieces = pieces.filter(Boolean);
  if (remainingPieces.length === 0) return false;
  return !canPlaceAnyPiece(grid, remainingPieces);
}
