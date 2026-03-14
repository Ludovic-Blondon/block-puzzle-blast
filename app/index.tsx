import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { usePlayerStore } from '../src/store/playerStore';
import { COLORS } from '../src/utils/colors';
import DailyReward from '../src/components/DailyReward';
import { hapticMedium } from '../src/utils/haptics';

export default function HomeScreen() {
  const { bestScore, coins, loaded, canClaimDailyReward, claimDailyReward } = usePlayerStore();
  const [showDailyReward, setShowDailyReward] = useState(false);

  const headerAnim = useRef(new Animated.Value(0)).current;
  const statsAnim = useRef(new Animated.Value(0)).current;
  const buttonsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(200, [
      Animated.spring(headerAnim, { toValue: 1, useNativeDriver: true }),
      Animated.spring(statsAnim, { toValue: 1, useNativeDriver: true }),
      Animated.spring(buttonsAnim, { toValue: 1, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (loaded && canClaimDailyReward()) {
      setTimeout(() => setShowDailyReward(true), 500);
    }
  }, [loaded]);

  const handlePlay = () => {
    hapticMedium();
    router.push('/game');
  };

  const handleShop = () => {
    hapticMedium();
    router.push('/shop');
  };

  const handleAchievements = () => {
    hapticMedium();
    router.push('/achievements');
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

  const fadeSlideUp = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [30, 0],
        }),
      },
    ],
  });

  return (
    <LinearGradient
      colors={[COLORS.background, COLORS.backgroundLight, COLORS.background]}
      style={styles.container}
    >
      <Animated.View style={[styles.header, fadeSlideDown(headerAnim)]}>
        <Text style={styles.title}>BLOCK</Text>
        <Text style={styles.titleAccent}>PUZZLE BLAST</Text>
      </Animated.View>

      <Animated.View style={[styles.statsContainer, fadeSlideDown(statsAnim)]}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>BEST SCORE</Text>
          <Text style={styles.statValue}>{bestScore.toLocaleString()}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>COINS</Text>
          <Text style={[styles.statValue, styles.coinsText]}>{coins}</Text>
        </View>
      </Animated.View>

      <Animated.View style={[styles.buttonContainer, fadeSlideUp(buttonsAnim)]}>
        <Pressable style={styles.playButton} onPress={handlePlay} accessibilityRole="button" accessibilityLabel="Play game">
          <Text style={styles.playButtonText}>PLAY</Text>
        </Pressable>

        <View style={styles.secondaryButtons}>
          <Pressable style={styles.secondaryButton} onPress={handleShop} accessibilityRole="button" accessibilityLabel="Open shop">
            <Text style={styles.secondaryIcon}>🛒</Text>
            <Text style={styles.secondaryText}>SHOP</Text>
          </Pressable>

          <Pressable style={styles.secondaryButton} onPress={handleAchievements} accessibilityRole="button" accessibilityLabel="View achievements">
            <Text style={styles.secondaryIcon}>🏆</Text>
            <Text style={styles.secondaryText}>ACHIEVEMENTS</Text>
          </Pressable>
        </View>
      </Animated.View>

      <DailyReward visible={showDailyReward} onClaim={handleClaimDailyReward} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 56,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 8,
  },
  titleAccent: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.accent,
    letterSpacing: 4,
    marginTop: -4,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 48,
  },
  statBox: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
    minWidth: 120,
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  statValue: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '900',
    marginTop: 4,
  },
  coinsText: {
    color: COLORS.accentGold,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 64,
    paddingVertical: 20,
    borderRadius: 20,
    width: '80%',
    alignItems: 'center',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  playButtonText: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 4,
  },
  secondaryButtons: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 24,
  },
  secondaryButton: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  secondaryIcon: {
    fontSize: 18,
  },
  secondaryText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
