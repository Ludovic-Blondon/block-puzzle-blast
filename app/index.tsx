import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePlayerStore } from '../src/store/playerStore';
import { COLORS } from '../src/utils/colors';
import { MODE_CONFIGS, GameMode } from '../src/constants/config';
import DailyReward from '../src/components/DailyReward';
import XPBar from '../src/components/XPBar';
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

  const headerAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(200, [
      Animated.spring(headerAnim, { toValue: 1, useNativeDriver: true }),
      Animated.spring(contentAnim, { toValue: 1, useNativeDriver: true }),
    ]).start();
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

  return (
    <LinearGradient
      colors={[COLORS.background, COLORS.backgroundLight, COLORS.background]}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.header, fadeSlideDown(headerAnim)]}>
          <Text style={styles.title}>BLOCK</Text>
          <Text style={styles.titleAccent}>PUZZLE BLAST</Text>
        </Animated.View>

        {/* XP Bar */}
        <XPBar xp={xp} />

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>BEST</Text>
            <Text style={styles.statValue}>{bestScore.toLocaleString()}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>COINS</Text>
            <Text style={[styles.statValue, styles.coinsText]}>{coins}</Text>
          </View>
        </View>

        {/* Game mode grid */}
        <Animated.View style={[styles.modeGrid, fadeSlideDown(contentAnim)]}>
          {MODES.map((mode) => {
            const config = MODE_CONFIGS[mode];
            return (
              <Pressable
                key={mode}
                style={[styles.modeCard, { borderColor: config.color }]}
                onPress={() => handlePlayMode(mode)}
                accessibilityRole="button"
                accessibilityLabel={`Play ${config.name} mode`}
              >
                <Text style={styles.modeIcon}>{config.icon}</Text>
                <Text style={[styles.modeName, { color: config.color }]}>{config.name}</Text>
                <Text style={styles.modeDesc}>{config.description}</Text>
              </Pressable>
            );
          })}
        </Animated.View>

        {/* Missions */}
        <MissionPanel />

        {/* Bottom buttons */}
        <View style={styles.bottomButtons}>
          <Pressable style={styles.navButton} onPress={handleShop} accessibilityRole="button" accessibilityLabel="Open shop">
            <Text style={styles.navIcon}>🛒</Text>
            <Text style={styles.navText}>SHOP</Text>
          </Pressable>

          <Pressable style={styles.navButton} onPress={handleAchievements} accessibilityRole="button" accessibilityLabel="View achievements">
            <Text style={styles.navIcon}>🏆</Text>
            <Text style={styles.navText}>ACHIEVEMENTS</Text>
          </Pressable>

          <Pressable style={styles.navButton} onPress={handleLeaderboard} accessibilityRole="button" accessibilityLabel="View leaderboard">
            <Text style={styles.navIcon}>📊</Text>
            <Text style={styles.navText}>SCORES</Text>
          </Pressable>
        </View>
      </ScrollView>

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
    alignItems: 'center',
    paddingBottom: 40,
    paddingTop: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 8,
  },
  titleAccent: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.accent,
    letterSpacing: 4,
    marginTop: -4,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  statBox: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
    minWidth: 110,
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  statValue: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '900',
    marginTop: 2,
  },
  coinsText: {
    color: COLORS.accentGold,
  },
  modeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  modeCard: {
    width: '45%',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  modeIcon: {
    fontSize: 32,
    marginBottom: 6,
  },
  modeName: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  modeDesc: {
    color: COLORS.textMuted,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
  },
  bottomButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
  },
  navButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    gap: 4,
  },
  navIcon: {
    fontSize: 20,
  },
  navText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
