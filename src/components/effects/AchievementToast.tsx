import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../utils/colors';
import { getTierColor } from '../../constants/achievements';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface AchievementToastProps {
  name: string;
  tier?: 'bronze' | 'silver' | 'gold';
  visible: boolean;
  onDone?: () => void;
}

export default function AchievementToast({ name, tier = 'bronze', visible, onDone }: AchievementToastProps) {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;

    if (reduceMotion) {
      translateY.setValue(0);
      opacity.setValue(1);
      const fadeOut = Animated.sequence([
        Animated.delay(2000),
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]);
      fadeOut.start(() => onDone?.());
      return () => fadeOut.stop();
    }

    translateY.setValue(-100);
    opacity.setValue(0);

    const animation = Animated.sequence([
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, damping: 12 }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]),
      Animated.delay(2000),
      Animated.parallel([
        Animated.timing(translateY, { toValue: -100, duration: 300, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]),
    ]);

    animation.start(() => onDone?.());
    return () => animation.stop();
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
          borderColor: getTierColor(tier),
        },
      ]}
      pointerEvents="none"
    >
      <Text style={styles.icon}>🏆</Text>
      <View style={styles.textContainer}>
        <Text style={styles.label}>{t('toast.achievementUnlocked')}</Text>
        <Text style={[styles.name, { color: getTierColor(tier) }]}>{name}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    zIndex: 500,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  icon: {
    fontSize: 32,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
});
