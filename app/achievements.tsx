import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { usePlayerStore } from '../src/store/playerStore';
import { COLORS } from '../src/utils/colors';
import { formatAchievementDate } from '../src/constants/achievements';

export default function AchievementsScreen() {
  const { achievements } = usePlayerStore();
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <LinearGradient
      colors={[COLORS.background, COLORS.backgroundLight, COLORS.background]}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.title}>ACHIEVEMENTS</Text>
        <Text style={styles.counter}>
          {unlockedCount}/{achievements.length}
        </Text>
      </View>

      {/* Progress bar */}
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
        {achievements.map((achievement) => (
          <View
            key={achievement.id}
            style={[
              styles.achievementCard,
              achievement.unlocked && styles.unlockedCard,
            ]}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>
                {achievement.unlocked ? '🏆' : '🔒'}
              </Text>
            </View>
            <View style={styles.achievementInfo}>
              <Text
                style={[
                  styles.achievementName,
                  !achievement.unlocked && styles.lockedText,
                ]}
              >
                {achievement.name}
              </Text>
              <Text style={styles.achievementDescription}>
                {achievement.description}
              </Text>
              {achievement.unlocked && achievement.unlockedAt && (
                <Text style={styles.unlockedDate}>
                  Unlocked {formatAchievementDate(achievement.unlockedAt)}
                </Text>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
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
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 2,
  },
  counter: {
    color: COLORS.accentGold,
    fontSize: 16,
    fontWeight: '800',
  },
  progressContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.gridLine,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.accentGold,
    borderRadius: 3,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  achievementCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    opacity: 0.5,
  },
  unlockedCard: {
    opacity: 1,
    borderWidth: 1,
    borderColor: COLORS.accentGold,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
  },
  lockedText: {
    color: COLORS.textMuted,
  },
  achievementDescription: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  unlockedDate: {
    color: COLORS.accentGold,
    fontSize: 11,
    marginTop: 4,
  },
});
