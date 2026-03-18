export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  tier?: 'bronze' | 'silver' | 'gold';
  secret?: boolean;
}

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  // Score achievements
  { id: 'first_game', name: 'First Steps', description: 'Play your first game', tier: 'bronze' },
  { id: 'score_1000', name: 'Getting Warmed Up', description: 'Score 1,000 points', tier: 'bronze' },
  { id: 'score_5000', name: 'Puzzle Master', description: 'Score 5,000 points', tier: 'silver' },
  { id: 'score_10000', name: 'Block Legend', description: 'Score 10,000 points', tier: 'gold' },
  { id: 'score_25000', name: 'Score Machine', description: 'Score 25,000 points', tier: 'gold' },

  // Combo achievements
  { id: 'first_combo', name: 'Combo Starter', description: 'Clear 2+ lines at once', tier: 'bronze' },
  { id: 'triple_combo', name: 'Triple Threat', description: 'Clear 3+ lines at once', tier: 'silver' },
  { id: 'quad_combo', name: 'Quad Destroyer', description: 'Clear 4+ lines at once', tier: 'gold' },
  { id: 'insane_combo', name: 'INSANE!', description: 'Clear 5+ lines at once', tier: 'gold', secret: true },

  // Lines achievements
  { id: 'lines_50', name: 'Line Destroyer', description: 'Clear 50 total lines', tier: 'bronze' },
  { id: 'lines_200', name: 'Line Annihilator', description: 'Clear 200 total lines', tier: 'silver' },
  { id: 'lines_500', name: 'Line Obliterator', description: 'Clear 500 total lines', tier: 'gold' },
  { id: 'lines_1000', name: 'Line God', description: 'Clear 1,000 total lines', tier: 'gold' },

  // Games played
  { id: 'games_10', name: 'Regular Player', description: 'Play 10 games', tier: 'bronze' },
  { id: 'games_50', name: 'Dedicated', description: 'Play 50 games', tier: 'silver' },
  { id: 'games_100', name: 'Addicted', description: 'Play 100 games', tier: 'silver' },
  { id: 'games_500', name: 'Veteran', description: 'Play 500 games', tier: 'gold' },

  // Coins
  { id: 'coins_500', name: 'Coin Collector', description: 'Accumulate 500 coins', tier: 'bronze' },
  { id: 'coins_2000', name: 'Coin Hoarder', description: 'Accumulate 2,000 coins', tier: 'silver' },
  { id: 'coins_5000', name: 'Coin Baron', description: 'Accumulate 5,000 coins', tier: 'gold' },

  // Daily rewards
  { id: 'daily_3', name: 'Daily Devotee', description: 'Claim 3 daily rewards', tier: 'bronze' },
  { id: 'daily_7', name: 'Weekly Warrior', description: 'Complete a 7-day streak', tier: 'silver' },
  { id: 'daily_30', name: 'Monthly Maven', description: 'Claim 30 daily rewards', tier: 'gold' },

  // Streak achievements
  { id: 'streak_3', name: 'Hot Streak', description: '3 consecutive clears', tier: 'bronze' },
  { id: 'streak_5', name: 'On Fire', description: '5 consecutive clears', tier: 'silver' },
  { id: 'streak_10', name: 'Unstoppable', description: '10 consecutive clears', tier: 'gold', secret: true },

  // Level achievements
  { id: 'level_5', name: 'Rising Star', description: 'Reach level 5', tier: 'bronze' },
  { id: 'level_10', name: 'Apprentice', description: 'Reach level 10', tier: 'silver' },
  { id: 'level_25', name: 'Master', description: 'Reach level 25', tier: 'gold' },
  { id: 'level_50', name: 'Legend', description: 'Reach level 50', tier: 'gold' },

  // Mode-specific
  { id: 'blitz_1000', name: 'Speed Demon', description: 'Score 1,000 in Blitz mode', tier: 'silver' },
  { id: 'blitz_3000', name: 'Lightning Fast', description: 'Score 3,000 in Blitz mode', tier: 'gold' },
  { id: 'zen_100_lines', name: 'Inner Peace', description: 'Clear 100 lines in Zen mode', tier: 'silver' },
  { id: 'daily_complete', name: 'Daily Champion', description: 'Complete a daily challenge', tier: 'bronze' },
  { id: 'daily_10', name: 'Daily Dominator', description: 'Complete 10 daily challenges', tier: 'gold' },

  // Power-ups
  { id: 'powerup_first', name: 'Power Player', description: 'Use your first power-up', tier: 'bronze' },
  { id: 'powerup_10', name: 'Powered Up', description: 'Use 10 power-ups', tier: 'silver' },

  // Themes
  { id: 'theme_first', name: 'Fashion Sense', description: 'Buy your first theme', tier: 'bronze' },
  { id: 'theme_all', name: 'Collector', description: 'Own all themes', tier: 'gold', secret: true },

  // Missions
  { id: 'mission_first', name: 'Mission Possible', description: 'Complete your first mission', tier: 'bronze' },
  { id: 'mission_10', name: 'Mission Expert', description: 'Complete 10 missions', tier: 'silver' },
];

export function formatAchievementDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString();
}

export function getTierColor(tier: 'bronze' | 'silver' | 'gold'): string {
  switch (tier) {
    case 'bronze': return '#cd7f32';
    case 'silver': return '#c0c0c0';
    case 'gold': return '#fbbf24';
  }
}
