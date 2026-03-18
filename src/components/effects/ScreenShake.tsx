import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

interface ScreenShakeProps {
  trigger: number; // Increment to trigger shake
  intensity?: number;
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function ScreenShake({ trigger, intensity = 5, children, style }: ScreenShakeProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (trigger === 0) return;

    const shake = Animated.sequence([
      Animated.timing(translateX, { toValue: intensity, duration: 30, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: -intensity * 0.7, duration: 30, useNativeDriver: true }),
      Animated.timing(translateX, { toValue: -intensity * 0.8, duration: 30, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: intensity * 0.5, duration: 30, useNativeDriver: true }),
      Animated.timing(translateX, { toValue: intensity * 0.4, duration: 30, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: -intensity * 0.2, duration: 30, useNativeDriver: true }),
      Animated.timing(translateX, { toValue: 0, duration: 30, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 30, useNativeDriver: true }),
    ]);

    shake.start();
    return () => shake.stop();
  }, [trigger]);

  return (
    <Animated.View style={[style, { transform: [{ translateX }, { translateY }] }]}>
      {children}
    </Animated.View>
  );
}
