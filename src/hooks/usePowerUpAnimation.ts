import { useState, useCallback } from 'react';
import { GRID_SIZE } from '../constants/config';
import { Grid } from '../game/engine';
import { soundManager } from '../audio/SoundManager';
import { hapticHeavy, hapticMedium, hapticLight } from '../utils/haptics';
import { PowerUpType } from '../constants/config';

interface BombAnimData {
  centerRow: number;
  centerCol: number;
  cells: { row: number; col: number }[];
}

interface LineAnimData {
  row: number;
}

interface RotateAnimData {
  pieceIndex: number;
}

interface UsePowerUpAnimationParams {
  grid: Grid;
  activePowerUp: PowerUpType | null;
  setActivePowerUp: (type: PowerUpType | null) => void;
  usePowerUp: (type: PowerUpType) => boolean;
  applyBombToGrid: (row: number, col: number) => void;
  applyClearLineToGrid: (row: number) => void;
  rotatePieceInTray: (pieceIndex: number) => void;
  setShakeTrigger: React.Dispatch<React.SetStateAction<number>>;
}

export function usePowerUpAnimation({
  grid,
  activePowerUp,
  setActivePowerUp,
  usePowerUp,
  applyBombToGrid,
  applyClearLineToGrid,
  rotatePieceInTray,
  setShakeTrigger,
}: UsePowerUpAnimationParams) {
  const [bombAnimTrigger, setBombAnimTrigger] = useState(0);
  const [bombAnimData, setBombAnimData] = useState<BombAnimData | null>(null);
  const [lineAnimTrigger, setLineAnimTrigger] = useState(0);
  const [lineAnimData, setLineAnimData] = useState<LineAnimData | null>(null);
  const [rotateAnimTrigger, setRotateAnimTrigger] = useState(0);
  const [rotateAnimData, setRotateAnimData] = useState<RotateAnimData | null>(null);

  const animating = bombAnimData !== null || lineAnimData !== null || rotateAnimData !== null;

  const handleGridCellPress = useCallback(
    (row: number, col: number) => {
      if (animating) return;

      if (activePowerUp === 'bomb') {
        if (usePowerUp('bomb')) {
          // Collect affected cells that are filled
          const cells: { row: number; col: number }[] = [];
          for (let r = row - 1; r <= row + 1; r++) {
            for (let c = col - 1; c <= col + 1; c++) {
              if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE && grid[r][c] !== 0) {
                cells.push({ row: r, col: c });
              }
            }
          }
          setBombAnimData({ centerRow: row, centerCol: col, cells });
          setBombAnimTrigger((t) => t + 1);
          setActivePowerUp(null);
          soundManager.play('powerUp');
        }
      } else if (activePowerUp === 'clearLine') {
        if (usePowerUp('clearLine')) {
          setLineAnimData({ row });
          setLineAnimTrigger((t) => t + 1);
          setActivePowerUp(null);
          soundManager.play('powerUp');
        }
      }
    },
    [animating, activePowerUp, usePowerUp, grid, setActivePowerUp]
  );

  const handlePieceTap = useCallback(
    (pieceIndex: number) => {
      if (animating) return;

      if (activePowerUp === 'rotate') {
        if (usePowerUp('rotate')) {
          setRotateAnimData({ pieceIndex });
          setRotateAnimTrigger((t) => t + 1);
          setActivePowerUp(null);
          soundManager.play('powerUp');
        }
      }
    },
    [animating, activePowerUp, usePowerUp, setActivePowerUp]
  );

  const onBombComplete = useCallback(() => {
    if (bombAnimData) {
      applyBombToGrid(bombAnimData.centerRow, bombAnimData.centerCol);
      setShakeTrigger((t) => t + 1);
      hapticHeavy();
    }
    setBombAnimData(null);
  }, [bombAnimData, applyBombToGrid, setShakeTrigger]);

  const onLineComplete = useCallback(() => {
    if (lineAnimData) {
      applyClearLineToGrid(lineAnimData.row);
      hapticMedium();
    }
    setLineAnimData(null);
  }, [lineAnimData, applyClearLineToGrid]);

  const onRotateMidpoint = useCallback(() => {
    if (rotateAnimData) {
      rotatePieceInTray(rotateAnimData.pieceIndex);
      hapticLight();
    }
  }, [rotateAnimData, rotatePieceInTray]);

  const onRotateComplete = useCallback(() => {
    setRotateAnimData(null);
  }, []);

  return {
    animating,
    // Bomb
    bombAnimTrigger,
    bombAnimData,
    onBombComplete,
    // Line
    lineAnimTrigger,
    lineAnimData,
    onLineComplete,
    // Rotate
    rotateAnimTrigger,
    rotateAnimData,
    onRotateMidpoint,
    onRotateComplete,
    // Handlers
    handleGridCellPress,
    handlePieceTap,
  };
}
