import {
  POINTS_PER_LINE,
  POINTS_PER_CELL,
  COMBO_MULTIPLIER_BASE,
  STREAK_BONUS,
} from '../constants/config';
import i18n from '../locales/i18n';

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
  const streakMultiplier = 1 + currentStreak * (STREAK_BONUS / 100);

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
    case 2: return i18n.t('combo.double');
    case 3: return i18n.t('combo.triple');
    case 4: return i18n.t('combo.quad');
    default:
      if (linesCleared >= 5) return i18n.t('combo.insane');
      return '';
  }
}

export function getStreakText(streak: number): string {
  if (streak >= 10) return i18n.t('streak.unstoppable');
  if (streak >= 7) return i18n.t('streak.onFire');
  if (streak >= 5) return i18n.t('streak.amazing');
  if (streak >= 3) return i18n.t('streak.great');
  return '';
}
