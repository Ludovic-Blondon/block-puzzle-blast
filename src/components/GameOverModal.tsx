import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, Animated } from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../utils/colors';
import * as Sharing from 'expo-sharing';

interface GameOverModalProps {
  visible: boolean;
  score: number;
  bestScore: number;
  isNewBest: boolean;
  coinsEarned: number;
  modeName?: string;
  onPlayAgain: () => void;
  onGoHome: () => void;
  onShare?: () => void;
}

export default function GameOverModal({
  visible,
  score,
  bestScore,
  isNewBest,
  coinsEarned,
  modeName = 'Classic',
  onPlayAgain,
  onGoHome,
  onShare,
}: GameOverModalProps) {
  const { t } = useTranslation();
  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(300);
      fadeAnim.setValue(0);
      const animation = Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 15 }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]);
      animation.start();
      return () => animation.stop();
    }
  }, [visible]);

  const handleShare = async () => {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) return;

      // Generate a shareable text for now (image gen can be added later with view-shot)
      if (onShare) {
        onShare();
      }
    } catch {
      // Sharing not available
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onGoHome}>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View style={[styles.modal, { transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.title}>{t('gameOver.title')}</Text>
          {modeName !== 'Classic' && <Text style={styles.modeLabel}>{modeName}</Text>}

          {isNewBest && <Text style={styles.newBest}>{t('gameOver.newBest')}</Text>}

          <View style={styles.scoreContainer}>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>{t('gameOver.score')}</Text>
              <Text style={styles.scoreValue}>{score.toLocaleString()}</Text>
            </View>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>{t('gameOver.best')}</Text>
              <Text style={styles.bestValue}>{bestScore.toLocaleString()}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>{t('gameOver.coinsEarned')}</Text>
              <Text style={styles.coinsValue}>+{coinsEarned}</Text>
            </View>
          </View>

          <Pressable style={styles.playButton} onPress={onPlayAgain} accessibilityRole="button" accessibilityLabel="Play again">
            <Text style={styles.playButtonText}>{t('gameOver.playAgain')}</Text>
          </Pressable>

          <View style={styles.bottomButtons}>
            <Pressable style={styles.secondaryButton} onPress={handleShare} accessibilityRole="button" accessibilityLabel="Share score">
              <Text style={styles.secondaryButtonText}>{t('gameOver.share')}</Text>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={onGoHome} accessibilityRole="button" accessibilityLabel="Back to home">
              <Text style={styles.secondaryButtonText}>{t('gameOver.home')}</Text>
            </Pressable>
          </View>
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
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 2,
  },
  modeLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginTop: 4,
    letterSpacing: 1,
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
  bottomButtons: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
  },
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  secondaryButtonText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
});
