import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../utils/colors';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface LevelUpBannerProps {
  level: number;
  visible: boolean;
  onDone?: () => void;
}

export default function LevelUpBanner({ level, visible, onDone }: LevelUpBannerProps) {
  const reduceMotion = useReducedMotion();
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;

    if (reduceMotion) {
      scale.setValue(1);
      opacity.setValue(1);
      const fadeOut = Animated.sequence([
        Animated.delay(1500),
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]);
      fadeOut.start(() => onDone?.());
      return () => fadeOut.stop();
    }

    scale.setValue(0);
    opacity.setValue(0);

    const animation = Animated.sequence([
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 15, bounciness: 12 }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]),
      Animated.delay(1500),
      Animated.parallel([
        Animated.timing(scale, { toValue: 0.5, duration: 300, useNativeDriver: true }),
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
          transform: [{ scale }],
          opacity,
        },
      ]}
      pointerEvents="none"
    >
      <Text style={styles.label}>LEVEL UP!</Text>
      <Text style={styles.level}>{level}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignSelf: 'center',
    top: '35%',
    zIndex: 400,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.accentGold,
  },
  label: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.accentGold,
    letterSpacing: 3,
  },
  level: {
    fontSize: 48,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 4,
  },
});
