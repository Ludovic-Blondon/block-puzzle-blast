import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, Animated } from 'react-native';
import { COLORS } from '../utils/colors';
import { DAILY_REWARD_COINS } from '../constants/config';

interface DailyRewardProps {
  visible: boolean;
  onClaim: () => void;
}

export default function DailyReward({ visible, onClaim }: DailyRewardProps) {
  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(300);
      const animation = Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 15 });
      animation.start();
      return () => animation.stop();
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClaim}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.modal, { transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.emoji}>🎁</Text>
          <Text style={styles.title}>DAILY REWARD</Text>
          <Text style={styles.subtitle}>Welcome back!</Text>

          <View style={styles.rewardBox}>
            <Text style={styles.coinAmount}>+{DAILY_REWARD_COINS}</Text>
            <Text style={styles.coinLabel}>coins</Text>
          </View>

          <Pressable style={styles.claimButton} onPress={onClaim} accessibilityRole="button" accessibilityLabel={`Claim ${DAILY_REWARD_COINS} coins daily reward`}>
            <Text style={styles.claimButtonText}>CLAIM</Text>
          </Pressable>
        </Animated.View>
      </View>
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
    width: '80%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  rewardBox: {
    marginVertical: 24,
    alignItems: 'center',
  },
  coinAmount: {
    fontSize: 48,
    fontWeight: '900',
    color: COLORS.accentGold,
  },
  coinLabel: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  claimButton: {
    backgroundColor: COLORS.accentGold,
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  claimButtonText: {
    color: COLORS.background,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
