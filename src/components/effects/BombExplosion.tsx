import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { CELL_GAP, GRID_SIZE } from '../../constants/config';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface BombExplosionProps {
  cells: { row: number; col: number }[];
  centerRow: number;
  centerCol: number;
  cellSize: number;
  trigger: number;
  onComplete: () => void;
}

export default function BombExplosion({
  cells,
  centerRow,
  centerCol,
  cellSize,
  trigger,
  onComplete,
}: BombExplosionProps) {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(false);
  const cellAnims = useRef<{ scale: Animated.Value; opacity: Animated.Value }[]>([]);
  const shockwaveScale = useRef(new Animated.Value(0)).current;
  const shockwaveOpacity = useRef(new Animated.Value(0)).current;
  const flashOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (trigger === 0) return;
    if (reduceMotion) { onComplete(); return; }

    // Create per-cell animated values
    cellAnims.current = cells.map(() => ({
      scale: new Animated.Value(1),
      opacity: new Animated.Value(1),
    }));
    shockwaveScale.setValue(0);
    shockwaveOpacity.setValue(1);
    flashOpacity.setValue(0);
    setActive(true);

    // Sort cells by distance from center for staggered effect
    const sorted = cells
      .map((cell, i) => ({
        ...cell,
        index: i,
        dist: Math.abs(cell.row - centerRow) + Math.abs(cell.col - centerCol),
      }))
      .sort((a, b) => a.dist - b.dist);

    // Flash
    const flashAnim = Animated.sequence([
      Animated.timing(flashOpacity, { toValue: 0.8, duration: 60, useNativeDriver: true }),
      Animated.timing(flashOpacity, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]);

    // Cell animations (staggered by distance)
    const cellAnimations = sorted.map((cell, sortIndex) => {
      const anim = cellAnims.current[cell.index];
      const delay = sortIndex * 30;
      return Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.sequence([
            Animated.timing(anim.scale, { toValue: 1.3, duration: 100, useNativeDriver: true }),
            Animated.timing(anim.scale, { toValue: 0, duration: 200, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.delay(100),
            Animated.timing(anim.opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
          ]),
        ]),
      ]);
    });

    // Shockwave ring
    const shockwaveAnim = Animated.parallel([
      Animated.timing(shockwaveScale, { toValue: 3, duration: 350, useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(100),
        Animated.timing(shockwaveOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]),
    ]);

    const composite = Animated.parallel([
      flashAnim,
      Animated.parallel(cellAnimations),
      shockwaveAnim,
    ]);

    composite.start(() => {
      setActive(false);
      onComplete();
    });

    return () => composite.stop();
  }, [trigger]);

  if (!active || cells.length === 0) return null;

  const cellPixel = (row: number, col: number) => ({
    left: CELL_GAP + col * (cellSize + CELL_GAP),
    top: CELL_GAP + row * (cellSize + CELL_GAP),
  });

  const center = cellPixel(centerRow, centerCol);
  const centerX = center.left + cellSize / 2;
  const centerY = center.top + cellSize / 2;

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Flash overlay on affected area */}
      {cells.map((cell, i) => {
        const pos = cellPixel(cell.row, cell.col);
        return (
          <Animated.View
            key={`flash-${i}`}
            style={[
              styles.cellOverlay,
              {
                left: pos.left,
                top: pos.top,
                width: cellSize,
                height: cellSize,
                borderRadius: 3,
                backgroundColor: '#ffffff',
                opacity: flashOpacity,
              },
            ]}
          />
        );
      })}

      {/* Cell scale+fade animations */}
      {cells.map((cell, i) => {
        const pos = cellPixel(cell.row, cell.col);
        const anim = cellAnims.current[i];
        if (!anim) return null;
        return (
          <Animated.View
            key={`cell-${i}`}
            style={[
              styles.cellOverlay,
              {
                left: pos.left,
                top: pos.top,
                width: cellSize,
                height: cellSize,
                borderRadius: 3,
                backgroundColor: '#e94560',
                opacity: anim.opacity,
                transform: [{ scale: anim.scale }],
              },
            ]}
          />
        );
      })}

      {/* Shockwave ring */}
      <Animated.View
        style={[
          styles.shockwave,
          {
            left: centerX - cellSize,
            top: centerY - cellSize,
            width: cellSize * 2,
            height: cellSize * 2,
            borderRadius: cellSize,
            opacity: shockwaveOpacity,
            transform: [{ scale: shockwaveScale }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 285,
  },
  cellOverlay: {
    position: 'absolute',
  },
  shockwave: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'rgba(233, 69, 96, 0.6)',
  },
});
