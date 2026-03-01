import React, { useRef } from 'react';
import { View, StyleSheet, PanResponder, Animated } from 'react-native';
import { GamePiece } from '../store/gameStore';
import BlockPiece from './BlockPiece';
import { hapticLight, hapticMedium } from '../utils/haptics';

interface BlockTrayProps {
  pieces: (GamePiece | null)[];
  onDragStart?: (pieceIndex: number) => void;
  onDragMove?: (pieceIndex: number, x: number, y: number) => void;
  onDragEnd?: (pieceIndex: number, x: number, y: number) => void;
  onDragCancel?: (pieceIndex: number) => void;
}

const TRAY_PIECE_SIZE = 18;

function DraggablePiece({
  gamePiece,
  index,
  onDragStart,
  onDragMove,
  onDragEnd,
  onDragCancel,
}: {
  gamePiece: GamePiece;
  index: number;
  onDragStart?: (pieceIndex: number) => void;
  onDragMove?: (pieceIndex: number, x: number, y: number) => void;
  onDragEnd?: (pieceIndex: number, x: number, y: number) => void;
  onDragCancel?: (pieceIndex: number) => void;
}) {
  const pan = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        hapticLight();
        Animated.spring(scale, { toValue: 1.2, useNativeDriver: true }).start();
        pan.setValue({ x: 0, y: -80 });
        onDragStart?.(index);
      },
      onPanResponderMove: (evt, gestureState) => {
        pan.setValue({ x: gestureState.dx, y: gestureState.dy - 80 });
        onDragMove?.(index, evt.nativeEvent.pageX, evt.nativeEvent.pageY - 80);
      },
      onPanResponderRelease: (evt, gestureState) => {
        hapticMedium();
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
        Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: true }).start();
        onDragEnd?.(index, evt.nativeEvent.pageX, evt.nativeEvent.pageY - 80);
      },
      onPanResponderTerminate: () => {
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
        Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: true }).start();
        onDragCancel?.(index);
      },
    })
  ).current;

  return (
    <Animated.View
      style={[
        styles.pieceContainer,
        {
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
            { scale },
          ],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <BlockPiece
        piece={gamePiece.piece}
        colorIndex={gamePiece.colorIndex}
        cellSize={TRAY_PIECE_SIZE}
      />
    </Animated.View>
  );
}

export default function BlockTray({
  pieces,
  onDragStart,
  onDragMove,
  onDragEnd,
  onDragCancel,
}: BlockTrayProps) {
  return (
    <View style={styles.tray}>
      {pieces.map((gamePiece, index) => {
        if (!gamePiece) {
          return <View key={index} style={styles.emptySlot} />;
        }

        return (
          <DraggablePiece
            key={`${gamePiece.piece.id}-${index}`}
            gamePiece={gamePiece}
            index={index}
            onDragStart={onDragStart}
            onDragMove={onDragMove}
            onDragEnd={onDragEnd}
            onDragCancel={onDragCancel}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tray: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    height: 120,
  },
  pieceContainer: {
    padding: 8,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  emptySlot: {
    minWidth: 80,
    height: 80,
  },
});
