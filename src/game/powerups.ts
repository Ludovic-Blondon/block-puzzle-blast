import { Grid } from './engine';
import { PieceShape } from './pieces';
import { GRID_SIZE } from '../constants/config';
import { PowerUpType, POWERUP_COSTS } from '../constants/config';

export function applyBomb(grid: Grid, centerRow: number, centerCol: number): Grid {
  const newGrid = grid.map((r) => [...r]);
  for (let r = centerRow - 1; r <= centerRow + 1; r++) {
    for (let c = centerCol - 1; c <= centerCol + 1; c++) {
      if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
        newGrid[r][c] = 0;
      }
    }
  }
  return newGrid;
}

export function applyClearRow(grid: Grid, row: number): Grid {
  const newGrid = grid.map((r) => [...r]);
  for (let c = 0; c < GRID_SIZE; c++) {
    newGrid[row][c] = 0;
  }
  return newGrid;
}

export function applyClearColumn(grid: Grid, col: number): Grid {
  const newGrid = grid.map((r) => [...r]);
  for (let r = 0; r < GRID_SIZE; r++) {
    newGrid[r][col] = 0;
  }
  return newGrid;
}

export function rotatePiece(piece: PieceShape): PieceShape {
  const rows = piece.shape.length;
  const cols = piece.shape[0].length;
  const rotated: number[][] = [];

  for (let c = 0; c < cols; c++) {
    const newRow: number[] = [];
    for (let r = rows - 1; r >= 0; r--) {
      newRow.push(piece.shape[r][c]);
    }
    rotated.push(newRow);
  }

  return {
    ...piece,
    shape: rotated,
  };
}

export function getPowerUpCost(type: PowerUpType): number {
  return POWERUP_COSTS[type];
}
