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

// Game modes
export type GameMode = 'classic' | 'blitz' | 'zen' | 'daily';

export const BLITZ_DURATION = 60; // seconds
export const BLITZ_COMBO_TIME_BONUS = 3; // seconds per combo

// Level system
export const LEVEL_THRESHOLD = 500; // points per level in classic mode

// XP system
export const XP_PER_POINT = 0.1; // XP earned per score point
export const XP_BLITZ_MULTIPLIER = 1.5;
export const XP_DAILY_BONUS = 50;

export const XP_LEVELS: { level: number; xpRequired: number; title: string }[] = [
  { level: 1, xpRequired: 0, title: 'Beginner' },
  { level: 2, xpRequired: 100, title: 'Beginner' },
  { level: 3, xpRequired: 250, title: 'Beginner' },
  { level: 4, xpRequired: 500, title: 'Beginner' },
  { level: 5, xpRequired: 800, title: 'Novice' },
  { level: 6, xpRequired: 1200, title: 'Novice' },
  { level: 7, xpRequired: 1700, title: 'Novice' },
  { level: 8, xpRequired: 2300, title: 'Novice' },
  { level: 9, xpRequired: 3000, title: 'Novice' },
  { level: 10, xpRequired: 4000, title: 'Apprentice' },
  { level: 15, xpRequired: 7500, title: 'Skilled' },
  { level: 20, xpRequired: 12000, title: 'Expert' },
  { level: 25, xpRequired: 18000, title: 'Master' },
  { level: 30, xpRequired: 25000, title: 'Grand Master' },
  { level: 40, xpRequired: 40000, title: 'Champion' },
  { level: 50, xpRequired: 60000, title: 'Legend' },
  { level: 60, xpRequired: 85000, title: 'Legend' },
  { level: 70, xpRequired: 115000, title: 'Mythic' },
  { level: 80, xpRequired: 150000, title: 'Mythic' },
  { level: 90, xpRequired: 200000, title: 'Supreme' },
  { level: 100, xpRequired: 300000, title: 'Absolute Master' },
];

export function getLevelForXP(xp: number): { level: number; title: string; xpCurrent: number; xpNext: number } {
  let currentLevel = XP_LEVELS[0];
  let nextLevel = XP_LEVELS[1];

  for (let i = XP_LEVELS.length - 1; i >= 0; i--) {
    if (xp >= XP_LEVELS[i].xpRequired) {
      currentLevel = XP_LEVELS[i];
      nextLevel = XP_LEVELS[i + 1] || XP_LEVELS[i];
      break;
    }
  }

  return {
    level: currentLevel.level,
    title: currentLevel.title,
    xpCurrent: xp - currentLevel.xpRequired,
    xpNext: nextLevel.xpRequired - currentLevel.xpRequired,
  };
}

// Daily rewards (7-day escalating)
export const DAILY_REWARDS = [
  { day: 1, coins: 50, powerUp: null },
  { day: 2, coins: 75, powerUp: null },
  { day: 3, coins: 100, powerUp: null },
  { day: 4, coins: 125, powerUp: null },
  { day: 5, coins: 175, powerUp: 'rotate' as PowerUpType },
  { day: 6, coins: 250, powerUp: null },
  { day: 7, coins: 500, powerUp: 'bomb' as PowerUpType },
];

// Mode configs
export const MODE_CONFIGS: Record<GameMode, { name: string; icon: string; color: string; description: string }> = {
  classic: { name: 'Classic', icon: '🎮', color: '#e94560', description: 'Classic block puzzle' },
  blitz: { name: 'Blitz', icon: '⚡', color: '#f59e0b', description: '60 seconds to score big' },
  zen: { name: 'Zen', icon: '🧘', color: '#22c55e', description: 'Relax, no game over' },
  daily: { name: 'Daily', icon: '📅', color: '#a855f7', description: 'Daily challenge for all' },
};
