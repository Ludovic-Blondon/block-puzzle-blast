import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface Particle {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  opacity: Animated.Value;
  scale: Animated.Value;
  color: string;
}

interface ParticleSystemProps {
  origin: { x: number; y: number };
  colors: string[];
  count?: number;
  trigger: number; // Change this value to trigger a new burst
}

let particleIdCounter = 0;

export default function ParticleSystem({ origin, colors, count = 12, trigger }: ParticleSystemProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (trigger === 0) return;

    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: particleIdCounter++,
        x: new Animated.Value(0),
        y: new Animated.Value(0),
        opacity: new Animated.Value(1),
        scale: new Animated.Value(1),
        color: colors[i % colors.length],
      });
    }

    setParticles(newParticles);

    const animations = newParticles.map((p, i) => {
      const angle = (i / count) * Math.PI * 2;
      const distance = 40 + Math.random() * 60;
      const targetX = Math.cos(angle) * distance;
      const targetY = Math.sin(angle) * distance;

      return Animated.parallel([
        Animated.timing(p.x, { toValue: targetX, duration: 500 + Math.random() * 300, useNativeDriver: true }),
        Animated.timing(p.y, { toValue: targetY, duration: 500 + Math.random() * 300, useNativeDriver: true }),
        Animated.timing(p.opacity, { toValue: 0, duration: 600, delay: 200, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(p.scale, { toValue: 1.5, duration: 150, useNativeDriver: true }),
          Animated.timing(p.scale, { toValue: 0, duration: 450, useNativeDriver: true }),
        ]),
      ]);
    });

    const composite = Animated.parallel(animations);
    composite.start(() => setParticles([]));

    return () => composite.stop();
  }, [trigger]);

  if (particles.length === 0) return null;

  return (
    <View style={[styles.container, { left: origin.x, top: origin.y }]} pointerEvents="none">
      {particles.map((p) => (
        <Animated.View
          key={p.id}
          style={[
            styles.particle,
            {
              backgroundColor: p.color,
              transform: [{ translateX: p.x }, { translateY: p.y }, { scale: p.scale }],
              opacity: p.opacity,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 0,
    height: 0,
    zIndex: 300,
  },
  particle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: -3,
    marginTop: -3,
  },
});
