export interface MissionDefinition {
  id: string;
  type: 'daily' | 'weekly';
  description: string;
  target: number;
  rewardCoins: number;
  rewardXP: number;
  trackingKey: MissionTrackingKey;
}

export type MissionTrackingKey =
  | 'linesCleared'
  | 'gamesPlayed'
  | 'comboCount'
  | 'scoreAccumulated'
  | 'powerUpsUsed'
  | 'piecesPlaced';

// Pool of possible daily missions (3 will be picked each day)
export const DAILY_MISSION_POOL: MissionDefinition[] = [
  { id: 'd_lines_5', type: 'daily', description: 'Clear 5 lines', target: 5, rewardCoins: 30, rewardXP: 20, trackingKey: 'linesCleared' },
  { id: 'd_lines_10', type: 'daily', description: 'Clear 10 lines', target: 10, rewardCoins: 50, rewardXP: 35, trackingKey: 'linesCleared' },
  { id: 'd_lines_20', type: 'daily', description: 'Clear 20 lines', target: 20, rewardCoins: 80, rewardXP: 60, trackingKey: 'linesCleared' },
  { id: 'd_games_1', type: 'daily', description: 'Play 1 game', target: 1, rewardCoins: 20, rewardXP: 10, trackingKey: 'gamesPlayed' },
  { id: 'd_games_3', type: 'daily', description: 'Play 3 games', target: 3, rewardCoins: 40, rewardXP: 25, trackingKey: 'gamesPlayed' },
  { id: 'd_games_5', type: 'daily', description: 'Play 5 games', target: 5, rewardCoins: 60, rewardXP: 40, trackingKey: 'gamesPlayed' },
  { id: 'd_combo_1', type: 'daily', description: 'Get 1 combo', target: 1, rewardCoins: 25, rewardXP: 15, trackingKey: 'comboCount' },
  { id: 'd_combo_3', type: 'daily', description: 'Get 3 combos', target: 3, rewardCoins: 50, rewardXP: 35, trackingKey: 'comboCount' },
  { id: 'd_score_500', type: 'daily', description: 'Score 500 points', target: 500, rewardCoins: 30, rewardXP: 20, trackingKey: 'scoreAccumulated' },
  { id: 'd_score_1000', type: 'daily', description: 'Score 1,000 points', target: 1000, rewardCoins: 50, rewardXP: 35, trackingKey: 'scoreAccumulated' },
  { id: 'd_score_2000', type: 'daily', description: 'Score 2,000 points', target: 2000, rewardCoins: 80, rewardXP: 60, trackingKey: 'scoreAccumulated' },
  { id: 'd_powerup_1', type: 'daily', description: 'Use 1 power-up', target: 1, rewardCoins: 25, rewardXP: 15, trackingKey: 'powerUpsUsed' },
  { id: 'd_pieces_10', type: 'daily', description: 'Place 10 pieces', target: 10, rewardCoins: 25, rewardXP: 15, trackingKey: 'piecesPlaced' },
  { id: 'd_pieces_20', type: 'daily', description: 'Place 20 pieces', target: 20, rewardCoins: 40, rewardXP: 25, trackingKey: 'piecesPlaced' },
];

export const WEEKLY_MISSIONS: MissionDefinition[] = [
  { id: 'w_score_5000', type: 'weekly', description: 'Score 5,000 total points', target: 5000, rewardCoins: 200, rewardXP: 150, trackingKey: 'scoreAccumulated' },
  { id: 'w_lines_50', type: 'weekly', description: 'Clear 50 lines', target: 50, rewardCoins: 200, rewardXP: 150, trackingKey: 'linesCleared' },
  { id: 'w_powerup_5', type: 'weekly', description: 'Use 5 power-ups', target: 5, rewardCoins: 150, rewardXP: 100, trackingKey: 'powerUpsUsed' },
  { id: 'w_games_10', type: 'weekly', description: 'Play 10 games', target: 10, rewardCoins: 150, rewardXP: 100, trackingKey: 'gamesPlayed' },
];

// Deterministic daily mission selection based on date
export function getDailyMissions(dateStr: string): MissionDefinition[] {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash + dateStr.charCodeAt(i)) | 0;
  }
  hash = Math.abs(hash);

  const pool = [...DAILY_MISSION_POOL];
  const selected: MissionDefinition[] = [];

  for (let i = 0; i < 3 && pool.length > 0; i++) {
    const idx = (hash + i * 7) % pool.length;
    selected.push(pool[idx]);
    pool.splice(idx, 1);
  }

  return selected;
}

export function getWeeklyMissions(weekNumber: number): MissionDefinition[] {
  const start = (weekNumber * 2) % WEEKLY_MISSIONS.length;
  return [
    WEEKLY_MISSIONS[start % WEEKLY_MISSIONS.length],
    WEEKLY_MISSIONS[(start + 1) % WEEKLY_MISSIONS.length],
  ];
}
