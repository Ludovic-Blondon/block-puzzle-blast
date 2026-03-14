import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BLOCK_COLORS, COLORS } from '../utils/colors';
import { PieceShape } from '../game/pieces';

interface BlockPieceProps {
  piece: PieceShape;
  colorIndex: number;
  cellSize?: number;
  opacity?: number;
}

function BlockPiece({
  piece,
  colorIndex,
  cellSize = 20,
  opacity = 1,
}: BlockPieceProps) {
  const color = BLOCK_COLORS[(colorIndex - 1) % BLOCK_COLORS.length];

  return (
    <View style={[styles.piece, { opacity }]}>
      {piece.shape.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((cell, colIndex) => (
            <View
              key={colIndex}
              style={[
                styles.cell,
                {
                  width: cellSize,
                  height: cellSize,
                  borderRadius: cellSize * 0.15,
                  backgroundColor: cell ? color : 'transparent',
                },
                cell ? styles.filledCell : undefined,
              ]}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

export default React.memo(BlockPiece);

const styles = StyleSheet.create({
  piece: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
  },
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
