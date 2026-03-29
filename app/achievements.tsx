import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { usePlayerStore } from '../src/store/playerStore';
import { COLORS } from '../src/utils/colors';
import { formatAchievementDate, getTierColor } from '../src/constants/achievements';

export default function AchievementsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { achievements } = usePlayerStore();
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  // Sort: unlocked first, then by tier gold > silver > bronze
  const sorted = [...achievements].sort((a, b) => {
    if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
    const tierOrder = { gold: 3, silver: 2, bronze: 1 };
    return (tierOrder[b.tier || 'bronze'] || 0) - (tierOrder[a.tier || 'bronze'] || 0);
  });

  return (
    <LinearGradient
      colors={[COLORS.background, COLORS.backgroundLight, COLORS.background]}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back to home">
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.title}>{t('achievements.title')}</Text>
        <Text style={styles.counter}>
          {unlockedCount}/{achievements.length}
        </Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${(unlockedCount / achievements.length) * 100}%` },
            ]}
          />
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {sorted.map((achievement) => {
          const tierColor = getTierColor(achievement.tier || 'bronze');
          const isSecret = achievement.secret && !achievement.unlocked;

          return (
            <View
              key={achievement.id}
              style={[
                styles.achievementCard,
                achievement.unlocked && styles.unlockedCard,
                achievement.unlocked && { borderColor: tierColor },
              ]}
            >
              <View style={[styles.iconContainer, achievement.unlocked && { backgroundColor: tierColor + '30' }]}>
                <Text style={styles.icon}>
                  {achievement.unlocked ? '🏆' : isSecret ? '❓' : '🔒'}
                </Text>
              </View>
              <View style={styles.achievementInfo}>
                <View style={styles.nameRow}>
                  <Text
                    style={[
                      styles.achievementName,
                      !achievement.unlocked && styles.lockedText,
                    ]}
                  >
                    {isSecret ? t('achievements.hidden') : t('achievements_data.' + achievement.id)}
                  </Text>
                  {achievement.tier && (
                    <View style={[styles.tierBadge, { backgroundColor: tierColor + '30' }]}>
                      <Text style={[styles.tierText, { color: tierColor }]}>
                        {achievement.tier.toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={styles.achievementDescription}>
                  {isSecret ? t('achievements.secret') : t('achievements_data.' + achievement.id + '_desc')}
                </Text>
                {achievement.unlocked && achievement.unlockedAt && (
                  <Text style={[styles.unlockedDate, { color: tierColor }]}>
                    {t('achievements.unlocked', { date: formatAchievementDate(achievement.unlockedAt) })}
                  </Text>
                )}
              </View>
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
  title: { fontSize: 20, fontWeight: '800', color: COLORS.text, letterSpacing: 2 },
  counter: { color: COLORS.accentGold, fontSize: 16, fontWeight: '800' },
  progressContainer: { paddingHorizontal: 16, marginBottom: 24 },
  progressBar: {
    height: 6, backgroundColor: COLORS.gridLine, borderRadius: 3, overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: COLORS.accentGold, borderRadius: 3 },
  scrollView: { flex: 1 },
  content: { padding: 16, gap: 12 },
  achievementCard: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 16,
    flexDirection: 'row', alignItems: 'center', opacity: 0.5,
  },
  unlockedCard: { opacity: 1, borderWidth: 1 },
  iconContainer: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.backgroundLight,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  icon: { fontSize: 24 },
  achievementInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  achievementName: { color: COLORS.text, fontSize: 16, fontWeight: '800' },
  lockedText: { color: COLORS.textMuted },
  tierBadge: {
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
  },
  tierText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  achievementDescription: { color: COLORS.textSecondary, fontSize: 13, marginTop: 2 },
  unlockedDate: { fontSize: 11, marginTop: 4 },
});
