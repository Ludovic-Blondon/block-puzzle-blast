import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

interface ScoreFlyUpProps {
  points: number;
  trigger: number;
  color?: string;
}

export default function ScoreFlyUp({ points, trigger, color = '#fbbf24' }: ScoreFlyUpProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (trigger === 0 || points === 0) return;

    opacity.setValue(1);
    translateY.setValue(0);
    scale.setValue(0.5);

    const animation = Animated.parallel([
      Animated.timing(translateY, { toValue: -80, duration: 1000, useNativeDriver: true }),
      Animated.sequence([
        Animated.spring(scale, { toValue: 1.2, useNativeDriver: true, speed: 30 }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.delay(600),
        Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
    ]);

    animation.start();
    return () => animation.stop();
  }, [trigger]);

  if (trigger === 0 || points === 0) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [{ translateY }, { scale }],
        },
      ]}
      pointerEvents="none"
    >
      <Text style={[styles.text, { color }]}>+{points}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignSelf: 'center',
    top: '30%',
    zIndex: 250,
  },
  text: {
    fontSize: 36,
    fontWeight: '900',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});
