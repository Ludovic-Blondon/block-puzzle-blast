import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, useWindowDimensions, Pressable, Text } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGameStore } from '../src/store/gameStore';
import { usePlayerStore } from '../src/store/playerStore';
import { COLORS } from '../src/utils/colors';
import { GRID_SIZE, CELL_GAP } from '../src/constants/config';
import { getPieceHeight, getPieceWidth } from '../src/game/pieces';
import { canPlacePiece } from '../src/game/engine';
import Grid from '../src/components/Grid';
import BlockTray from '../src/components/BlockTray';
import { hapticSuccess, hapticError } from '../src/utils/haptics';

export default function ZenScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const gridContainerSize = screenWidth - 32;
  const insets = useSafeAreaInsets();

  const {
    grid, currentPieces, zenLinesCleared,
    lastClearResult, startNewGame, tryPlacePiece,
  } = useGameStore();

  const { addZenLines, incrementGamesPlayed } = usePlayerStore();

  const [ghostCells, setGhostCells] = useState<{ row: number; col: number }[]>([]);
  const [ghostValid, setGhostValid] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const gridRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null);
  const gridViewRef = useRef<View>(null);

  useEffect(() => {
    if (!gameStarted) {
      startNewGame('zen');
      incrementGamesPlayed();
      setGameStarted(true);
    }
  }, []);

  useEffect(() => {
    if (lastClearResult && lastClearResult.linesCleared > 0) {
      addZenLines(lastClearResult.linesCleared);
      hapticSuccess();
    }
  }, [lastClearResult]);

  const screenToGrid = useCallback((screenX: number, screenY: number) => {
    if (!gridRef.current) return null;
    const { x, y, width } = gridRef.current;
    const cellSize = (width - CELL_GAP * (GRID_SIZE + 1)) / GRID_SIZE;
    const totalCellSize = cellSize + CELL_GAP;
    const col = Math.floor((screenX - x - CELL_GAP) / totalCellSize);
    const row = Math.floor((screenY - y - CELL_GAP) / totalCellSize);
    if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) return null;
    return { row, col };
  }, []);

  const handleDragMove = useCallback((pieceIndex: number, x: number, y: number) => {
    const gamePiece = currentPieces[pieceIndex];
    if (!gamePiece) return;
    const gridPos = screenToGrid(x, y);
    if (!gridPos) { setGhostCells([]); setGhostValid(false); return; }
    const offsetRow = gridPos.row - Math.floor(getPieceHeight(gamePiece.piece) / 2);
    const offsetCol = gridPos.col - Math.floor(getPieceWidth(gamePiece.piece) / 2);
    const cells: { row: number; col: number }[] = [];
    for (let r = 0; r < gamePiece.piece.shape.length; r++)
      for (let c = 0; c < gamePiece.piece.shape[0].length; c++)
        if (gamePiece.piece.shape[r][c]) cells.push({ row: offsetRow + r, col: offsetCol + c });
    setGhostCells(cells);
    setGhostValid(canPlacePiece(grid, gamePiece.piece, offsetRow, offsetCol));
  }, [currentPieces, grid, screenToGrid]);

  const handleDragEnd = useCallback((pieceIndex: number, x: number, y: number) => {
    const gamePiece = currentPieces[pieceIndex];
    if (!gamePiece) return;
    const gridPos = screenToGrid(x, y);
    setGhostCells([]); setGhostValid(false);
    if (!gridPos) return;
    const offsetRow = gridPos.row - Math.floor(getPieceHeight(gamePiece.piece) / 2);
    const offsetCol = gridPos.col - Math.floor(getPieceWidth(gamePiece.piece) / 2);
    if (!tryPlacePiece(pieceIndex, offsetRow, offsetCol)) hapticError();
  }, [currentPieces, grid, screenToGrid, tryPlacePiece]);

  const handleDragCancel = useCallback(() => { setGhostCells([]); setGhostValid(false); }, []);

  const handleGridLayout = useCallback(() => {
    gridViewRef.current?.measureInWindow((x, y, width, height) => {
      gridRef.current = { x, y, width, height };
    });
  }, []);

  return (
    <LinearGradient
      colors={['#1a2e2e', '#162e3e', '#1a2e2e']}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <View style={styles.topBar}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>✕</Text>
        </Pressable>
        <Text style={styles.modeLabel}>ZEN</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Lines counter instead of score */}
      <View style={styles.linesContainer}>
        <Text style={styles.linesLabel}>LINES</Text>
        <Text style={styles.linesValue}>{zenLinesCleared}</Text>
      </View>

      <View style={styles.gridWrapper}>
        <Grid
          ref={gridViewRef} grid={grid} ghostCells={ghostCells} ghostValid={ghostValid}
          clearingRows={lastClearResult?.clearedRows} clearingCols={lastClearResult?.clearedCols}
          onLayout={handleGridLayout} gridSize={gridContainerSize}
        />
      </View>

      <BlockTray
        pieces={currentPieces}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, marginBottom: 8,
  },
  backButton: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  backText: { color: '#94a3b8', fontSize: 18, fontWeight: '700' },
  modeLabel: { color: '#22c55e', fontSize: 18, fontWeight: '800', letterSpacing: 3 },
  linesContainer: { alignItems: 'center', marginBottom: 8 },
  linesLabel: { color: '#64748b', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  linesValue: { color: '#22c55e', fontSize: 32, fontWeight: '800' },
  gridWrapper: { position: 'relative', alignItems: 'center' },
});
