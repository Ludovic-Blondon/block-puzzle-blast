import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { COLORS } from '../utils/colors';
import { PowerUpType } from '../constants/config';

interface PowerUpBarProps {
  powerUps: Record<PowerUpType, number>;
  activePowerUp: PowerUpType | null;
  onSelect: (type: PowerUpType) => void;
}

const POWERUP_INFO: Record<PowerUpType, { icon: string; label: string }> = {
  bomb: { icon: '💣', label: 'Bomb' },
  clearLine: { icon: '⚡', label: 'Clear' },
  rotate: { icon: '🔄', label: 'Rotate' },
};

function PowerUpBar({ powerUps, activePowerUp, onSelect }: PowerUpBarProps) {
  return (
    <View style={styles.container}>
      {(Object.keys(POWERUP_INFO) as PowerUpType[]).map((type) => {
        const info = POWERUP_INFO[type];
        const count = powerUps[type];
        const isActive = activePowerUp === type;

        return (
          <Pressable
            key={type}
            style={[styles.button, isActive && styles.activeButton, count === 0 && styles.disabledButton]}
            onPress={() => count > 0 && onSelect(type)}
            disabled={count === 0}
            accessibilityRole="button"
            accessibilityLabel={`${info.label}, ${count} remaining`}
            accessibilityState={{ selected: isActive, disabled: count === 0 }}
          >
            <Text style={styles.icon}>{info.icon}</Text>
            <Text style={[styles.label, count === 0 && styles.disabledLabel]}>
              {info.label}
            </Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{count}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

export default React.memo(PowerUpBar);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  button: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: 70,
    position: 'relative',
  },
  activeButton: {
    backgroundColor: COLORS.accent,
    borderWidth: 2,
    borderColor: COLORS.accentGold,
  },
  disabledButton: {
    opacity: 0.4,
  },
  icon: {
    fontSize: 24,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  disabledLabel: {
    color: COLORS.textMuted,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.accentGold,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: COLORS.background,
    fontSize: 11,
    fontWeight: '800',
  },
});
