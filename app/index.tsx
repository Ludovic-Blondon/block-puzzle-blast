import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePlayerStore } from '../src/store/playerStore';
import { COLORS } from '../src/utils/colors';
import { MODE_CONFIGS, GameMode, getLevelForXP } from '../src/constants/config';
import DailyReward from '../src/components/DailyReward';
import MissionPanel from '../src/components/MissionPanel';
import { hapticMedium } from '../src/utils/haptics';

const MODES: GameMode[] = ['classic', 'blitz', 'zen', 'daily'];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const {
    bestScore,
    coins,
    xp,
    loaded,
    canClaimDailyReward,
    claimDailyReward,
    hasCompletedTutorial,
  } = usePlayerStore();
  const [showDailyReward, setShowDailyReward] = useState(false);
  const [selectedMode, setSelectedMode] = useState<GameMode>('classic');

  const headerAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const playScaleAnim = useRef(new Animated.Value(0.85)).current;
  const playPressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.stagger(200, [
      Animated.spring(headerAnim, { toValue: 1, useNativeDriver: true }),
      Animated.spring(contentAnim, { toValue: 1, useNativeDriver: true }),
    ]).start();

    Animated.spring(playScaleAnim, {
      toValue: 1,
      friction: 6,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (loaded && canClaimDailyReward()) {
      setTimeout(() => setShowDailyReward(true), 500);
    }
  }, [loaded]);

  // Auto-redirect to tutorial on first launch
  useEffect(() => {
    if (loaded && !hasCompletedTutorial) {
      router.push('/tutorial');
    }
  }, [loaded, hasCompletedTutorial]);

  const handlePlayMode = (mode: GameMode) => {
    hapticMedium();
    if (mode === 'classic') router.push('/game');
    else if (mode === 'blitz') router.push('/blitz');
    else if (mode === 'zen') router.push('/zen');
    else if (mode === 'daily') router.push('/daily');
  };

  const handleShop = () => {
    hapticMedium();
    router.push('/shop');
  };

  const handleAchievements = () => {
    hapticMedium();
    router.push('/achievements');
  };

  const handleLeaderboard = () => {
    hapticMedium();
    router.push('/leaderboard');
  };

  const handleClaimDailyReward = () => {
    claimDailyReward();
    setShowDailyReward(false);
  };

  const fadeSlideDown = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [-30, 0],
        }),
      },
    ],
  });

  const handlePlayPressIn = () => {
    Animated.spring(playPressAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePlayPressOut = () => {
    Animated.spring(playPressAnim, {
      toValue: 1,
      friction: 3,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const levelInfo = getLevelForXP(xp);
  const xpProgress = levelInfo.xpNext > 0 ? Math.min(levelInfo.xpCurrent / levelInfo.xpNext, 1) : 1;
  const selectedConfig = MODE_CONFIGS[selectedMode];

  return (
    <LinearGradient
      colors={[COLORS.background, COLORS.backgroundLight, COLORS.background]}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 60 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View style={[styles.header, fadeSlideDown(headerAnim)]}>
          <Text style={styles.title}>BLOCK</Text>
          <Text style={styles.titleAccent}>PUZZLE BLAST</Text>
        </Animated.View>

        {/* Compact stat strip */}
        <View style={styles.statStrip}>
          <View style={styles.statStripSection}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>{levelInfo.level}</Text>
            </View>
            <View style={styles.levelInfo}>
              <Text style={styles.levelTitle}>{levelInfo.title}</Text>
              <View style={styles.miniXPBar}>
                <View style={[styles.miniXPFill, { width: `${xpProgress * 100}%` }]} />
              </View>
            </View>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statStripItem}>
            <Text style={styles.statStripLabel}>BEST</Text>
            <Text style={styles.statStripValue}>{bestScore.toLocaleString()}</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statStripItem}>
            <Text style={styles.statStripLabel}>COINS</Text>
            <Text style={[styles.statStripValue, { color: COLORS.accentGold }]}>{coins}</Text>
          </View>
        </View>

        {/* Hero Play button */}
        <Animated.View style={[styles.playButtonWrapper, { transform: [{ scale: Animated.multiply(playScaleAnim, playPressAnim) }] }]}>
          <Pressable
            style={styles.playButton}
            onPress={() => handlePlayMode(selectedMode)}
            onPressIn={handlePlayPressIn}
            onPressOut={handlePlayPressOut}
            accessibilityRole="button"
            accessibilityLabel={`Play ${selectedConfig.name} mode`}
          >
            <Text style={styles.playButtonText}>PLAY</Text>
            <Text style={styles.playButtonSubtext}>{selectedConfig.name}</Text>
          </Pressable>
        </Animated.View>

        {/* Horizontal mode selector */}
        <Animated.View style={[styles.modeSection, fadeSlideDown(contentAnim)]}>
          <Text style={styles.modeSectionLabel}>GAME MODES</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.modeScrollContent}
          >
            {MODES.map((mode) => {
              const config = MODE_CONFIGS[mode];
              const isSelected = mode === selectedMode;
              return (
                <Pressable
                  key={mode}
                  style={({ pressed }) => [
                    styles.modePill,
                    isSelected && [styles.modePillSelected, { borderColor: config.color, shadowColor: config.color }],
                    pressed && styles.modePillPressed,
                  ]}
                  onPress={() => setSelectedMode(mode)}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${config.name} mode`}
                >
                  <Text style={styles.modePillIcon}>{config.icon}</Text>
                  <Text style={[styles.modePillName, isSelected && { color: config.color }]}>
                    {config.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Animated.View>

        {/* Missions */}
        <MissionPanel />
      </ScrollView>

      {/* Fixed bottom navigation bar */}
      <View style={[styles.bottomNav, { paddingBottom: insets.bottom + 8 }]}>
        <Pressable
          style={({ pressed }) => [styles.navButton, pressed && styles.navButtonPressed]}
          onPress={handleShop}
          accessibilityRole="button"
          accessibilityLabel="Open shop"
        >
          <Text style={styles.navIcon}>🛒</Text>
          <Text style={styles.navText}>SHOP</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.navButton, pressed && styles.navButtonPressed]}
          onPress={handleAchievements}
          accessibilityRole="button"
          accessibilityLabel="View achievements"
        >
          <Text style={styles.navIcon}>🏆</Text>
          <Text style={styles.navText}>ACHIEVEMENTS</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.navButton, pressed && styles.navButtonPressed]}
          onPress={handleLeaderboard}
          accessibilityRole="button"
          accessibilityLabel="View leaderboard"
        >
          <Text style={styles.navIcon}>📊</Text>
          <Text style={styles.navText}>SCORES</Text>
        </Pressable>
      </View>

      <DailyReward visible={showDailyReward} onClaim={handleClaimDailyReward} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 12,
  },
  titleAccent: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.accent,
    letterSpacing: 6,
    marginTop: -2,
    opacity: 0.8,
  },

  // Compact stat strip
  statStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 52, 96, 0.5)',
    borderRadius: 20,
    marginHorizontal: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 24,
  },
  statStripSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  levelBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  levelBadgeText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '800',
  },
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 3,
  },
  miniXPBar: {
    height: 4,
    backgroundColor: COLORS.gridLine,
    borderRadius: 2,
    overflow: 'hidden',
  },
  miniXPFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    marginHorizontal: 12,
  },
  statStripItem: {
    alignItems: 'center',
  },
  statStripLabel: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 2,
  },
  statStripValue: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
  },

  // Hero Play button
  playButtonWrapper: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  playButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  playButtonText: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 4,
  },
  playButtonSubtext: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 2,
  },

  // Mode selector
  modeSection: {
    marginBottom: 24,
  },
  modeSectionLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    marginLeft: 24,
    marginBottom: 10,
  },
  modeScrollContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  modePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: 140,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  modePillSelected: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  modePillPressed: {
    opacity: 0.7,
  },
  modePillIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  modePillName: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1,
  },

  // Fixed bottom nav
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: 'rgba(26, 26, 46, 0.92)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 8,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    gap: 3,
  },
  navButtonPressed: {
    opacity: 0.6,
  },
  navIcon: {
    fontSize: 22,
  },
  navText: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
  },
});
