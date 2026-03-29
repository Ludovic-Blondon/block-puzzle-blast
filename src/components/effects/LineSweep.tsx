import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { CELL_GAP, GRID_SIZE } from '../../constants/config';

interface LineSweepProps {
  row: number;
  cellSize: number;
  gridWidth: number;
  trigger: number;
  onComplete: () => void;
}

export default function LineSweep({
  row,
  cellSize,
  gridWidth,
  trigger,
  onComplete,
}: LineSweepProps) {
  const [active, setActive] = useState(false);
  const beamX = useRef(new Animated.Value(0)).current;
  const beamOpacity = useRef(new Animated.Value(0)).current;
  const cellAnims = useRef<{ scale: Animated.Value; opacity: Animated.Value }[]>([]);

  useEffect(() => {
    if (trigger === 0) return;

    // Create per-cell values
    cellAnims.current = Array.from({ length: GRID_SIZE }, () => ({
      scale: new Animated.Value(1),
      opacity: new Animated.Value(1),
    }));
    beamX.setValue(0);
    beamOpacity.setValue(1);
    setActive(true);

    const sweepDuration = 400;
    const staggerDelay = sweepDuration / GRID_SIZE; // 40ms per cell

    // Beam sweep left to right
    const beamAnim = Animated.sequence([
      Animated.timing(beamX, { toValue: gridWidth, duration: sweepDuration, useNativeDriver: true }),
      Animated.timing(beamOpacity, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]);

    // Cell animations: each cell flashes and shrinks as beam passes
    const cellAnimations = cellAnims.current.map((anim, colIndex) =>
      Animated.sequence([
        Animated.delay(colIndex * staggerDelay),
        Animated.parallel([
          Animated.sequence([
            Animated.timing(anim.scale, { toValue: 1.2, duration: 60, useNativeDriver: true }),
            Animated.timing(anim.scale, { toValue: 0, duration: 150, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.delay(60),
            Animated.timing(anim.opacity, { toValue: 0, duration: 150, useNativeDriver: true }),
          ]),
        ]),
      ])
    );

    const composite = Animated.parallel([beamAnim, ...cellAnimations]);

    composite.start(() => {
      setActive(false);
      onComplete();
    });

    return () => composite.stop();
  }, [trigger]);

  if (!active) return null;

  const rowTop = CELL_GAP + row * (cellSize + CELL_GAP);

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Per-cell flash + shrink */}
      {cellAnims.current.map((anim, col) => {
        const left = CELL_GAP + col * (cellSize + CELL_GAP);
        return (
          <Animated.View
            key={`cell-${col}`}
            style={[
              styles.cellOverlay,
              {
                left,
                top: rowTop,
                width: cellSize,
                height: cellSize,
                borderRadius: 3,
                backgroundColor: '#0ea5e9',
                opacity: anim.opacity,
                transform: [{ scale: anim.scale }],
              },
            ]}
          />
        );
      })}

      {/* Sweep beam */}
      <Animated.View
        style={[
          styles.beam,
          {
            top: rowTop - 2,
            height: cellSize + 4,
            opacity: beamOpacity,
            transform: [{ translateX: beamX }],
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
  beam: {
    position: 'absolute',
    left: 0,
    width: 4,
    backgroundColor: 'rgba(14, 165, 233, 0.8)',
    borderRadius: 2,
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 4,
  },
});
