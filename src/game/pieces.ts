// Each piece is defined as a 2D array of 0s and 1s
// 1 = filled cell, 0 = empty cell
export interface PieceShape {
  id: string;
  shape: number[][];
  name: string;
}

export const PIECES: PieceShape[] = [
  // Single
  { id: 'dot', name: 'Dot', shape: [[1]] },

  // Lines
  { id: 'h2', name: 'Line 2H', shape: [[1, 1]] },
  { id: 'h3', name: 'Line 3H', shape: [[1, 1, 1]] },
  { id: 'h4', name: 'Line 4H', shape: [[1, 1, 1, 1]] },
  { id: 'h5', name: 'Line 5H', shape: [[1, 1, 1, 1, 1]] },
  { id: 'v2', name: 'Line 2V', shape: [[1], [1]] },
  { id: 'v3', name: 'Line 3V', shape: [[1], [1], [1]] },
  { id: 'v4', name: 'Line 4V', shape: [[1], [1], [1], [1]] },
  { id: 'v5', name: 'Line 5V', shape: [[1], [1], [1], [1], [1]] },

  // Squares
  { id: 'sq2', name: 'Square 2x2', shape: [[1, 1], [1, 1]] },
  { id: 'sq3', name: 'Square 3x3', shape: [[1, 1, 1], [1, 1, 1], [1, 1, 1]] },

  // L-shapes
  {
    id: 'l1', name: 'L Right',
    shape: [[1, 0], [1, 0], [1, 1]],
  },
  {
    id: 'l2', name: 'L Left',
    shape: [[0, 1], [0, 1], [1, 1]],
  },
  {
    id: 'l3', name: 'L Up-Right',
    shape: [[1, 1], [1, 0], [1, 0]],
  },
  {
    id: 'l4', name: 'L Up-Left',
    shape: [[1, 1], [0, 1], [0, 1]],
  },

  // T-shapes
  {
    id: 't1', name: 'T Down',
    shape: [[1, 1, 1], [0, 1, 0]],
  },
  {
    id: 't2', name: 'T Up',
    shape: [[0, 1, 0], [1, 1, 1]],
  },
  {
    id: 't3', name: 'T Right',
    shape: [[1, 0], [1, 1], [1, 0]],
  },
  {
    id: 't4', name: 'T Left',
    shape: [[0, 1], [1, 1], [0, 1]],
  },

  // Z-shapes
  {
    id: 'z1', name: 'Z Right',
    shape: [[1, 1, 0], [0, 1, 1]],
  },
  {
    id: 'z2', name: 'Z Left',
    shape: [[0, 1, 1], [1, 1, 0]],
  },
  {
    id: 'z3', name: 'Z Down',
    shape: [[1, 0], [1, 1], [0, 1]],
  },
  {
    id: 'z4', name: 'Z Up',
    shape: [[0, 1], [1, 1], [1, 0]],
  },

  // Corner pieces (small L)
  {
    id: 'c1', name: 'Corner BR',
    shape: [[1, 0], [1, 1]],
  },
  {
    id: 'c2', name: 'Corner BL',
    shape: [[0, 1], [1, 1]],
  },
  {
    id: 'c3', name: 'Corner TR',
    shape: [[1, 1], [1, 0]],
  },
  {
    id: 'c4', name: 'Corner TL',
    shape: [[1, 1], [0, 1]],
  },
];

export function getRandomPiece(): PieceShape {
  return PIECES[Math.floor(Math.random() * PIECES.length)];
}

export function getRandomPieces(count: number): PieceShape[] {
  const pieces: PieceShape[] = [];
  for (let i = 0; i < count; i++) {
    pieces.push(getRandomPiece());
  }
  return pieces;
}

export function getPieceWidth(piece: PieceShape): number {
  return piece.shape[0].length;
}

export function getPieceHeight(piece: PieceShape): number {
  return piece.shape.length;
}
