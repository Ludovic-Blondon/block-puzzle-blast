import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePlayerStore } from '../src/store/playerStore';
import { COLORS } from '../src/utils/colors';
import { PowerUpType, POWERUP_COSTS } from '../src/constants/config';
import { hapticMedium, hapticSuccess, hapticError } from '../src/utils/haptics';

const SHOP_ITEMS: {
  type: PowerUpType;
  icon: string;
  name: string;
  description: string;
}[] = [
  {
    type: 'bomb',
    icon: '💣',
    name: 'Bomb',
    description: 'Clears a 3x3 area on the grid',
  },
  {
    type: 'clearLine',
    icon: '⚡',
    name: 'Line Clear',
    description: 'Clears an entire row',
  },
  {
    type: 'rotate',
    icon: '🔄',
    name: 'Rotate',
    description: 'Rotate a piece 90 degrees',
  },
];

export default function ShopScreen() {
  const insets = useSafeAreaInsets();
  const { coins, powerUps, buyPowerUp } = usePlayerStore();

  const handleBuy = (type: PowerUpType) => {
    hapticMedium();
    const success = buyPowerUp(type);
    if (success) {
      hapticSuccess();
    } else {
      hapticError();
    }
  };

  return (
    <LinearGradient
      colors={[COLORS.background, COLORS.backgroundLight, COLORS.background]}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.title}>SHOP</Text>
        <View style={styles.coinBox}>
          <Text style={styles.coinText}>{coins} 💰</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {SHOP_ITEMS.map((item) => {
          const cost = POWERUP_COSTS[item.type];
          const owned = powerUps[item.type];
          const canAfford = coins >= cost;

          return (
            <View key={item.type} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemIcon}>{item.icon}</Text>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemDescription}>{item.description}</Text>
                </View>
                <View style={styles.ownedBadge}>
                  <Text style={styles.ownedText}>x{owned}</Text>
                </View>
              </View>

              <Pressable
                style={[styles.buyButton, !canAfford && styles.buyButtonDisabled]}
                onPress={() => handleBuy(item.type)}
                disabled={!canAfford}
              >
                <Text style={[styles.buyText, !canAfford && styles.buyTextDisabled]}>
                  {cost} coins
                </Text>
              </Pressable>
            </View>
          );
        })}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 24,
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
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 3,
  },
  coinBox: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  coinText: {
    color: COLORS.accentGold,
    fontSize: 14,
    fontWeight: '800',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  itemCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemIcon: {
    fontSize: 36,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
  },
  itemDescription: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  ownedBadge: {
    backgroundColor: COLORS.backgroundLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ownedText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  buyButton: {
    backgroundColor: COLORS.accentGold,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  buyButtonDisabled: {
    backgroundColor: COLORS.gridLine,
  },
  buyText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: '800',
  },
  buyTextDisabled: {
    color: COLORS.textMuted,
  },
});
