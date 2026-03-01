import {
  POINTS_PER_LINE,
  POINTS_PER_CELL,
  COMBO_MULTIPLIER_BASE,
  STREAK_BONUS,
} from '../constants/config';

export interface ScoreResult {
  points: number;
  comboMultiplier: number;
  isCombo: boolean;
  coinsEarned: number;
}

export function calculateScore(
  linesCleared: number,
  cellsCleared: number,
  currentStreak: number
): ScoreResult {
  if (linesCleared === 0) {
    return {
      points: 0,
      comboMultiplier: 1,
      isCombo: false,
      coinsEarned: 0,
    };
  }

  // Base score: points per line + bonus per cell cleared
  const baseScore = linesCleared * POINTS_PER_LINE + cellsCleared * POINTS_PER_CELL;

  // Combo multiplier: clearing multiple lines at once
  const comboMultiplier = COMBO_MULTIPLIER_BASE + (linesCleared - 1) * 0.5;

  // Streak bonus: consecutive moves that clear lines
  const streakMultiplier = 1 + currentStreak * 0.1;

  const isCombo = linesCleared >= 2;
  const points = Math.floor(baseScore * comboMultiplier * streakMultiplier);

  // Coins: 1 coin per line cleared, bonus for combos
  const coinsEarned = linesCleared + (isCombo ? linesCleared : 0);

  return {
    points,
    comboMultiplier,
    isCombo,
    coinsEarned,
  };
}

export function getComboText(linesCleared: number): string {
  switch (linesCleared) {
    case 2: return 'DOUBLE!';
    case 3: return 'TRIPLE!';
    case 4: return 'QUAD!';
    default:
      if (linesCleared >= 5) return 'INSANE!';
      return '';
  }
}

export function getStreakText(streak: number): string {
  if (streak >= 10) return 'UNSTOPPABLE!';
  if (streak >= 7) return 'ON FIRE!';
  if (streak >= 5) return 'AMAZING!';
  if (streak >= 3) return 'GREAT!';
  return '';
}
