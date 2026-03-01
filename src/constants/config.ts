export const GRID_SIZE = 10;
export const CELL_GAP = 2;

export const DAILY_REWARD_COINS = 50;
export const COMBO_MULTIPLIER_BASE = 1;
export const STREAK_BONUS = 10;
export const POINTS_PER_LINE = 100;
export const POINTS_PER_CELL = 10;

export const POWERUP_COSTS = {
  bomb: 200,
  clearLine: 150,
  rotate: 100,
} as const;

export type PowerUpType = keyof typeof POWERUP_COSTS;
