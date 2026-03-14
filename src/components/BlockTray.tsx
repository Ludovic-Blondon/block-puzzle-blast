import React, { useRef } from 'react';
import { View, StyleSheet, PanResponder, Animated, PixelRatio } from 'react-native';
import { GamePiece } from '../store/gameStore';
import BlockPiece from './BlockPiece';
import { hapticLight, hapticMedium } from '../utils/haptics';

interface BlockTrayProps {
  pieces: (GamePiece | null)[];
  onDragStart?: (pieceIndex: number) => void;
  onDragMove?: (pieceIndex: number, x: number, y: number) => void;
  onDragEnd?: (pieceIndex: number, x: number, y: number) => void;
  onDragCancel?: (pieceIndex: number) => void;
  onPieceTap?: (pieceIndex: number) => void;
}

const TRAY_PIECE_SIZE = 18;
const TAP_THRESHOLD = 5 * PixelRatio.get();

function DraggablePiece({
  gamePiece,
  index,
  onDragStart,
  onDragMove,
  onDragEnd,
  onDragCancel,
  onPieceTap,
}: {
  gamePiece: GamePiece;
  index: number;
  onDragStart?: (pieceIndex: number) => void;
  onDragMove?: (pieceIndex: number, x: number, y: number) => void;
  onDragEnd?: (pieceIndex: number, x: number, y: number) => void;
  onDragCancel?: (pieceIndex: number) => void;
  onPieceTap?: (pieceIndex: number) => void;
}) {
  const pan = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(1)).current;
  const pieceViewRef = useRef<View>(null);
  const dragOffsetY = useRef(0);

  // Store callbacks in refs to avoid stale closures in PanResponder
  const onDragStartRef = useRef(onDragStart);
  onDragStartRef.current = onDragStart;
  const onDragMoveRef = useRef(onDragMove);
  onDragMoveRef.current = onDragMove;
  const onDragEndRef = useRef(onDragEnd);
  onDragEndRef.current = onDragEnd;
  const onDragCancelRef = useRef(onDragCancel);
  onDragCancelRef.current = onDragCancel;
  const onPieceTapRef = useRef(onPieceTap);
  onPieceTapRef.current = onPieceTap;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        hapticLight();
        // Measure piece height dynamically for the Y offset
        pieceViewRef.current?.measureInWindow((_x, _y, _w, h) => {
          dragOffsetY.current = -(h || 80);
        });
        const offset = dragOffsetY.current || -80;
        Animated.spring(scale, { toValue: 1.2, useNativeDriver: true }).start();
        pan.setValue({ x: 0, y: offset });
        onDragStartRef.current?.(index);
      },
      onPanResponderMove: (evt, gestureState) => {
        const offset = dragOffsetY.current || -80;
        pan.setValue({ x: gestureState.dx, y: gestureState.dy + offset });
        onDragMoveRef.current?.(index, evt.nativeEvent.pageX, evt.nativeEvent.pageY + offset);
      },
      onPanResponderRelease: (evt, gestureState) => {
        hapticMedium();
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
        Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: true }).start();

        if (Math.abs(gestureState.dx) < TAP_THRESHOLD && Math.abs(gestureState.dy) < TAP_THRESHOLD && onPieceTapRef.current) {
          onPieceTapRef.current(index);
        } else {
          const offset = dragOffsetY.current || -80;
          onDragEndRef.current?.(index, evt.nativeEvent.pageX, evt.nativeEvent.pageY + offset);
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
        Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: true }).start();
        onDragCancelRef.current?.(index);
      },
    })
  ).current;

  return (
    <Animated.View
      ref={pieceViewRef}
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
  onPieceTap,
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
            onPieceTap={onPieceTap}
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
