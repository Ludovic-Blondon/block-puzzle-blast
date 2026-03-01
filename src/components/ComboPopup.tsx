import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated } from 'react-native';
import { COLORS } from '../utils/colors';
import { getComboText, getStreakText } from '../game/scoring';

interface ComboPopupProps {
  linesCleared: number;
  streak: number;
}

export default function ComboPopup({ linesCleared, streak }: ComboPopupProps) {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const comboText = getComboText(linesCleared);
  const streakText = getStreakText(streak);
  const displayText = comboText || streakText;

  useEffect(() => {
    if (!displayText) return;

    scale.setValue(0);
    opacity.setValue(0);
    translateY.setValue(0);

    Animated.parallel([
      Animated.sequence([
        Animated.spring(scale, { toValue: 1.5, useNativeDriver: true, speed: 30, bounciness: 15 }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20 }),
      ]),
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 100, useNativeDriver: true }),
        Animated.delay(800),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.spring(translateY, { toValue: -20, useNativeDriver: true }),
        Animated.delay(800),
        Animated.timing(translateY, { toValue: -60, duration: 300, useNativeDriver: true }),
      ]),
    ]).start();
  }, [displayText, linesCleared, streak]);

  if (!displayText) return null;

  return (
    <Animated.Text
      style={[
        styles.text,
        {
          transform: [{ scale }, { translateY }],
          opacity,
        },
      ]}
    >
      {displayText}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  text: {
    position: 'absolute',
    alignSelf: 'center',
    top: '40%',
    fontSize: 42,
    fontWeight: '900',
    color: COLORS.accentGold,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    zIndex: 200,
  },
});
