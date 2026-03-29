import { describe, it, expect } from 'vitest';
import { calculateScore, getComboText, getStreakText } from '../scoring';

describe('calculateScore', () => {
  it('returns zeros when no lines cleared', () => {
    const result = calculateScore(0, 0, 0);
    expect(result.points).toBe(0);
    expect(result.isCombo).toBe(false);
    expect(result.coinsEarned).toBe(0);
  });

  it('calculates single line without combo', () => {
    // baseScore = 1*100 + 10*10 = 200, combo = 1, streak = 1 → 200
    const result = calculateScore(1, 10, 0);
    expect(result.points).toBe(200);
    expect(result.isCombo).toBe(false);
    expect(result.comboMultiplier).toBe(1);
    expect(result.coinsEarned).toBe(1);
  });

  it('calculates combo with streak multiplier', () => {
    // baseScore = 4*100 + 40*10 = 800, combo = 1+(4-1)*0.5 = 2.5, streak = 1+5*0.1 = 1.5
    // points = floor(800 * 2.5 * 1.5) = floor(3000) = 3000
    const result = calculateScore(4, 40, 5);
    expect(result.points).toBe(3000);
    expect(result.isCombo).toBe(true);
    expect(result.comboMultiplier).toBe(2.5);
    expect(result.coinsEarned).toBe(8); // 4 + 4
  });

  it('awards bonus coins for combos', () => {
    const result = calculateScore(2, 20, 0);
    expect(result.coinsEarned).toBe(4); // 2 + 2
    expect(result.isCombo).toBe(true);
  });
});

describe('getComboText', () => {
  it('returns empty for 0 or 1 lines', () => {
    expect(getComboText(0)).toBe('');
    expect(getComboText(1)).toBe('');
  });

  it('returns correct key for each combo level', () => {
    expect(getComboText(2)).toBe('combo.double');
    expect(getComboText(3)).toBe('combo.triple');
    expect(getComboText(4)).toBe('combo.quad');
    expect(getComboText(5)).toBe('combo.insane');
    expect(getComboText(100)).toBe('combo.insane');
  });
});

describe('getStreakText', () => {
  it('returns empty below threshold', () => {
    expect(getStreakText(0)).toBe('');
    expect(getStreakText(2)).toBe('');
  });

  it('returns correct key for each streak tier', () => {
    expect(getStreakText(3)).toBe('streak.great');
    expect(getStreakText(5)).toBe('streak.amazing');
    expect(getStreakText(7)).toBe('streak.onFire');
    expect(getStreakText(10)).toBe('streak.unstoppable');
    expect(getStreakText(50)).toBe('streak.unstoppable');
  });
});
