import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../utils/colors';
import { BLITZ_DURATION } from '../constants/config';

interface BlitzTimerProps {
  timeRemaining: number;
}

export default function BlitzTimer({ timeRemaining }: BlitzTimerProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isUrgent = timeRemaining <= 10;
  const progress = timeRemaining / BLITZ_DURATION;

  useEffect(() => {
    if (isUrgent && timeRemaining > 0) {
      const pulse = Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.15, duration: 200, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]);
      pulse.start();
      return () => pulse.stop();
    }
  }, [timeRemaining, isUrgent]);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const display = `${minutes}:${String(seconds).padStart(2, '0')}`;

  return (
    <View style={styles.container}>
      <View style={styles.barOuter}>
        <View
          style={[
            styles.barFill,
            {
              width: `${Math.max(progress * 100, 0)}%`,
              backgroundColor: isUrgent ? COLORS.danger : COLORS.accent,
            },
          ]}
        />
      </View>
      <Animated.View style={[styles.timeBox, isUrgent && styles.urgentBox, { transform: [{ scale: scaleAnim }] }]}>
        <Text style={[styles.timeText, isUrgent && styles.urgentText]}>{display}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  barOuter: {
    width: '100%',
    height: 4,
    backgroundColor: COLORS.gridLine,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
  },
  timeBox: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgentBox: {
    backgroundColor: COLORS.danger,
  },
  timeText: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  urgentText: {
    color: COLORS.text,
  },
});
