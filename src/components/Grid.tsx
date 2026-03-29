import React, { useMemo, forwardRef } from 'react';
import { View, StyleSheet, LayoutChangeEvent, Pressable, useWindowDimensions } from 'react-native';
import { GRID_SIZE, CELL_GAP } from '../constants/config';
import { COLORS } from '../utils/colors';
import { Grid as GridType } from '../game/engine';
import Cell from './Cell';

interface GridProps {
  grid: GridType;
  ghostCells?: { row: number; col: number }[];
  ghostValid?: boolean;
  clearingRows?: number[];
  clearingCols?: number[];
  onLayout?: (event: LayoutChangeEvent) => void;
  gridSize?: number;
  onCellPress?: (row: number, col: number) => void;
}

const Grid = forwardRef<View, GridProps>(function Grid({
  grid,
  ghostCells = [],
  ghostValid = false,
  clearingRows = [],
  clearingCols = [],
  onLayout,
  gridSize: externalGridSize,
  onCellPress,
}, ref) {
  const { width: screenWidth } = useWindowDimensions();
  const gridContainerSize = externalGridSize || screenWidth - 32;
  const cellSize = (gridContainerSize - CELL_GAP * (GRID_SIZE + 1)) / GRID_SIZE;

  const ghostSet = useMemo(() => {
    const set = new Set<string>();
    for (const { row, col } of ghostCells) {
      set.add(`${row}-${col}`);
    }
    return set;
  }, [ghostCells]);

  return (
    <View
      ref={ref}
      style={[
        styles.grid,
        {
          width: gridContainerSize,
          height: gridContainerSize,
        },
      ]}
      onLayout={onLayout}
      accessible={true}
      accessibilityLabel="Game grid, 10 by 10"
    >
      {grid.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((cell, colIndex) => {
            const key = `${rowIndex}-${colIndex}`;
            const isGhost = ghostSet.has(key);
            const isClearing =
              clearingRows.includes(rowIndex) || clearingCols.includes(colIndex);

            if (onCellPress) {
              return (
                <Pressable key={key} onPress={() => onCellPress(rowIndex, colIndex)}>
                  <Cell
                    colorIndex={isGhost && cell === 0 ? 0 : cell}
                    size={cellSize}
                    isGhost={isGhost && cell === 0}
                    isGhostValid={ghostValid}
                    isClearing={isClearing && cell !== 0}
                  />
                </Pressable>
              );
            }

            return (
              <Cell
                key={key}
                colorIndex={isGhost && cell === 0 ? 0 : cell}
                size={cellSize}
                isGhost={isGhost && cell === 0}
                isGhostValid={ghostValid}
                isClearing={isClearing && cell !== 0}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
});

export default Grid;

const styles = StyleSheet.create({
  grid: {
    backgroundColor: COLORS.grid,
    borderRadius: 12,
    padding: CELL_GAP,
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
  },
});
