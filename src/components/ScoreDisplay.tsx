import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../utils/colors';

interface ScoreDisplayProps {
  score: number;
  bestScore: number;
  coins: number;
}

function ScoreDisplay({ score, bestScore, coins }: ScoreDisplayProps) {
  const scoreScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (score > 0) {
      Animated.sequence([
        Animated.spring(scoreScale, { toValue: 1.3, useNativeDriver: true, speed: 40, bounciness: 12 }),
        Animated.spring(scoreScale, { toValue: 1, useNativeDriver: true, speed: 20 }),
      ]).start();
    }
  }, [score]);

  return (
    <View style={styles.container}>
      <View style={styles.statBox}>
        <Text style={styles.label}>BEST</Text>
        <Text style={styles.value}>{bestScore.toLocaleString()}</Text>
      </View>
      <Animated.View style={[styles.scoreBox, { transform: [{ scale: scoreScale }] }]}>
        <Text style={styles.scoreLabel}>SCORE</Text>
        <Text style={styles.scoreValue}>{score.toLocaleString()}</Text>
      </Animated.View>
      <View style={styles.statBox}>
        <Text style={styles.label}>COINS</Text>
        <Text style={[styles.value, styles.coinsValue]}>{coins}</Text>
      </View>
    </View>
  );
}

export default React.memo(ScoreDisplay);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  statBox: {
    alignItems: 'center',
    minWidth: 70,
  },
  scoreBox: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 16,
  },
  label: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  value: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
  },
  scoreLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  scoreValue: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '900',
  },
  coinsValue: {
    color: COLORS.accentGold,
  },
});
