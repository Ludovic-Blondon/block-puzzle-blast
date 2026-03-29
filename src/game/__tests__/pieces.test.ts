import { describe, it, expect } from 'vitest';
import {
  PIECES,
  getRandomPiece,
  getRandomPieces,
  getSeededRandomPieces,
  getPieceWidth,
  getPieceHeight,
} from '../pieces';

describe('PIECES', () => {
  it('has 27 piece definitions', () => {
    expect(PIECES).toHaveLength(27);
  });

  it('each piece has id, name, and shape', () => {
    PIECES.forEach((p) => {
      expect(p.id).toBeTruthy();
      expect(p.name).toBeTruthy();
      expect(p.shape.length).toBeGreaterThan(0);
      expect(p.shape[0].length).toBeGreaterThan(0);
    });
  });
});

describe('getRandomPiece', () => {
  it('returns a valid piece from PIECES', () => {
    const piece = getRandomPiece();
    expect(PIECES).toContain(piece);
  });
});

describe('getRandomPieces', () => {
  it('returns correct count', () => {
    expect(getRandomPieces(3)).toHaveLength(3);
    expect(getRandomPieces(0)).toHaveLength(0);
  });

  it('all pieces are valid', () => {
    getRandomPieces(5).forEach((p) => expect(PIECES).toContain(p));
  });
});

describe('getSeededRandomPieces', () => {
  it('is deterministic for same seed', () => {
    const a = getSeededRandomPieces('test-seed', 0, 5);
    const b = getSeededRandomPieces('test-seed', 0, 5);
    expect(a.map((p) => p.id)).toEqual(b.map((p) => p.id));
  });

  it('produces different results for different seeds', () => {
    const a = getSeededRandomPieces('alpha-2026', 0, 10);
    const b = getSeededRandomPieces('zulu-9999', 0, 10);
    const same = a.every((p, i) => p.id === b[i].id);
    expect(same).toBe(false);
  });
});

describe('getPieceWidth / getPieceHeight', () => {
  const dot = PIECES.find((p) => p.id === 'dot')!;
  const h5 = PIECES.find((p) => p.id === 'h5')!;
  const v5 = PIECES.find((p) => p.id === 'v5')!;
  const sq3 = PIECES.find((p) => p.id === 'sq3')!;

  it('dot is 1x1', () => {
    expect(getPieceWidth(dot)).toBe(1);
    expect(getPieceHeight(dot)).toBe(1);
  });

  it('h5 is 5 wide, 1 tall', () => {
    expect(getPieceWidth(h5)).toBe(5);
    expect(getPieceHeight(h5)).toBe(1);
  });

  it('v5 is 1 wide, 5 tall', () => {
    expect(getPieceWidth(v5)).toBe(1);
    expect(getPieceHeight(v5)).toBe(5);
  });

  it('sq3 is 3x3', () => {
    expect(getPieceWidth(sq3)).toBe(3);
    expect(getPieceHeight(sq3)).toBe(3);
  });
});
