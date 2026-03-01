export const COLORS = {
  background: '#1a1a2e',
  backgroundLight: '#16213e',
  surface: '#0f3460',
  surfaceLight: '#1a4a7a',
  grid: '#252545',
  gridLine: '#2a2a4a',
  cellEmpty: '#1e1e3a',

  // Block colors - vibrant and distinct
  block1: '#e94560', // Rose/Red
  block2: '#0ea5e9', // Sky blue
  block3: '#22c55e', // Green
  block4: '#f59e0b', // Amber
  block5: '#a855f7', // Purple
  block6: '#ec4899', // Pink
  block7: '#06b6d4', // Cyan
  block8: '#f97316', // Orange

  // UI colors
  text: '#ffffff',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  accent: '#e94560',
  accentGold: '#fbbf24',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',

  // Ghost/preview
  ghostValid: 'rgba(34, 197, 94, 0.3)',
  ghostInvalid: 'rgba(239, 68, 68, 0.3)',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.7)',
} as const;

export const BLOCK_COLORS = [
  COLORS.block1,
  COLORS.block2,
  COLORS.block3,
  COLORS.block4,
  COLORS.block5,
  COLORS.block6,
  COLORS.block7,
  COLORS.block8,
];
