import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, Pressable, Text } from 'react-native';
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
import { hapticSuccess, hapticError, hapticHeavy } from '../src/utils/haptics';
import { PowerUpType } from '../src/constants/config';

const screenWidth = Dimensions.get('window').width;
const GRID_CONTAINER_SIZE = screenWidth - 32;

export default function GameScreen() {
  const insets = useSafeAreaInsets();

  const {
    grid,
    currentPieces,
    score,
    streak,
    isGameOver,
    lastClearResult,
    lastScoreResult,
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
    addCoins,
    updateBestScore,
    incrementGamesPlayed,
    addLinesCleared,
    usePowerUp,
    updateMaxComboLines,
  } = usePlayerStore();

  const [ghostCells, setGhostCells] = useState<{ row: number; col: number }[]>([]);
  const [ghostValid, setGhostValid] = useState(false);
  const [activePowerUp, setActivePowerUp] = useState<PowerUpType | null>(null);
  const [totalCoinsEarned, setTotalCoinsEarned] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  const gridRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null);

  // Start game on mount
  useEffect(() => {
    if (!gameStarted) {
      startNewGame();
      incrementGamesPlayed();
      setGameStarted(true);
      setTotalCoinsEarned(0);
    }
  }, []);

  // Track coins earned
  useEffect(() => {
    if (lastScoreResult && lastScoreResult.coinsEarned > 0) {
      addCoins(lastScoreResult.coinsEarned);
      setTotalCoinsEarned((prev) => prev + lastScoreResult.coinsEarned);
    }
  }, [lastScoreResult]);

  // Track lines cleared + max combo
  useEffect(() => {
    if (lastClearResult && lastClearResult.linesCleared > 0) {
      addLinesCleared(lastClearResult.linesCleared);
      updateMaxComboLines(lastClearResult.linesCleared);
      hapticSuccess();
    }
  }, [lastClearResult]);

  // Game over handling
  useEffect(() => {
    if (isGameOver) {
      hapticHeavy();
      updateBestScore(score);
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

      // Offset to center the piece on the finger
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

  const handleGridLayout = useCallback(
    (event: any) => {
      event.target.measureInWindow(
        (x: number, y: number, width: number, height: number) => {
          gridRef.current = { x, y, width, height };
        }
      );
    },
    []
  );

  const handlePlayAgain = () => {
    startNewGame();
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

  const handleGridCellPress = useCallback(
    (row: number, col: number) => {
      if (activePowerUp === 'bomb') {
        if (usePowerUp('bomb')) {
          applyBombToGrid(row, col);
          setActivePowerUp(null);
        }
      } else if (activePowerUp === 'clearLine') {
        if (usePowerUp('clearLine')) {
          applyClearLineToGrid(row);
          setActivePowerUp(null);
        }
      }
    },
    [activePowerUp, usePowerUp, applyBombToGrid, applyClearLineToGrid]
  );

  const handlePieceTap = useCallback(
    (pieceIndex: number) => {
      if (activePowerUp === 'rotate') {
        if (usePowerUp('rotate')) {
          rotatePieceInTray(pieceIndex);
          setActivePowerUp(null);
        }
      }
    },
    [activePowerUp, usePowerUp, rotatePieceInTray]
  );

  return (
    <LinearGradient
      colors={[COLORS.background, COLORS.backgroundLight, COLORS.background]}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      {/* Back button */}
      <View style={styles.topBar}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>✕</Text>
        </Pressable>
      </View>

      {/* Score */}
      <ScoreDisplay score={score} bestScore={bestScore} coins={coins} />

      {/* Grid */}
      <View style={styles.gridWrapper}>
        <Grid
          grid={grid}
          ghostCells={ghostCells}
          ghostValid={ghostValid}
          clearingRows={lastClearResult?.clearedRows}
          clearingCols={lastClearResult?.clearedCols}
          onLayout={handleGridLayout}
          gridSize={GRID_CONTAINER_SIZE}
          onCellPress={activePowerUp === 'bomb' || activePowerUp === 'clearLine' ? handleGridCellPress : undefined}
        />

        {/* Combo popup */}
        {lastClearResult && lastClearResult.linesCleared >= 2 && (
          <ComboPopup
            linesCleared={lastClearResult.linesCleared}
            streak={streak}
          />
        )}
      </View>

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
        onPieceTap={activePowerUp === 'rotate' ? handlePieceTap : undefined}
      />

      {/* Game Over Modal */}
      <GameOverModal
        visible={isGameOver}
        score={score}
        bestScore={Math.max(bestScore, score)}
        isNewBest={score > bestScore}
        coinsEarned={totalCoinsEarned}
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
  gridWrapper: {
    position: 'relative',
    alignItems: 'center',
  },
});
