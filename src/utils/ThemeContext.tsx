import React, { createContext, useContext } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { getThemeById, Theme } from '../constants/themes';
import { COLORS, BLOCK_COLORS } from './colors';

interface ThemeColors {
  background: string;
  backgroundLight: string;
  surface: string;
  surfaceLight: string;
  grid: string;
  cellEmpty: string;
  blockColors: string[];
  accent: string;
  // Keep all other COLORS as-is
  text: string;
  textSecondary: string;
  textMuted: string;
  accentGold: string;
  success: string;
  warning: string;
  danger: string;
  ghostValid: string;
  ghostInvalid: string;
  overlay: string;
  gridLine: string;
}

const ThemeContext = createContext<ThemeColors>({
  ...COLORS,
  blockColors: BLOCK_COLORS,
  gridLine: COLORS.gridLine,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const activeThemeId = usePlayerStore((s) => s.activeTheme);
  const theme = getThemeById(activeThemeId);

  const colors: ThemeColors = {
    background: theme.background,
    backgroundLight: theme.backgroundLight,
    surface: theme.surface,
    surfaceLight: theme.surfaceLight,
    grid: theme.grid,
    cellEmpty: theme.cellEmpty,
    blockColors: theme.blockColors,
    accent: theme.accent,
    // Static colors
    text: COLORS.text,
    textSecondary: COLORS.textSecondary,
    textMuted: COLORS.textMuted,
    accentGold: COLORS.accentGold,
    success: COLORS.success,
    warning: COLORS.warning,
    danger: COLORS.danger,
    ghostValid: COLORS.ghostValid,
    ghostInvalid: COLORS.ghostInvalid,
    overlay: COLORS.overlay,
    gridLine: COLORS.gridLine,
  };

  return (
    <ThemeContext.Provider value={colors}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeColors {
  return useContext(ThemeContext);
}
