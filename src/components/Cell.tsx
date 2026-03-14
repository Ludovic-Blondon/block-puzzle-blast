import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { COLORS, BLOCK_COLORS } from '../utils/colors';

interface CellProps {
  colorIndex: number;
  size: number;
  isGhost?: boolean;
  isGhostValid?: boolean;
  isClearing?: boolean;
}

function Cell({ colorIndex, size, isGhost, isGhostValid, isClearing }: CellProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const backgroundColor =
    isGhost
      ? isGhostValid
        ? COLORS.ghostValid
        : COLORS.ghostInvalid
      : colorIndex > 0
      ? BLOCK_COLORS[(colorIndex - 1) % BLOCK_COLORS.length]
      : COLORS.cellEmpty;

  useEffect(() => {
    if (isClearing) {
      const scaleComposite = Animated.sequence([
        Animated.spring(scaleAnim, { toValue: 1.2, useNativeDriver: true, speed: 50 }),
        Animated.timing(scaleAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]);
      const opacityComposite = Animated.timing(opacityAnim, { toValue: 0, duration: 300, useNativeDriver: true });
      scaleComposite.start();
      opacityComposite.start();
      return () => {
        scaleComposite.stop();
        opacityComposite.stop();
      };
    } else {
      scaleAnim.setValue(1);
      opacityAnim.setValue(1);
    }
  }, [isClearing]);

  return (
    <Animated.View
      style={[
        styles.cell,
        {
          width: size,
          height: size,
          backgroundColor,
          borderRadius: size * 0.15,
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
        colorIndex > 0 && !isGhost && styles.filledCell,
      ]}
    />
  );
}

export default React.memo(Cell);

const styles = StyleSheet.create({
  cell: {
    margin: 1,
  },
  filledCell: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
});
