# MASTERPLAN TODO - Block Puzzle Blast

## PHASE 1 — LE JUICE (Game Feel) [Priority 1]

### 1.1 — Audio
- [x] Create `src/audio/SoundManager.ts` singleton
- [x] Create placeholder sound files in `assets/sounds/`
- [x] Integrate SoundManager calls in game flow (game.tsx, blitz.tsx, daily.tsx, shop.tsx)
- [ ] Replace placeholder sounds with real SFX
- [ ] Add background music loop

### 1.2 — Particles & Visual Effects
- [x] Create `src/components/effects/ParticleSystem.tsx`
- [x] Create `src/components/effects/ScreenShake.tsx` — integrated in game.tsx & blitz.tsx
- [x] Create `src/components/effects/ScoreFlyUp.tsx` — integrated in game.tsx & blitz.tsx
- [x] Create `src/components/effects/AchievementToast.tsx` — integrated in game.tsx & blitz.tsx
- [x] Create `src/components/effects/LevelUpBanner.tsx` — integrated in game.tsx
- [ ] Integrate ParticleSystem in Grid on line clears (needs grid position tracking)

### 1.3 — Haptics
- [x] Enhanced haptic patterns (basic haptics already in place)
- [ ] Combo-specific haptic crescendo patterns

---

## PHASE 2 — MODES DE JEU [Priority 4]

### 2.1 — Classic Mode Enhanced
- [x] Level system (every 500 points) — in gameStore + game.tsx
- [x] Level-up visual feedback — LevelUpBanner component

### 2.2 — Blitz Mode
- [x] Create `app/blitz.tsx` with full gameplay
- [x] 60-second timer with urgency visuals (BlitzTimer component)
- [x] Combo time bonus (+3s per combo)

### 2.3 — Zen Mode
- [x] Create `app/zen.tsx` with full gameplay
- [x] No game over logic (partial grid clear when stuck)
- [x] Green relaxing color palette
- [x] Line counter instead of score

### 2.4 — Daily Challenge
- [x] Create `app/daily.tsx` with full gameplay
- [x] Seed-based RNG for same puzzle for all players
- [x] Objectives (clear X lines in Y moves)
- [ ] Daily calendar UI (separate from daily rewards)

### 2.5 — Navigation
- [x] Home screen redesign with mode selection grid
- [x] Mode icons and distinct colors

---

## PHASE 3 — PROGRESSION & RETENTION [Priority 3]

### 3.1 — XP / Level System
- [x] Add XP levels config in `src/constants/config.ts` (20 levels, Beginner → Absolute Master)
- [x] Add `xp` field to `playerStore.ts` with `addXP`, `addScoreXP` actions
- [x] XP bar on home screen (XPBar component)
- [ ] Level-up rewards (free power-ups at milestones)

### 3.2 — Daily Rewards (Escalating)
- [x] Define 7-day escalating reward schedule (50→500 coins + power-ups)
- [x] Refactor `playerStore.ts` for daily streak with reset logic
- [x] Refactor `DailyReward.tsx` with 7-day calendar visualization

### 3.3 — Missions
- [x] Create `src/constants/missions.ts` (14 daily pool + 4 weekly)
- [x] Create mission tracking in playerStore (auto-refresh, progress, claim)
- [x] Mission UI on home screen (MissionPanel component)

### 3.4 — Achievements Extended
- [x] Expand from 12 to 40 achievements with tiers (bronze/silver/gold) + secrets
- [x] Update `playerStore.ts` achievement checking (XP, streaks, modes, themes, missions)
- [x] In-game toast notification on unlock (AchievementToast)
- [x] Updated achievements screen with tiers, sorting, secret achievements

---

## PHASE 4 — SOCIAL & VIRALITE [Priority 6]

### 4.1 — Score Sharing
- [x] Share button on GameOver modal
- [ ] Score image generation with `react-native-view-shot` (text sharing works)
- [x] expo-sharing integration

### 4.2 — Local Leaderboard
- [x] Top 10 per mode stored in playerStore (AsyncStorage)
- [x] Leaderboard screen `app/leaderboard.tsx` with mode tabs

---

## PHASE 5 — PERSONNALISATION & SHOP [Priority 5]

### 5.1 — Themes
- [x] Create `src/constants/themes.ts` with 8 themes (Midnight, Neon, Ocean, Forest, Sunset, Retro, Galaxy, Candy)
- [x] Theme context/provider (`src/utils/ThemeContext.tsx`)
- [ ] Apply theme colors dynamically in Grid, Cell, and all components (using useTheme hook)

### 5.2 — Shop Extended
- [x] Refactor `app/shop.tsx` with tabs (Power-ups | Themes)
- [x] Theme preview (4-color swatch) & purchase with level gating
- [x] Theme select/activate

---

## PHASE 6 — ONBOARDING [Priority 2]

### 6.1 — Tutorial
- [x] Create `app/tutorial.tsx` with 6 guided steps
- [x] Auto-launch on first play
- [x] `hasCompletedTutorial` in playerStore
- [x] Skip option + step indicators

### 6.2 — Tips
- [ ] Rotating tips on home screen

---

## PHASE 7 — POLISH TECHNIQUE [Priority 7]

### 7.1 — Reanimated Migration
- [x] Install `react-native-reanimated` + `react-native-gesture-handler`
- [ ] Migrate critical animations from Animated to Reanimated worklets

### 7.2 — Render Optimizations
- [x] `React.memo` on Cell.tsx (already done)
- [ ] Ghost preview memoization with useMemo
- [ ] Batch state updates in gameStore

### 7.3 — Splash & Loading
- [x] Splash screen with `expo-splash-screen` (already done)

---

## Summary

| Phase | Status | Completion |
|-------|--------|-----------|
| Phase 1 — Juice | ~80% | Audio integrated, effects built & wired, particles need grid integration |
| Phase 2 — Game Modes | ~90% | All 4 modes playable, daily calendar UI pending |
| Phase 3 — Progression | ~90% | XP, missions, daily streak, 40 achievements all working |
| Phase 4 — Social | ~70% | Sharing & leaderboard done, image gen pending |
| Phase 5 — Themes | ~70% | 8 themes defined, shop & purchase done, dynamic apply pending |
| Phase 6 — Onboarding | ~80% | Tutorial done, tips pending |
| Phase 7 — Polish | ~20% | Deps installed, migration pending |
