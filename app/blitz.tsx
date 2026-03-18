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
import ScoreDisplay from '../src/components/ScoreDisplay';
import ComboPopup from '../src/components/ComboPopup';
import GameOverModal from '../src/components/GameOverModal';
import PowerUpBar from '../src/components/PowerUpBar';
import BlitzTimer from '../src/components/BlitzTimer';
import ScreenShake from '../src/components/effects/ScreenShake';
import ScoreFlyUp from '../src/components/effects/ScoreFlyUp';
import AchievementToast from '../src/components/effects/AchievementToast';
import { hapticSuccess, hapticError, hapticHeavy } from '../src/utils/haptics';
import { PowerUpType } from '../src/constants/config';
import { soundManager } from '../src/audio/SoundManager';

export default function BlitzScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const gridContainerSize = screenWidth - 32;
  const insets = useSafeAreaInsets();

  const {
    grid, currentPieces, score, streak, isGameOver,
    lastClearResult, lastScoreResult, timeRemaining, timerRunning,
    startNewGame, tryPlacePiece, applyBombToGrid, applyClearLineToGrid,
    rotatePieceInTray, tickTimer,
  } = useGameStore();

  const {
    coins, bestScoreBlitz, powerUps, pendingAchievementToast,
    addCoins, updateBestScore, incrementGamesPlayed, addLinesCleared,
    usePowerUp, updateMaxComboLines, updateMaxStreak,
    addScoreXP, addScoreAccumulated, incrementPiecesPlaced,
    incrementComboCount, addLeaderboardEntry, dismissAchievementToast, saveData,
  } = usePlayerStore();

  const [ghostCells, setGhostCells] = useState<{ row: number; col: number }[]>([]);
  const [ghostValid, setGhostValid] = useState(false);
  const [activePowerUp, setActivePowerUp] = useState<PowerUpType | null>(null);
  const [totalCoinsEarned, setTotalCoinsEarned] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [shakeTrigger, setShakeTrigger] = useState(0);
  const [scoreFlyTrigger, setScoreFlyTrigger] = useState(0);
  const [lastPoints, setLastPoints] = useState(0);

  const gridRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null);
  const gridViewRef = useRef<View>(null);

  // Start game
  useEffect(() => {
    if (!gameStarted) {
      startNewGame('blitz');
      incrementGamesPlayed();
      setGameStarted(true);
      setTotalCoinsEarned(0);
    }
  }, []);

  // Timer tick
  useEffect(() => {
    if (!timerRunning || isGameOver) return;
    const interval = setInterval(() => tickTimer(), 1000);
    return () => clearInterval(interval);
  }, [timerRunning, isGameOver]);

  // Track coins & score
  useEffect(() => {
    if (lastScoreResult && lastScoreResult.coinsEarned > 0) {
      addCoins(lastScoreResult.coinsEarned);
      setTotalCoinsEarned((prev) => prev + lastScoreResult.coinsEarned);
    }
    if (lastScoreResult && lastScoreResult.points > 0) {
      addScoreAccumulated(lastScoreResult.points);
      setLastPoints(lastScoreResult.points);
      setScoreFlyTrigger((t) => t + 1);
      soundManager.play('place');
    }
  }, [lastScoreResult]);

  useEffect(() => {
    if (lastClearResult && lastClearResult.linesCleared > 0) {
      addLinesCleared(lastClearResult.linesCleared);
      updateMaxComboLines(lastClearResult.linesCleared);
      hapticSuccess();
      soundManager.play('lineClear');
      if (lastClearResult.linesCleared >= 2) {
        incrementComboCount();
        soundManager.play('combo');
        setShakeTrigger((t) => t + 1);
      }
    }
  }, [lastClearResult]);

  useEffect(() => {
    if (streak > 0) updateMaxStreak(streak);
  }, [streak]);

  useEffect(() => {
    if (lastScoreResult) incrementPiecesPlaced();
  }, [lastScoreResult]);

  useEffect(() => {
    if (isGameOver) {
      hapticHeavy();
      soundManager.play('gameOver');
      updateBestScore(score, 'blitz');
      addScoreXP(score, 'blitz');
      addLeaderboardEntry(score, 'blitz');
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

  const handlePlayAgain = () => {
    startNewGame('blitz');
    incrementGamesPlayed();
    setTotalCoinsEarned(0);
  };

  const handlePowerUpSelect = (type: PowerUpType) => {
    setActivePowerUp(activePowerUp === type ? null : type);
  };

  const handleGridCellPress = useCallback((row: number, col: number) => {
    if (activePowerUp === 'bomb' && usePowerUp('bomb')) {
      applyBombToGrid(row, col); setActivePowerUp(null); soundManager.play('powerUp');
    } else if (activePowerUp === 'clearLine' && usePowerUp('clearLine')) {
      applyClearLineToGrid(row); setActivePowerUp(null); soundManager.play('powerUp');
    }
  }, [activePowerUp, usePowerUp, applyBombToGrid, applyClearLineToGrid]);

  const handlePieceTap = useCallback((pieceIndex: number) => {
    if (activePowerUp === 'rotate' && usePowerUp('rotate')) {
      rotatePieceInTray(pieceIndex); setActivePowerUp(null); soundManager.play('powerUp');
    }
  }, [activePowerUp, usePowerUp, rotatePieceInTray]);

  return (
    <LinearGradient
      colors={[COLORS.background, COLORS.backgroundLight, COLORS.background]}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      {pendingAchievementToast && (
        <AchievementToast name={pendingAchievementToast.name} tier={pendingAchievementToast.tier} visible onDone={dismissAchievementToast} />
      )}

      <View style={styles.topBar}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>✕</Text>
        </Pressable>
        <Text style={styles.modeLabel}>BLITZ</Text>
        <View style={{ width: 36 }} />
      </View>

      <BlitzTimer timeRemaining={timeRemaining} />
      <ScoreDisplay score={score} bestScore={bestScoreBlitz} coins={coins} />

      <ScreenShake trigger={shakeTrigger} intensity={lastClearResult && lastClearResult.linesCleared >= 3 ? 8 : 4}>
        <View style={styles.gridWrapper}>
          <Grid ref={gridViewRef} grid={grid} ghostCells={ghostCells} ghostValid={ghostValid}
            clearingRows={lastClearResult?.clearedRows} clearingCols={lastClearResult?.clearedCols}
            onLayout={handleGridLayout} gridSize={gridContainerSize}
            onCellPress={activePowerUp === 'bomb' || activePowerUp === 'clearLine' ? handleGridCellPress : undefined} />
          <ScoreFlyUp points={lastPoints} trigger={scoreFlyTrigger} />
          {lastClearResult && lastClearResult.linesCleared >= 2 && (
            <ComboPopup linesCleared={lastClearResult.linesCleared} streak={streak} />
          )}
        </View>
      </ScreenShake>

      <PowerUpBar powerUps={powerUps} activePowerUp={activePowerUp} onSelect={handlePowerUpSelect} />
      <BlockTray pieces={currentPieces} onDragMove={handleDragMove} onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel} onPieceTap={activePowerUp === 'rotate' ? handlePieceTap : undefined} />

      <GameOverModal visible={isGameOver} score={score} bestScore={Math.max(bestScoreBlitz, score)}
        isNewBest={score > bestScoreBlitz} coinsEarned={totalCoinsEarned} modeName="Blitz"
        onPlayAgain={handlePlayAgain} onGoHome={() => router.back()} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, marginBottom: 4,
  },
  backButton: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  backText: { color: COLORS.textSecondary, fontSize: 18, fontWeight: '700' },
  modeLabel: { color: COLORS.warning, fontSize: 18, fontWeight: '900', letterSpacing: 2 },
  gridWrapper: { position: 'relative', alignItems: 'center' },
});
