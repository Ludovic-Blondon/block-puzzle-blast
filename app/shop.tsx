import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { usePlayerStore } from '../src/store/playerStore';
import { COLORS } from '../src/utils/colors';
import { PowerUpType, POWERUP_COSTS, getLevelForXP } from '../src/constants/config';
import { THEMES } from '../src/constants/themes';
import { hapticMedium, hapticSuccess, hapticError } from '../src/utils/haptics';
import { soundManager } from '../src/audio/SoundManager';

const SHOP_ITEMS: { type: PowerUpType; icon: string; nameKey: string; descKey: string }[] = [
  { type: 'bomb', icon: '💣', nameKey: 'powerUps.bomb', descKey: 'shop.bombDesc' },
  { type: 'clearLine', icon: '⚡', nameKey: 'powerUps.clearLine', descKey: 'shop.clearLineDesc' },
  { type: 'rotate', icon: '🔄', nameKey: 'powerUps.rotate', descKey: 'shop.rotateDesc' },
];

type ShopTab = 'powerups' | 'themes';

export default function ShopScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { coins, xp, powerUps, ownedThemes, activeTheme, buyPowerUp, buyTheme, setActiveTheme } = usePlayerStore();
  const [tab, setTab] = useState<ShopTab>('powerups');
  const playerLevel = getLevelForXP(xp).level;

  const handleBuyPowerUp = (type: PowerUpType) => {
    hapticMedium();
    if (buyPowerUp(type)) {
      hapticSuccess();
      soundManager.play('buttonTap');
    } else {
      hapticError();
    }
  };

  const handleBuyTheme = (themeId: string) => {
    hapticMedium();
    if (buyTheme(themeId)) {
      hapticSuccess();
      soundManager.play('achievement');
    } else {
      hapticError();
    }
  };

  const handleSelectTheme = (themeId: string) => {
    hapticMedium();
    setActiveTheme(themeId);
  };

  return (
    <LinearGradient
      colors={[COLORS.background, COLORS.backgroundLight, COLORS.background]}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back to home">
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.title}>{t('shop.title')}</Text>
        <View style={styles.coinBox}>
          <Text style={styles.coinText}>{coins} 💰</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <Pressable
          style={[styles.tab, tab === 'powerups' && styles.tabActive]}
          onPress={() => setTab('powerups')}
          accessibilityRole="tab"
          accessibilityLabel="Power-ups tab"
          accessibilityState={{ selected: tab === 'powerups' }}
        >
          <Text style={[styles.tabText, tab === 'powerups' && styles.tabTextActive]}>{t('shop.powerUps')}</Text>
        </Pressable>
        <Pressable
          style={[styles.tab, tab === 'themes' && styles.tabActive]}
          onPress={() => setTab('themes')}
          accessibilityRole="tab"
          accessibilityLabel="Themes tab"
          accessibilityState={{ selected: tab === 'themes' }}
        >
          <Text style={[styles.tabText, tab === 'themes' && styles.tabTextActive]}>{t('shop.themes')}</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {tab === 'powerups' && SHOP_ITEMS.map((item) => {
          const cost = POWERUP_COSTS[item.type];
          const owned = powerUps[item.type];
          const canAfford = coins >= cost;

          return (
            <View key={item.type} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemIcon}>{item.icon}</Text>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{t(item.nameKey)}</Text>
                  <Text style={styles.itemDescription}>{t(item.descKey)}</Text>
                </View>
                <View style={styles.ownedBadge}>
                  <Text style={styles.ownedText}>x{owned}</Text>
                </View>
              </View>
              <Pressable
                style={[styles.buyButton, !canAfford && styles.buyButtonDisabled]}
                onPress={() => handleBuyPowerUp(item.type)}
                disabled={!canAfford}
                accessibilityRole="button"
                accessibilityLabel={"Buy " + t(item.nameKey) + " for " + cost + " coins"}
              >
                <Text style={[styles.buyText, !canAfford && styles.buyTextDisabled]}>
                  {t('shop.cost', { cost })}
                </Text>
              </Pressable>
            </View>
          );
        })}

        {tab === 'themes' && THEMES.map((theme) => {
          const owned = ownedThemes.includes(theme.id);
          const isActive = activeTheme === theme.id;
          const canAfford = coins >= theme.price;
          const levelLocked = theme.unlockLevel != null && playerLevel < theme.unlockLevel;

          return (
            <View key={theme.id} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                {/* Theme preview */}
                <View style={styles.themePreview}>
                  {theme.blockColors.slice(0, 4).map((color, i) => (
                    <View key={i} style={[styles.previewBlock, { backgroundColor: color }]} />
                  ))}
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{t('themes.' + theme.id, { defaultValue: theme.name })}</Text>
                  {owned && isActive && <Text style={styles.activeLabel}>{t('shop.active')}</Text>}
                  {levelLocked && (
                    <Text style={styles.lockText}>{t('shop.requiresLevel', { level: theme.unlockLevel })}</Text>
                  )}
                </View>
                {owned && (
                  <View style={[styles.ownedBadge, isActive && styles.activeBadge]}>
                    <Text style={styles.ownedText}>{isActive ? '✓' : t('shop.owned')}</Text>
                  </View>
                )}
              </View>

              {owned ? (
                !isActive ? (
                  <Pressable style={styles.selectButton} onPress={() => handleSelectTheme(theme.id)} accessibilityRole="button" accessibilityLabel={"Select " + theme.name + " theme"}>
                    <Text style={styles.selectText}>{t('shop.use')}</Text>
                  </Pressable>
                ) : null
              ) : (
                <Pressable
                  style={[styles.buyButton, (!canAfford || levelLocked) && styles.buyButtonDisabled]}
                  onPress={() => handleBuyTheme(theme.id)}
                  disabled={!canAfford || !!levelLocked}
                  accessibilityRole="button"
                  accessibilityLabel={"Buy " + theme.name + " theme for " + theme.price + " coins"}
                >
                  <Text style={[styles.buyText, (!canAfford || levelLocked) && styles.buyTextDisabled]}>
                    {theme.price === 0 ? t('shop.free') : t('shop.cost', { cost: theme.price })}
                  </Text>
                </Pressable>
              )}
            </View>
          );
        })}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, marginBottom: 16,
  },
  backButton: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  backText: { color: COLORS.textSecondary, fontSize: 18, fontWeight: '700' },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.text, letterSpacing: 3 },
  coinBox: {
    backgroundColor: COLORS.surface, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12,
  },
  coinText: { color: COLORS.accentGold, fontSize: 14, fontWeight: '800' },
  tabs: {
    flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 16,
  },
  tab: {
    flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: COLORS.surface,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: COLORS.accent },
  tabText: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '700' },
  tabTextActive: { color: COLORS.text },
  scrollView: { flex: 1 },
  content: { padding: 16, gap: 16 },
  itemCard: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 16 },
  itemHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  itemIcon: { fontSize: 36, marginRight: 12 },
  itemInfo: { flex: 1 },
  itemName: { color: COLORS.text, fontSize: 18, fontWeight: '800' },
  itemDescription: { color: COLORS.textSecondary, fontSize: 13, marginTop: 2 },
  activeLabel: { color: COLORS.success, fontSize: 12, fontWeight: '700', marginTop: 2 },
  lockText: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600', marginTop: 2 },
  ownedBadge: {
    backgroundColor: COLORS.backgroundLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
  },
  activeBadge: { backgroundColor: COLORS.success },
  ownedText: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '700' },
  buyButton: {
    backgroundColor: COLORS.accentGold, paddingVertical: 12, borderRadius: 12, alignItems: 'center',
  },
  buyButtonDisabled: { backgroundColor: COLORS.gridLine },
  buyText: { color: COLORS.background, fontSize: 16, fontWeight: '800' },
  buyTextDisabled: { color: COLORS.textMuted },
  selectButton: {
    backgroundColor: COLORS.accent, paddingVertical: 12, borderRadius: 12, alignItems: 'center',
  },
  selectText: { color: COLORS.text, fontSize: 16, fontWeight: '800' },
  themePreview: {
    flexDirection: 'row', flexWrap: 'wrap', width: 44, height: 44, borderRadius: 10,
    overflow: 'hidden', marginRight: 12,
  },
  previewBlock: { width: 22, height: 22 },
});
