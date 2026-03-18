import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, useWindowDimensions, Pressable, Text } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGameStore } from '../src/store/gameStore';
import { usePlayerStore } from '../src/store/playerStore';
import { COLORS } from '../src/utils/colors';
import { GRID_SIZE, CELL_GAP, XP_DAILY_BONUS } from '../src/constants/config';
import { getPieceHeight, getPieceWidth } from '../src/game/pieces';
import { canPlacePiece } from '../src/game/engine';
import Grid from '../src/components/Grid';
import BlockTray from '../src/components/BlockTray';
import GameOverModal from '../src/components/GameOverModal';
import { hapticSuccess, hapticError, hapticHeavy } from '../src/utils/haptics';
import { soundManager } from '../src/audio/SoundManager';

export default function DailyScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const gridContainerSize = screenWidth - 32;
  const insets = useSafeAreaInsets();

  const {
    grid, currentPieces, isGameOver, lastClearResult,
    dailyMovesLeft, dailyObjective, dailyLinesCleared,
    startNewGame, tryPlacePiece,
  } = useGameStore();

  const {
    addCoins, addXP, incrementGamesPlayed, addLinesCleared,
    incrementDailyChallengesCompleted, saveData,
  } = usePlayerStore();

  const [ghostCells, setGhostCells] = useState<{ row: number; col: number }[]>([]);
  const [ghostValid, setGhostValid] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [challengeComplete, setChallengeComplete] = useState(false);

  const gridRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null);
  const gridViewRef = useRef<View>(null);

  useEffect(() => {
    if (!gameStarted) {
      startNewGame('daily');
      incrementGamesPlayed();
      setGameStarted(true);
    }
  }, []);

  useEffect(() => {
    if (lastClearResult && lastClearResult.linesCleared > 0) {
      addLinesCleared(lastClearResult.linesCleared);
      hapticSuccess();
      soundManager.play('lineClear');
    }
  }, [lastClearResult]);

  // Check daily objective completion
  useEffect(() => {
    if (dailyLinesCleared >= dailyObjective && !challengeComplete) {
      setChallengeComplete(true);
      incrementDailyChallengesCompleted();
      addCoins(100);
      addXP(XP_DAILY_BONUS);
      soundManager.play('achievement');
    }
  }, [dailyLinesCleared, dailyObjective]);

  useEffect(() => {
    if (isGameOver) {
      hapticHeavy();
      soundManager.play('gameOver');
      saveData();
    }
  }, [isGameOver]);

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

  const success = dailyLinesCleared >= dailyObjective;

  return (
    <LinearGradient
      colors={[COLORS.background, COLORS.backgroundLight, COLORS.background]}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <View style={styles.topBar}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>✕</Text>
        </Pressable>
        <Text style={styles.modeLabel}>DAILY CHALLENGE</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Objective and moves */}
      <View style={styles.objectiveBar}>
        <View style={styles.objectiveBox}>
          <Text style={styles.objectiveLabel}>LINES</Text>
          <Text style={[styles.objectiveValue, success && styles.successText]}>
            {dailyLinesCleared}/{dailyObjective}
          </Text>
        </View>
        <View style={styles.objectiveBox}>
          <Text style={styles.objectiveLabel}>MOVES LEFT</Text>
          <Text style={[styles.objectiveValue, dailyMovesLeft <= 3 && styles.urgentText]}>
            {dailyMovesLeft}
          </Text>
        </View>
      </View>

      {success && (
        <View style={styles.successBanner}>
          <Text style={styles.successBannerText}>CHALLENGE COMPLETE!</Text>
        </View>
      )}

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

      <GameOverModal
        visible={isGameOver}
        score={dailyLinesCleared}
        bestScore={dailyObjective}
        isNewBest={success}
        coinsEarned={success ? 100 : 0}
        modeName="Daily Challenge"
        onPlayAgain={() => router.back()}
        onGoHome={() => router.back()}
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
    width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  backText: { color: COLORS.textSecondary, fontSize: 18, fontWeight: '700' },
  modeLabel: { color: '#a855f7', fontSize: 16, fontWeight: '900', letterSpacing: 2 },
  objectiveBar: {
    flexDirection: 'row', justifyContent: 'center', gap: 24, marginBottom: 8, paddingHorizontal: 16,
  },
  objectiveBox: { alignItems: 'center' },
  objectiveLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  objectiveValue: { color: COLORS.text, fontSize: 24, fontWeight: '900' },
  successText: { color: COLORS.success },
  urgentText: { color: COLORS.danger },
  successBanner: {
    backgroundColor: COLORS.success, paddingVertical: 8, marginHorizontal: 16, borderRadius: 12,
    alignItems: 'center', marginBottom: 8,
  },
  successBannerText: { color: COLORS.text, fontSize: 16, fontWeight: '900', letterSpacing: 2 },
  gridWrapper: { position: 'relative', alignItems: 'center' },
});
