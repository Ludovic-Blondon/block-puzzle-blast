import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../utils/colors';
import { getLevelForXP } from '../constants/config';

interface XPBarProps {
  xp: number;
}

export default function XPBar({ xp }: XPBarProps) {
  const { level, title, xpCurrent, xpNext } = getLevelForXP(xp);
  const progress = xpNext > 0 ? Math.min(xpCurrent / xpNext, 1) : 1;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>{level}</Text>
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.xpText}>
          {xpCurrent}/{xpNext} XP
        </Text>
      </View>
      <View style={styles.barContainer}>
        <View style={[styles.barFill, { width: `${progress * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  levelBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  levelText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '900',
  },
  title: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  xpText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  barContainer: {
    height: 6,
    backgroundColor: COLORS.gridLine,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 3,
  },
});
