import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, Animated } from 'react-native';
import { COLORS } from '../utils/colors';

interface GameOverModalProps {
  visible: boolean;
  score: number;
  bestScore: number;
  isNewBest: boolean;
  coinsEarned: number;
  onPlayAgain: () => void;
  onGoHome: () => void;
}

export default function GameOverModal({
  visible,
  score,
  bestScore,
  isNewBest,
  coinsEarned,
  onPlayAgain,
  onGoHome,
}: GameOverModalProps) {
  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(300);
      fadeAnim.setValue(0);
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 15 }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View style={[styles.modal, { transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.title}>GAME OVER</Text>

          {isNewBest && <Text style={styles.newBest}>NEW BEST!</Text>}

          <View style={styles.scoreContainer}>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Score</Text>
              <Text style={styles.scoreValue}>{score.toLocaleString()}</Text>
            </View>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Best</Text>
              <Text style={styles.bestValue}>{bestScore.toLocaleString()}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Coins Earned</Text>
              <Text style={styles.coinsValue}>+{coinsEarned}</Text>
            </View>
          </View>

          <Pressable style={styles.playButton} onPress={onPlayAgain}>
            <Text style={styles.playButtonText}>PLAY AGAIN</Text>
          </Pressable>

          <Pressable style={styles.homeButton} onPress={onGoHome}>
            <Text style={styles.homeButtonText}>HOME</Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 24,
    padding: 32,
    width: '85%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 2,
  },
  newBest: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.accentGold,
    marginTop: 8,
    letterSpacing: 1,
  },
  scoreContainer: {
    width: '100%',
    marginTop: 24,
    marginBottom: 24,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  scoreLabel: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  scoreValue: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '800',
  },
  bestValue: {
    color: COLORS.accentGold,
    fontSize: 20,
    fontWeight: '800',
  },
  coinsValue: {
    color: COLORS.accentGold,
    fontSize: 20,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.surfaceLight,
    marginVertical: 8,
  },
  playButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  playButtonText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  homeButton: {
    marginTop: 12,
    paddingVertical: 12,
  },
  homeButtonText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
});
