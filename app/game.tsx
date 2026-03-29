import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, useWindowDimensions, Pressable, Text } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGameStore } from '../src/store/gameStore';
import { usePlayerStore } from '../src/store/playerStore';
import { COLORS } from '../src/utils/colors';
import { GRID_SIZE, CELL_GAP, LEVEL_THRESHOLD, getLevelForXP } from '../src/constants/config';
import { getPieceHeight, getPieceWidth } from '../src/game/pieces';
import { canPlacePiece } from '../src/game/engine';
import Grid from '../src/components/Grid';
import BlockTray from '../src/components/BlockTray';
import ScoreDisplay from '../src/components/ScoreDisplay';
import ComboPopup from '../src/components/ComboPopup';
import GameOverModal from '../src/components/GameOverModal';
import PowerUpBar from '../src/components/PowerUpBar';
import ScreenShake from '../src/components/effects/ScreenShake';
import ScoreFlyUp from '../src/components/effects/ScoreFlyUp';
import BombExplosion from '../src/components/effects/BombExplosion';
import LineSweep from '../src/components/effects/LineSweep';
import LevelUpBanner from '../src/components/effects/LevelUpBanner';
import AchievementToast from '../src/components/effects/AchievementToast';
import { hapticSuccess, hapticError, hapticHeavy } from '../src/utils/haptics';
import { PowerUpType } from '../src/constants/config';
import { soundManager } from '../src/audio/SoundManager';
import { usePowerUpAnimation } from '../src/hooks/usePowerUpAnimation';

