import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, Animated } from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../utils/colors';
import { DAILY_REWARDS } from '../constants/config';
import { usePlayerStore } from '../store/playerStore';

interface DailyRewardProps {
  visible: boolean;
  onClaim: () => void;
}

export default function DailyReward({ visible, onClaim }: DailyRewardProps) {
  const { t } = useTranslation();
  const slideAnim = useRef(new Animated.Value(300)).current;
  const dailyStreak = usePlayerStore((s) => s.dailyStreak);
  const currentDay = dailyStreak % 7; // 0-6, index into DAILY_REWARDS for the NEXT claim

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(300);
      const animation = Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 15 });
      animation.start();
      return () => animation.stop();
    }
  }, [visible]);

  const todayReward = DAILY_REWARDS[currentDay];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClaim}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.modal, { transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.emoji}>🎁</Text>
          <Text style={styles.title}>{t('dailyReward.title')}</Text>
          <Text style={styles.subtitle}>{t('dailyReward.dayOf', { day: currentDay + 1 })}</Text>

          {/* 7-day calendar */}
          <View style={styles.calendar}>
            {DAILY_REWARDS.map((reward, index) => {
              const isPast = index < currentDay;
              const isCurrent = index === currentDay;
              return (
                <View
                  key={index}
                  style={[
                    styles.dayBox,
                    isPast && styles.dayPast,
                    isCurrent && styles.dayCurrent,
                  ]}
                >
                  <Text style={[styles.dayLabel, isCurrent && styles.dayLabelCurrent]}>
                    {t('dailyReward.day', { day: index + 1 })}
                  </Text>
                  <Text style={[styles.dayCoins, isCurrent && styles.dayLabelCurrent]}>
                    {reward.coins}
                  </Text>
                  {reward.powerUp && (
                    <Text style={styles.dayBonus}>+🎁</Text>
                  )}
                  {isPast && <Text style={styles.dayCheck}>✓</Text>}
                </View>
              );
            })}
          </View>

          <View style={styles.rewardBox}>
            <Text style={styles.coinAmount}>+{todayReward.coins}</Text>
            <Text style={styles.coinLabel}>{t('dailyReward.coins')}</Text>
            {todayReward.powerUp && (
              <Text style={styles.bonusText}>{t('dailyReward.freePowerUp')}</Text>
            )}
          </View>

          <Pressable style={styles.claimButton} onPress={onClaim} accessibilityRole="button" accessibilityLabel={`Claim ${todayReward.coins} coins daily reward`}>
            <Text style={styles.claimButtonText}>{t('dailyReward.claim')}</Text>
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
    padding: 24,
    width: '90%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
    marginBottom: 12,
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 16,
  },
  dayBox: {
    width: 44,
    height: 56,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dayPast: {
    opacity: 0.5,
  },
  dayCurrent: {
    backgroundColor: COLORS.accentGold,
    borderWidth: 2,
    borderColor: COLORS.text,
  },
  dayLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '700',
  },
  dayLabelCurrent: {
    color: COLORS.background,
  },
  dayCoins: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '800',
  },
  dayBonus: {
    fontSize: 10,
  },
  dayCheck: {
    position: 'absolute',
    top: 2,
    right: 4,
    fontSize: 10,
    color: COLORS.success,
  },
  rewardBox: {
    marginBottom: 16,
    alignItems: 'center',
  },
  coinAmount: {
    fontSize: 42,
    fontWeight: '800',
    color: COLORS.accentGold,
  },
  coinLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  bonusText: {
    fontSize: 14,
    color: COLORS.success,
    fontWeight: '700',
    marginTop: 4,
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
