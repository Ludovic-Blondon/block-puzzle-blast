import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DAILY_REWARD_COINS } from '../constants/config';
import { PowerUpType, POWERUP_COSTS } from '../constants/config';

interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: number;
}

interface PlayerState {
  coins: number;
  bestScore: number;
  gamesPlayed: number;
  totalLinesCleared: number;
  lastDailyReward: string | null;
  dailyRewardsClaimed: number;
  maxComboLines: number;
  powerUps: Record<PowerUpType, number>;
  achievements: Achievement[];
  loaded: boolean;

  // Actions
  loadData: () => Promise<void>;
  saveData: () => Promise<void>;
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  updateBestScore: (score: number) => void;
  incrementGamesPlayed: () => void;
  addLinesCleared: (lines: number) => void;
  claimDailyReward: () => boolean;
  canClaimDailyReward: () => boolean;
  buyPowerUp: (type: PowerUpType) => boolean;
  usePowerUp: (type: PowerUpType) => boolean;
  updateMaxComboLines: (linesCleared: number) => void;
  checkAchievements: () => void;
}

const STORAGE_KEY = 'block_puzzle_blast_player';

// Debounced save to avoid race conditions on rapid AsyncStorage writes
let saveTimeout: ReturnType<typeof setTimeout> | null = null;
function debouncedSave(saveFn: () => Promise<void>) {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveFn();
    saveTimeout = null;
  }, 300);
}

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_game', name: 'First Steps', description: 'Play your first game', unlocked: false },
  { id: 'score_1000', name: 'Getting Warmed Up', description: 'Score 1,000 points', unlocked: false },
  { id: 'score_5000', name: 'Puzzle Master', description: 'Score 5,000 points', unlocked: false },
  { id: 'score_10000', name: 'Block Legend', description: 'Score 10,000 points', unlocked: false },
  { id: 'first_combo', name: 'Combo Starter', description: 'Clear 2+ lines at once', unlocked: false },
  { id: 'triple_combo', name: 'Triple Threat', description: 'Clear 3+ lines at once', unlocked: false },
  { id: 'lines_50', name: 'Line Destroyer', description: 'Clear 50 total lines', unlocked: false },
  { id: 'lines_200', name: 'Line Annihilator', description: 'Clear 200 total lines', unlocked: false },
  { id: 'games_10', name: 'Regular Player', description: 'Play 10 games', unlocked: false },
  { id: 'games_50', name: 'Dedicated', description: 'Play 50 games', unlocked: false },
  { id: 'coins_500', name: 'Coin Collector', description: 'Accumulate 500 coins', unlocked: false },
  { id: 'daily_3', name: 'Daily Devotee', description: 'Claim 3 daily rewards', unlocked: false },
];