export default function GameScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const gridContainerSize = screenWidth - 32;
  const insets = useSafeAreaInsets();

  const {
    grid,
    currentPieces,
    score,
    streak,
    isGameOver,
    lastClearResult,
    lastScoreResult,
    level,
    lastLevel,
    startNewGame,
    tryPlacePiece,
    applyBombToGrid,
    applyClearLineToGrid,
    rotatePieceInTray,
  } = useGameStore();

  const {
    coins,
    bestScore,
    powerUps,
    xp,
    pendingAchievementToast,
    addCoins,
    updateBestScore,
    incrementGamesPlayed,
    addLinesCleared,
    usePowerUp,
    updateMaxComboLines,
    updateMaxStreak,
    addScoreXP,
    addScoreAccumulated,
    incrementPiecesPlaced,
    incrementComboCount,
    addLeaderboardEntry,
    dismissAchievementToast,
    saveData,
  } = usePlayerStore();

  const [ghostCells, setGhostCells] = useState<{ row: number; col: number }[]>([]);
  const [ghostValid, setGhostValid] = useState(false);
  const [activePowerUp, setActivePowerUp] = useState<PowerUpType | null>(null);
  const [totalCoinsEarned, setTotalCoinsEarned] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  // Effects triggers
  const [shakeTrigger, setShakeTrigger] = useState(0);
  const [scoreFlyTrigger, setScoreFlyTrigger] = useState(0);
  const [lastPoints, setLastPoints] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpLevel, setLevelUpLevel] = useState(1);

  const gridRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null);
  const gridViewRef = useRef<View>(null);

  // Start game on mount
  useEffect(() => {
    if (!gameStarted) {
      startNewGame('classic');
      incrementGamesPlayed();
      setGameStarted(true);
      setTotalCoinsEarned(0);
    }
  }, []);

  // Track coins earned & score XP
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

  // Track lines cleared + combos
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

  // Track streak
  useEffect(() => {
    if (streak > 0) {
      updateMaxStreak(streak);
    }
  }, [streak]);

  // Piece placed tracking
  useEffect(() => {
    if (lastScoreResult) {
      incrementPiecesPlaced();
    }
  }, [lastScoreResult]);

  // Level-up detection
  useEffect(() => {
    if (level > lastLevel) {
      setLevelUpLevel(level);
      setShowLevelUp(true);
      soundManager.play('levelUp');
    }
  }, [level, lastLevel]);

  // Game over handling
  useEffect(() => {
    if (isGameOver) {
      hapticHeavy();
      soundManager.play('gameOver');
      updateBestScore(score);
      addScoreXP(score, 'classic');
      addLeaderboardEntry(score, 'classic');
      saveData();
    }
  }, [isGameOver]);

  const screenToGrid = useCallback(
    (screenX: number, screenY: number) => {
      if (!gridRef.current) return null;
      const { x, y, width } = gridRef.current;
      const cellSize = (width - CELL_GAP * (GRID_SIZE + 1)) / GRID_SIZE;
      const totalCellSize = cellSize + CELL_GAP;

      const col = Math.floor((screenX - x - CELL_GAP) / totalCellSize);
      const row = Math.floor((screenY - y - CELL_GAP) / totalCellSize);

      if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) return null;
      return { row, col };
    },
    []
  );

  const handleDragMove = useCallback(
    (pieceIndex: number, x: number, y: number) => {
      const gamePiece = currentPieces[pieceIndex];
      if (!gamePiece) return;

      const gridPos = screenToGrid(x, y);
      if (!gridPos) {
        setGhostCells([]);
        setGhostValid(false);
        return;
      }

      const offsetRow = gridPos.row - Math.floor(getPieceHeight(gamePiece.piece) / 2);
      const offsetCol = gridPos.col - Math.floor(getPieceWidth(gamePiece.piece) / 2);

      const cells: { row: number; col: number }[] = [];
      const piece = gamePiece.piece;
      for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[0].length; c++) {
          if (piece.shape[r][c]) {
            cells.push({ row: offsetRow + r, col: offsetCol + c });
          }
        }
      }

      const valid = canPlacePiece(grid, piece, offsetRow, offsetCol);
      setGhostCells(cells);
      setGhostValid(valid);
    },
    [currentPieces, grid, screenToGrid]
  );

  const handleDragEnd = useCallback(
    (pieceIndex: number, x: number, y: number) => {
      const gamePiece = currentPieces[pieceIndex];
      if (!gamePiece) return;

      const gridPos = screenToGrid(x, y);
      setGhostCells([]);
      setGhostValid(false);

      if (!gridPos) return;

      const offsetRow = gridPos.row - Math.floor(getPieceHeight(gamePiece.piece) / 2);
      const offsetCol = gridPos.col - Math.floor(getPieceWidth(gamePiece.piece) / 2);

      const placed = tryPlacePiece(pieceIndex, offsetRow, offsetCol);
      if (!placed) {
        hapticError();
      }
    },
    [currentPieces, grid, screenToGrid, tryPlacePiece]
  );

  const handleDragCancel = useCallback(() => {
    setGhostCells([]);
    setGhostValid(false);
  }, []);

  const handleGridLayout = useCallback(() => {
    gridViewRef.current?.measureInWindow(
      (x: number, y: number, width: number, height: number) => {
        gridRef.current = { x, y, width, height };
      }
    );
  }, []);

  const handlePlayAgain = () => {
    startNewGame('classic');
    incrementGamesPlayed();
    setTotalCoinsEarned(0);
  };

  const handleGoHome = () => {
    router.back();
  };

  const handlePowerUpSelect = (type: PowerUpType) => {
    if (activePowerUp === type) {
      setActivePowerUp(null);
    } else {
      setActivePowerUp(type);
    }
  };

  const {
    animating,
    bombAnimTrigger, bombAnimData, onBombComplete,
    lineAnimTrigger, lineAnimData, onLineComplete,
    rotateAnimTrigger, rotateAnimData, onRotateMidpoint, onRotateComplete,
    handleGridCellPress, handlePieceTap,
  } = usePowerUpAnimation({
    grid,
    activePowerUp,
    setActivePowerUp,
    usePowerUp,
    applyBombToGrid,
    applyClearLineToGrid,
    rotatePieceInTray,
    setShakeTrigger,
  });

  return (
    <LinearGradient
      colors={[COLORS.background, COLORS.backgroundLight, COLORS.background]}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      {/* Achievement toast */}
      {pendingAchievementToast && (
        <AchievementToast
          name={pendingAchievementToast.name}
          tier={pendingAchievementToast.tier}
          visible={true}
          onDone={dismissAchievementToast}
        />
      )}

      {/* Level up banner */}
      <LevelUpBanner
        level={levelUpLevel}
        visible={showLevelUp}
        onDone={() => setShowLevelUp(false)}
      />

      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable style={styles.backButton} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Close game">
          <Text style={styles.backText}>✕</Text>
        </Pressable>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>Lv.{level}</Text>
        </View>
      </View>

      {/* Score */}
      <ScoreDisplay score={score} bestScore={bestScore} coins={coins} />

      {/* Grid with effects */}
      <ScreenShake trigger={shakeTrigger} intensity={lastClearResult && lastClearResult.linesCleared >= 3 ? 8 : 4}>
        <View style={styles.gridWrapper}>
          <Grid
            ref={gridViewRef}
            grid={grid}
            ghostCells={ghostCells}
            ghostValid={ghostValid}
            clearingRows={lastClearResult?.clearedRows}
            clearingCols={lastClearResult?.clearedCols}
            onLayout={handleGridLayout}
            gridSize={gridContainerSize}
            onCellPress={!animating && (activePowerUp === 'bomb' || activePowerUp === 'clearLine') ? handleGridCellPress : undefined}
          />

          {/* Power-up animations */}
          {bombAnimData && (
            <BombExplosion
              cells={bombAnimData.cells}
              centerRow={bombAnimData.centerRow}
              centerCol={bombAnimData.centerCol}
              cellSize={(gridContainerSize - CELL_GAP * (GRID_SIZE + 1)) / GRID_SIZE}
              trigger={bombAnimTrigger}
              onComplete={onBombComplete}
            />
          )}
          {lineAnimData && (
            <LineSweep
              row={lineAnimData.row}
              cellSize={(gridContainerSize - CELL_GAP * (GRID_SIZE + 1)) / GRID_SIZE}
              gridWidth={gridContainerSize}
              trigger={lineAnimTrigger}
              onComplete={onLineComplete}
            />
          )}

          {/* Score fly-up */}
          <ScoreFlyUp points={lastPoints} trigger={scoreFlyTrigger} />

          {/* Combo popup */}
          {lastClearResult && lastClearResult.linesCleared >= 2 && (
            <ComboPopup
              linesCleared={lastClearResult.linesCleared}
              streak={streak}
            />
          )}
        </View>
      </ScreenShake>

      {/* Power-ups */}
      <PowerUpBar
        powerUps={powerUps}
        activePowerUp={activePowerUp}
        onSelect={handlePowerUpSelect}
      />

      {/* Block tray */}
      <BlockTray
        pieces={currentPieces}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
        onPieceTap={!animating && activePowerUp === 'rotate' ? handlePieceTap : undefined}
        rotateAnimTrigger={rotateAnimTrigger}
        rotateAnimPieceIndex={rotateAnimData?.pieceIndex ?? -1}
        onRotateMidpoint={onRotateMidpoint}
        onRotateComplete={onRotateComplete}
      />

      {/* Game Over Modal */}
      <GameOverModal
        visible={isGameOver}
        score={score}
        bestScore={Math.max(bestScore, score)}
        isNewBest={score > bestScore}
        coinsEarned={totalCoinsEarned}
        modeName="Classic"
        onPlayAgain={handlePlayAgain}
        onGoHome={handleGoHome}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    color: COLORS.textSecondary,
    fontSize: 18,
    fontWeight: '700',
  },
  levelBadge: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  levelText: {
    color: COLORS.accentGold,
    fontSize: 14,
    fontWeight: '800',
  },
  gridWrapper: {
    position: 'relative',
    alignItems: 'center',
  },
});
