import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

interface RotateSpinProps {
  trigger: number;
  onMidpoint: () => void;
  onComplete: () => void;
  children: React.ReactNode;
}

export default function RotateSpin({ trigger, onMidpoint, onComplete, children }: RotateSpinProps) {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (trigger === 0) return;

    rotation.setValue(0);

    // First half: 0 -> 90 degrees
    const firstHalf = Animated.timing(rotation, {
      toValue: 0.5,
      duration: 150,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    });

    // Second half: 90 -> 90 (settle with spring feel via timing)
    const settle = Animated.timing(rotation, {
      toValue: 1,
      duration: 150,
      easing: Easing.out(Easing.back(1.5)),
      useNativeDriver: true,
    });

    firstHalf.start(() => {
      onMidpoint();
      // Reset to 0.5 equivalent visual (piece data swapped, so 0 looks correct)
      rotation.setValue(0);
      settle.start(() => {
        rotation.setValue(0);
        onComplete();
      });
    });

    return () => {
      firstHalf.stop();
      settle.stop();
    };
  }, [trigger]);

  const rotate = rotation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '90deg', '90deg'],
  });

  return (
    <Animated.View style={{ transform: [{ rotate }] }}>
      {children}
    </Animated.View>
  );
}
