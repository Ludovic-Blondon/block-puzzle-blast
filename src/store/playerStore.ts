import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DAILY_REWARDS, PowerUpType, POWERUP_COSTS, getLevelForXP, XP_PER_POINT, GameMode } from '../constants/config';
import { ACHIEVEMENT_DEFINITIONS, AchievementDefinition } from '../constants/achievements';
import { getDailyMissions, getWeeklyMissions, MissionDefinition, MissionTrackingKey } from '../constants/missions';
import { THEMES } from '../constants/themes';

interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: number;
  tier?: 'bronze' | 'silver' | 'gold';
  secret?: boolean;
}

export interface MissionProgress {
  id: string;
  progress: number;
  target: number;
  claimed: boolean;
}

interface LeaderboardEntry {
  score: number;
  date: string;
  mode: GameMode;
}

interface PlayerState {
  // Core stats
  coins: number;
  bestScore: number;
  bestScoreBlitz: number;
  gamesPlayed: number;
  totalLinesCleared: number;
  maxComboLines: number;
  maxStreak: number;
  totalPiecesPlaced: number;
  totalPowerUpsUsed: number;
  totalComboCount: number;
  totalScoreAccumulated: number;
  dailyChallengesCompleted: number;
  zenLinesCleared: number;

  // XP & Level
  xp: number;

  // Daily rewards (7-day streak)
  lastDailyReward: string | null;
  dailyRewardsClaimed: number;
  dailyStreak: number;

  // Missions
  dailyMissionsDate: string | null;
  dailyMissions: MissionProgress[];
  weeklyMissionsWeek: number;
  weeklyMissions: MissionProgress[];
  missionsCompleted: number;

  // Power-ups
  powerUps: Record<PowerUpType, number>;

  // Achievements
  achievements: Achievement[];
  pendingAchievementToast: { name: string; tier: 'bronze' | 'silver' | 'gold' } | null;

  // Themes
  ownedThemes: string[];
  activeTheme: string;

  // Tutorial
  hasCompletedTutorial: boolean;

  // Leaderboard
  leaderboard: LeaderboardEntry[];

  // Meta
  loaded: boolean;

  // Actions
  loadData: () => Promise<void>;
  saveData: () => Promise<void>;
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  updateBestScore: (score: number, mode?: GameMode) => void;
  incrementGamesPlayed: () => void;
  addLinesCleared: (lines: number) => void;
  addZenLines: (lines: number) => void;
  claimDailyReward: () => boolean;
  canClaimDailyReward: () => boolean;
  getDailyRewardDay: () => number;
  buyPowerUp: (type: PowerUpType) => boolean;
  usePowerUp: (type: PowerUpType) => boolean;
  updateMaxComboLines: (linesCleared: number) => void;
  updateMaxStreak: (streak: number) => void;
  addXP: (amount: number) => void;
  addScoreXP: (score: number, mode?: GameMode) => void;
  incrementPiecesPlaced: () => void;
  incrementPowerUpsUsed: () => void;
  incrementComboCount: () => void;
  addScoreAccumulated: (score: number) => void;
  incrementDailyChallengesCompleted: () => void;
  checkAchievements: () => void;
  dismissAchievementToast: () => void;
  refreshMissions: () => void;
  updateMissionProgress: (key: MissionTrackingKey, amount: number) => void;
  claimMission: (missionId: string, type: 'daily' | 'weekly') => boolean;
  buyTheme: (themeId: string) => boolean;
  setActiveTheme: (themeId: string) => void;
  completeTutorial: () => void;
  addLeaderboardEntry: (score: number, mode: GameMode) => void;
}

const STORAGE_KEY = 'block_puzzle_blast_player';

let saveTimeout: ReturnType<typeof setTimeout> | null = null;
function debouncedSave(saveFn: () => Promise<void>) {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveFn();
    saveTimeout = null;
  }, 300);
}

function buildAchievements(): Achievement[] {
  return ACHIEVEMENT_DEFINITIONS.map((def: AchievementDefinition) => ({
    id: def.id,
    name: def.name,
    description: def.description,
    unlocked: false,
    tier: def.tier,
    secret: def.secret,
  }));
}

function getTodayStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function getWeekNumber(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  return Math.ceil(((now.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7);
}

function isYesterday(dateStr: string): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
  return dateStr === yStr;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  coins: 0,
  bestScore: 0,
  bestScoreBlitz: 0,
  gamesPlayed: 0,
  totalLinesCleared: 0,
  maxComboLines: 0,
  maxStreak: 0,
  totalPiecesPlaced: 0,
  totalPowerUpsUsed: 0,
  totalComboCount: 0,
  totalScoreAccumulated: 0,
  dailyChallengesCompleted: 0,
  zenLinesCleared: 0,
  xp: 0,
  lastDailyReward: null,
  dailyRewardsClaimed: 0,
  dailyStreak: 0,
  dailyMissionsDate: null,
  dailyMissions: [],
  weeklyMissionsWeek: 0,
  weeklyMissions: [],
  missionsCompleted: 0,
  powerUps: { bomb: 0, clearLine: 0, rotate: 0 },
  achievements: buildAchievements(),
  pendingAchievementToast: null,
  ownedThemes: ['default'],
  activeTheme: 'default',
  hasCompletedTutorial: false,
  leaderboard: [],
  loaded: false,

  loadData: async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);

        // Merge saved achievements with current definitions (to add new ones)
        const savedAchievements: Achievement[] = parsed.achievements || [];
        const mergedAchievements = buildAchievements().map((def) => {
          const saved = savedAchievements.find((a: Achievement) => a.id === def.id);
          return saved ? { ...def, unlocked: saved.unlocked, unlockedAt: saved.unlockedAt } : def;
        });

        set({
          coins: parsed.coins ?? 0,
          bestScore: parsed.bestScore ?? 0,
          bestScoreBlitz: parsed.bestScoreBlitz ?? 0,
          gamesPlayed: parsed.gamesPlayed ?? 0,
          totalLinesCleared: parsed.totalLinesCleared ?? 0,
          maxComboLines: parsed.maxComboLines ?? 0,
          maxStreak: parsed.maxStreak ?? 0,
          totalPiecesPlaced: parsed.totalPiecesPlaced ?? 0,
          totalPowerUpsUsed: parsed.totalPowerUpsUsed ?? 0,
          totalComboCount: parsed.totalComboCount ?? 0,
          totalScoreAccumulated: parsed.totalScoreAccumulated ?? 0,
          dailyChallengesCompleted: parsed.dailyChallengesCompleted ?? 0,
          zenLinesCleared: parsed.zenLinesCleared ?? 0,
          xp: parsed.xp ?? 0,
          lastDailyReward: parsed.lastDailyReward ?? null,
          dailyRewardsClaimed: parsed.dailyRewardsClaimed ?? 0,
          dailyStreak: parsed.dailyStreak ?? 0,
          dailyMissionsDate: parsed.dailyMissionsDate ?? null,
          dailyMissions: parsed.dailyMissions ?? [],
          weeklyMissionsWeek: parsed.weeklyMissionsWeek ?? 0,
          weeklyMissions: parsed.weeklyMissions ?? [],
          missionsCompleted: parsed.missionsCompleted ?? 0,
          powerUps: parsed.powerUps ?? { bomb: 0, clearLine: 0, rotate: 0 },
          achievements: mergedAchievements,
          ownedThemes: parsed.ownedThemes ?? ['default'],
          activeTheme: parsed.activeTheme ?? 'default',
          hasCompletedTutorial: parsed.hasCompletedTutorial ?? false,
          leaderboard: parsed.leaderboard ?? [],
          loaded: true,
        });

        // Refresh missions after load
        get().refreshMissions();
      } else {
        set({ loaded: true });
        get().refreshMissions();
      }
    } catch {
      set({ loaded: true });
    }
  },

  saveData: async () => {
    const s = get();
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          coins: s.coins,
          bestScore: s.bestScore,
          bestScoreBlitz: s.bestScoreBlitz,
          gamesPlayed: s.gamesPlayed,
          totalLinesCleared: s.totalLinesCleared,
          maxComboLines: s.maxComboLines,
          maxStreak: s.maxStreak,
          totalPiecesPlaced: s.totalPiecesPlaced,
          totalPowerUpsUsed: s.totalPowerUpsUsed,
          totalComboCount: s.totalComboCount,
          totalScoreAccumulated: s.totalScoreAccumulated,
          dailyChallengesCompleted: s.dailyChallengesCompleted,
          zenLinesCleared: s.zenLinesCleared,
          xp: s.xp,
          lastDailyReward: s.lastDailyReward,
          dailyRewardsClaimed: s.dailyRewardsClaimed,
          dailyStreak: s.dailyStreak,
          dailyMissionsDate: s.dailyMissionsDate,
          dailyMissions: s.dailyMissions,
          weeklyMissionsWeek: s.weeklyMissionsWeek,
          weeklyMissions: s.weeklyMissions,
          missionsCompleted: s.missionsCompleted,
          powerUps: s.powerUps,
          achievements: s.achievements,
          ownedThemes: s.ownedThemes,
          activeTheme: s.activeTheme,
          hasCompletedTutorial: s.hasCompletedTutorial,
          leaderboard: s.leaderboard,
        })
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

  updateBestScore: (score, mode = 'classic') => {
    const state = get();
    if (mode === 'blitz') {
      if (score > state.bestScoreBlitz) {
        set({ bestScoreBlitz: score });
      }
    } else {
      if (score > state.bestScore) {
        set({ bestScore: score });
      }
    }
    get().checkAchievements();
  },

  incrementGamesPlayed: () => {
    set((state) => ({ gamesPlayed: state.gamesPlayed + 1 }));
    get().updateMissionProgress('gamesPlayed', 1);
    get().checkAchievements();
  },

  addLinesCleared: (lines) => {
    set((state) => ({ totalLinesCleared: state.totalLinesCleared + lines }));
    get().updateMissionProgress('linesCleared', lines);
    get().checkAchievements();
  },

  addZenLines: (lines) => {
    set((state) => ({ zenLinesCleared: state.zenLinesCleared + lines }));
  },

  canClaimDailyReward: () => {
    const { lastDailyReward } = get();
    if (!lastDailyReward) return true;
    return lastDailyReward !== getTodayStr();
  },

  getDailyRewardDay: () => {
    const { dailyStreak } = get();
    return (dailyStreak % 7) + 1;
  },

  claimDailyReward: () => {
    if (!get().canClaimDailyReward()) return false;
    const state = get();
    const today = getTodayStr();

    // Check if streak continues (claimed yesterday) or resets
    const streakContinues = state.lastDailyReward && isYesterday(state.lastDailyReward);
    const newStreak = streakContinues ? state.dailyStreak + 1 : 1;
    const rewardDay = ((newStreak - 1) % 7);
    const reward = DAILY_REWARDS[rewardDay];

    const updates: Partial<PlayerState> = {
      coins: state.coins + reward.coins,
      lastDailyReward: today,
      dailyRewardsClaimed: state.dailyRewardsClaimed + 1,
      dailyStreak: newStreak,
    };

    // Grant power-up if applicable
    if (reward.powerUp) {
      updates.powerUps = {
        ...state.powerUps,
        [reward.powerUp]: state.powerUps[reward.powerUp] + 1,
      };
    }

    set(updates as any);
    get().checkAchievements();
    debouncedSave(() => get().saveData());
    return true;
  },

  buyPowerUp: (type) => {
    const cost = POWERUP_COSTS[type];
    if (!get().spendCoins(cost)) return false;
    set((state) => ({
      powerUps: { ...state.powerUps, [type]: state.powerUps[type] + 1 },
    }));
    debouncedSave(() => get().saveData());
    return true;
  },

  usePowerUp: (type) => {
    const { powerUps } = get();
    if (powerUps[type] <= 0) return false;
    set((state) => ({
      powerUps: { ...state.powerUps, [type]: state.powerUps[type] - 1 },
    }));
    get().incrementPowerUpsUsed();
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

  updateMaxStreak: (streak) => {
    const { maxStreak } = get();
    if (streak > maxStreak) {
      set({ maxStreak: streak });
      get().checkAchievements();
    }
  },

  addXP: (amount) => {
    const oldXP = get().xp;
    const oldLevel = getLevelForXP(oldXP).level;
    const newXP = oldXP + amount;
    const newLevel = getLevelForXP(newXP).level;
    set({ xp: newXP });
    // Level-up check is handled by the game screen reading from the store
    if (newLevel > oldLevel) {
      get().checkAchievements();
    }
    debouncedSave(() => get().saveData());
  },

  addScoreXP: (score, mode = 'classic') => {
    const multiplier = mode === 'blitz' ? 1.5 : 1;
    const xpAmount = Math.floor(score * XP_PER_POINT * multiplier);
    if (xpAmount > 0) {
      get().addXP(xpAmount);
    }
  },

  incrementPiecesPlaced: () => {
    set((state) => ({ totalPiecesPlaced: state.totalPiecesPlaced + 1 }));
    get().updateMissionProgress('piecesPlaced', 1);
  },

  incrementPowerUpsUsed: () => {
    set((state) => ({ totalPowerUpsUsed: state.totalPowerUpsUsed + 1 }));
    get().updateMissionProgress('powerUpsUsed', 1);
    get().checkAchievements();
  },

  incrementComboCount: () => {
    set((state) => ({ totalComboCount: state.totalComboCount + 1 }));
    get().updateMissionProgress('comboCount', 1);
  },

  addScoreAccumulated: (score) => {
    set((state) => ({ totalScoreAccumulated: state.totalScoreAccumulated + score }));
    get().updateMissionProgress('scoreAccumulated', score);
  },

  incrementDailyChallengesCompleted: () => {
    set((state) => ({ dailyChallengesCompleted: state.dailyChallengesCompleted + 1 }));
    get().checkAchievements();
  },

  checkAchievements: () => {
    const state = get();
    const achievements = [...state.achievements];
    let changed = false;
    let lastUnlocked: { name: string; tier: 'bronze' | 'silver' | 'gold' } | null = null;

    const unlock = (id: string) => {
      const idx = achievements.findIndex((x) => x.id === id);
      if (idx !== -1 && !achievements[idx].unlocked) {
        achievements[idx] = { ...achievements[idx], unlocked: true, unlockedAt: Date.now() };
        lastUnlocked = { name: achievements[idx].name, tier: achievements[idx].tier || 'bronze' };
        changed = true;
      }
    };

    const lvl = getLevelForXP(state.xp).level;

    // Score
    if (state.gamesPlayed >= 1) unlock('first_game');
    if (state.bestScore >= 1000) unlock('score_1000');
    if (state.bestScore >= 5000) unlock('score_5000');
    if (state.bestScore >= 10000) unlock('score_10000');
    if (state.bestScore >= 25000) unlock('score_25000');

    // Combos
    if (state.maxComboLines >= 2) unlock('first_combo');
    if (state.maxComboLines >= 3) unlock('triple_combo');
    if (state.maxComboLines >= 4) unlock('quad_combo');
    if (state.maxComboLines >= 5) unlock('insane_combo');

    // Lines
    if (state.totalLinesCleared >= 50) unlock('lines_50');
    if (state.totalLinesCleared >= 200) unlock('lines_200');
    if (state.totalLinesCleared >= 500) unlock('lines_500');
    if (state.totalLinesCleared >= 1000) unlock('lines_1000');

    // Games
    if (state.gamesPlayed >= 10) unlock('games_10');
    if (state.gamesPlayed >= 50) unlock('games_50');
    if (state.gamesPlayed >= 100) unlock('games_100');
    if (state.gamesPlayed >= 500) unlock('games_500');

    // Coins
    if (state.coins >= 500) unlock('coins_500');
    if (state.coins >= 2000) unlock('coins_2000');
    if (state.coins >= 5000) unlock('coins_5000');

    // Daily
    if (state.dailyRewardsClaimed >= 3) unlock('daily_3');
    if (state.dailyStreak >= 7) unlock('daily_7');
    if (state.dailyRewardsClaimed >= 30) unlock('daily_30');

    // Streaks
    if (state.maxStreak >= 3) unlock('streak_3');
    if (state.maxStreak >= 5) unlock('streak_5');
    if (state.maxStreak >= 10) unlock('streak_10');

    // Levels
    if (lvl >= 5) unlock('level_5');
    if (lvl >= 10) unlock('level_10');
    if (lvl >= 25) unlock('level_25');
    if (lvl >= 50) unlock('level_50');

    // Blitz
    if (state.bestScoreBlitz >= 1000) unlock('blitz_1000');
    if (state.bestScoreBlitz >= 3000) unlock('blitz_3000');

    // Zen
    if (state.zenLinesCleared >= 100) unlock('zen_100_lines');

    // Daily challenges
    if (state.dailyChallengesCompleted >= 1) unlock('daily_complete');
    if (state.dailyChallengesCompleted >= 10) unlock('daily_10');

    // Power-ups
    if (state.totalPowerUpsUsed >= 1) unlock('powerup_first');
    if (state.totalPowerUpsUsed >= 10) unlock('powerup_10');

    // Themes
    if (state.ownedThemes.length >= 2) unlock('theme_first');
    if (state.ownedThemes.length >= THEMES.length) unlock('theme_all');

    // Missions
    if (state.missionsCompleted >= 1) unlock('mission_first');
    if (state.missionsCompleted >= 10) unlock('mission_10');

    if (changed) {
      set({ achievements, pendingAchievementToast: lastUnlocked });
    }
    debouncedSave(() => get().saveData());
  },

  dismissAchievementToast: () => {
    set({ pendingAchievementToast: null });
  },

  refreshMissions: () => {
    const state = get();
    const today = getTodayStr();
    const week = getWeekNumber();

    const updates: Partial<PlayerState> = {};

    // Refresh daily missions if new day
    if (state.dailyMissionsDate !== today) {
      const dailyDefs = getDailyMissions(today);
      updates.dailyMissionsDate = today;
      updates.dailyMissions = dailyDefs.map((d: MissionDefinition) => ({
        id: d.id,
        progress: 0,
        target: d.target,
        claimed: false,
      }));
    }

    // Refresh weekly missions if new week
    if (state.weeklyMissionsWeek !== week) {
      const weeklyDefs = getWeeklyMissions(week);
      updates.weeklyMissionsWeek = week;
      updates.weeklyMissions = weeklyDefs.map((d: MissionDefinition) => ({
        id: d.id,
        progress: 0,
        target: d.target,
        claimed: false,
      }));
    }

    if (Object.keys(updates).length > 0) {
      set(updates as any);
      debouncedSave(() => get().saveData());
    }
  },

  updateMissionProgress: (key, amount) => {
    const state = get();
    const allDaily = [...(getDailyMissions(state.dailyMissionsDate || getTodayStr()))];
    const allWeekly = [...getWeeklyMissions(state.weeklyMissionsWeek || getWeekNumber())];

    let dailyChanged = false;
    const newDaily = state.dailyMissions.map((m) => {
      const def = allDaily.find((d) => d.id === m.id);
      if (def && def.trackingKey === key && !m.claimed) {
        dailyChanged = true;
        return { ...m, progress: Math.min(m.progress + amount, m.target) };
      }
      return m;
    });

    let weeklyChanged = false;
    const newWeekly = state.weeklyMissions.map((m) => {
      const def = allWeekly.find((d) => d.id === m.id);
      if (def && def.trackingKey === key && !m.claimed) {
        weeklyChanged = true;
        return { ...m, progress: Math.min(m.progress + amount, m.target) };
      }
      return m;
    });

    if (dailyChanged || weeklyChanged) {
      set({
        dailyMissions: dailyChanged ? newDaily : state.dailyMissions,
        weeklyMissions: weeklyChanged ? newWeekly : state.weeklyMissions,
      });
      debouncedSave(() => get().saveData());
    }
  },

  claimMission: (missionId, type) => {
    const state = get();
    const allDaily = getDailyMissions(state.dailyMissionsDate || getTodayStr());
    const allWeekly = getWeeklyMissions(state.weeklyMissionsWeek || getWeekNumber());

    if (type === 'daily') {
      const idx = state.dailyMissions.findIndex((m) => m.id === missionId);
      if (idx === -1) return false;
      const mission = state.dailyMissions[idx];
      if (mission.claimed || mission.progress < mission.target) return false;

      const def = allDaily.find((d) => d.id === missionId);
      if (!def) return false;

      const newMissions = [...state.dailyMissions];
      newMissions[idx] = { ...mission, claimed: true };

      set({
        dailyMissions: newMissions,
        coins: state.coins + def.rewardCoins,
        missionsCompleted: state.missionsCompleted + 1,
      });
      get().addXP(def.rewardXP);
      get().checkAchievements();
    } else {
      const idx = state.weeklyMissions.findIndex((m) => m.id === missionId);
      if (idx === -1) return false;
      const mission = state.weeklyMissions[idx];
      if (mission.claimed || mission.progress < mission.target) return false;

      const def = allWeekly.find((d) => d.id === missionId);
      if (!def) return false;

      const newMissions = [...state.weeklyMissions];
      newMissions[idx] = { ...mission, claimed: true };

      set({
        weeklyMissions: newMissions,
        coins: state.coins + def.rewardCoins,
        missionsCompleted: state.missionsCompleted + 1,
      });
      get().addXP(def.rewardXP);
      get().checkAchievements();
    }

    debouncedSave(() => get().saveData());
    return true;
  },

  buyTheme: (themeId) => {
    const state = get();
    if (state.ownedThemes.includes(themeId)) return false;
    const theme = THEMES.find((t) => t.id === themeId);
    if (!theme) return false;
    if (!state.spendCoins(theme.price)) return false;

    set({ ownedThemes: [...state.ownedThemes, themeId] });
    get().checkAchievements();
    debouncedSave(() => get().saveData());
    return true;
  },

  setActiveTheme: (themeId) => {
    const { ownedThemes } = get();
    if (!ownedThemes.includes(themeId)) return;
    set({ activeTheme: themeId });
    debouncedSave(() => get().saveData());
  },

  completeTutorial: () => {
    set({ hasCompletedTutorial: true });
    debouncedSave(() => get().saveData());
  },

  addLeaderboardEntry: (score, mode) => {
    const state = get();
    const today = getTodayStr();
    const entry: LeaderboardEntry = { score, date: today, mode };
    const updated = [...state.leaderboard, entry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 30); // Keep top 30 across all modes
    set({ leaderboard: updated });
    debouncedSave(() => get().saveData());
  },
}));