export const usePlayerStore = create<PlayerState>((set, get) => ({
  coins: 0,
  bestScore: 0,
  gamesPlayed: 0,
  totalLinesCleared: 0,
  lastDailyReward: null,
  dailyRewardsClaimed: 0,
  maxComboLines: 0,
  powerUps: { bomb: 0, clearLine: 0, rotate: 0 },
  achievements: DEFAULT_ACHIEVEMENTS,
  loaded: false,

  loadData: async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        set({
          coins: parsed.coins ?? 0,
          bestScore: parsed.bestScore ?? 0,
          gamesPlayed: parsed.gamesPlayed ?? 0,
          totalLinesCleared: parsed.totalLinesCleared ?? 0,
          lastDailyReward: parsed.lastDailyReward ?? null,
          dailyRewardsClaimed: parsed.dailyRewardsClaimed ?? 0,
          maxComboLines: parsed.maxComboLines ?? 0,
          powerUps: parsed.powerUps ?? { bomb: 0, clearLine: 0, rotate: 0 },
          achievements: parsed.achievements ?? DEFAULT_ACHIEVEMENTS,
          loaded: true,
        });
      } else {
        set({ loaded: true });
      }
    } catch {
      set({ loaded: true });
    }
  },

  saveData: async () => {
    const { coins, bestScore, gamesPlayed, totalLinesCleared, lastDailyReward, dailyRewardsClaimed, maxComboLines, powerUps, achievements } = get();
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ coins, bestScore, gamesPlayed, totalLinesCleared, lastDailyReward, dailyRewardsClaimed, maxComboLines, powerUps, achievements })
      );
    } catch {
      // Silent fail
    }
  },

  addCoins: (amount) => {
    set((state) => ({ coins: state.coins + amount }));
    get().checkAchievements();
  },

  spendCoins: (amount) => {
    const { coins } = get();
    if (coins < amount) return false;
    set({ coins: coins - amount });
    debouncedSave(() => get().saveData());
    return true;
  },

  updateBestScore: (score) => {
    const { bestScore } = get();
    if (score > bestScore) {
      set({ bestScore: score });
    }
    get().checkAchievements();
  },

  incrementGamesPlayed: () => {
    set((state) => ({ gamesPlayed: state.gamesPlayed + 1 }));
    get().checkAchievements();
  },

  addLinesCleared: (lines) => {
    set((state) => ({ totalLinesCleared: state.totalLinesCleared + lines }));
    get().checkAchievements();
  },

  canClaimDailyReward: () => {
    const { lastDailyReward } = get();
    if (!lastDailyReward) return true;
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    return lastDailyReward !== today;
  },

  claimDailyReward: () => {
    if (!get().canClaimDailyReward()) return false;
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    set((state) => ({
      coins: state.coins + DAILY_REWARD_COINS,
      lastDailyReward: today,
      dailyRewardsClaimed: state.dailyRewardsClaimed + 1,
    }));
    get().checkAchievements();
    return true;
  },

  buyPowerUp: (type) => {
    const cost = POWERUP_COSTS[type];
    if (!get().spendCoins(cost)) return false;
    set((state) => ({
      powerUps: {
        ...state.powerUps,
        [type]: state.powerUps[type] + 1,
      },
    }));
    debouncedSave(() => get().saveData());
    return true;
  },

  usePowerUp: (type) => {
    const { powerUps } = get();
    if (powerUps[type] <= 0) return false;
    set((state) => ({
      powerUps: {
        ...state.powerUps,
        [type]: state.powerUps[type] - 1,
      },
    }));
    debouncedSave(() => get().saveData());
    return true;
  },

  updateMaxComboLines: (linesCleared) => {
    const { maxComboLines } = get();
    if (linesCleared > maxComboLines) {
      set({ maxComboLines: linesCleared });
      get().checkAchievements();
    }
  },

  checkAchievements: () => {
    const state = get();
    const achievements = [...state.achievements];
    let changed = false;

    const unlock = (id: string) => {
      const idx = achievements.findIndex((x) => x.id === id);
      if (idx !== -1 && !achievements[idx].unlocked) {
        achievements[idx] = { ...achievements[idx], unlocked: true, unlockedAt: Date.now() };
        changed = true;
      }
    };

    if (state.gamesPlayed >= 1) unlock('first_game');
    if (state.bestScore >= 1000) unlock('score_1000');
    if (state.bestScore >= 5000) unlock('score_5000');
    if (state.bestScore >= 10000) unlock('score_10000');
    if (state.totalLinesCleared >= 50) unlock('lines_50');
    if (state.totalLinesCleared >= 200) unlock('lines_200');
    if (state.gamesPlayed >= 10) unlock('games_10');
    if (state.gamesPlayed >= 50) unlock('games_50');
    if (state.coins >= 500) unlock('coins_500');
    if (state.maxComboLines >= 2) unlock('first_combo');
    if (state.maxComboLines >= 3) unlock('triple_combo');
    if (state.dailyRewardsClaimed >= 3) unlock('daily_3');

    if (changed) {
      set({ achievements });
    }
    debouncedSave(() => get().saveData());
  },
}));
