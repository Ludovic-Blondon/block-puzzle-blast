import { describe, it, expect } from 'vitest';
import { applyBomb, applyClearRow, applyClearColumn, rotatePiece, getPowerUpCost } from '../powerups';
import { createEmptyGrid, Grid } from '../engine';
import { PIECES, PieceShape } from '../pieces';
import { GRID_SIZE } from '../../constants/config';

function createFullGrid(): Grid {
  return Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => 1)
  );
}

const h3: PieceShape = PIECES.find((p) => p.id === 'h3')!;
const sq2: PieceShape = PIECES.find((p) => p.id === 'sq2')!;
const l1: PieceShape = PIECES.find((p) => p.id === 'l1')!;

describe('applyBomb', () => {
  it('clears 3x3 area at center', () => {
    const grid = createFullGrid();
    const result = applyBomb(grid, 5, 5);
    for (let r = 4; r <= 6; r++) {
      for (let c = 4; c <= 6; c++) {
        expect(result[r][c]).toBe(0);
      }
    }
    // Adjacent cells untouched
    expect(result[3][5]).toBe(1);
    expect(result[7][5]).toBe(1);
  });

  it('clips at corner (0,0)', () => {
    const grid = createFullGrid();
    const result = applyBomb(grid, 0, 0);
    expect(result[0][0]).toBe(0);
    expect(result[0][1]).toBe(0);
    expect(result[1][0]).toBe(0);
    expect(result[1][1]).toBe(0);
    // Outside 3x3 untouched
    expect(result[2][0]).toBe(1);
  });

  it('does not modify original grid', () => {
    const grid = createFullGrid();
    applyBomb(grid, 5, 5);
    expect(grid[5][5]).toBe(1);
  });
});

describe('applyClearRow', () => {
  it('clears entire row', () => {
    const grid = createFullGrid();
    const result = applyClearRow(grid, 3);
    result[3].forEach((cell) => expect(cell).toBe(0));
    expect(result[2][0]).toBe(1); // other rows untouched
  });

  it('returns unchanged grid for out of bounds', () => {
    const grid = createFullGrid();
    const result = applyClearRow(grid, -1);
    expect(result).toEqual(grid);
  });
});

describe('applyClearColumn', () => {
  it('clears entire column', () => {
    const grid = createFullGrid();
    const result = applyClearColumn(grid, 7);
    for (let r = 0; r < GRID_SIZE; r++) {
      expect(result[r][7]).toBe(0);
    }
    expect(result[0][6]).toBe(1); // other cols untouched
  });

  it('returns unchanged grid for out of bounds', () => {
    const grid = createFullGrid();
    const result = applyClearColumn(grid, 10);
    expect(result).toEqual(grid);
  });
});

describe('rotatePiece', () => {
  it('rotates horizontal line to vertical', () => {
    // h3 = [[1,1,1]] → rotated = [[1],[1],[1]]
    const rotated = rotatePiece(h3);
    expect(rotated.shape).toEqual([[1], [1], [1]]);
  });

  it('keeps square unchanged', () => {
    const rotated = rotatePiece(sq2);
    expect(rotated.shape).toEqual([[1, 1], [1, 1]]);
  });

  it('rotates L-shape correctly', () => {
    // l1 = [[1,0],[1,0],[1,1]] → 90° CW = [[1,1,1],[1,0,0]]
    const rotated = rotatePiece(l1);
    expect(rotated.shape).toEqual([[1, 1, 1], [1, 0, 0]]);
  });

  it('preserves id and name', () => {
    const rotated = rotatePiece(h3);
    expect(rotated.id).toBe(h3.id);
    expect(rotated.name).toBe(h3.name);
  });
});

describe('getPowerUpCost', () => {
  it('returns correct costs', () => {
    expect(getPowerUpCost('bomb')).toBe(200);
    expect(getPowerUpCost('clearLine')).toBe(150);
    expect(getPowerUpCost('rotate')).toBe(100);
  });
});
