import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { COLORS } from '../utils/colors';
import { usePlayerStore, MissionProgress } from '../store/playerStore';
import { getDailyMissions, getWeeklyMissions } from '../constants/missions';
import { hapticSuccess } from '../utils/haptics';

function getTodayStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export default function MissionPanel() {
  const {
    dailyMissions,
    weeklyMissions,
    dailyMissionsDate,
    weeklyMissionsWeek,
    claimMission,
  } = usePlayerStore();

  const dailyDefs = getDailyMissions(dailyMissionsDate || getTodayStr());
  const weeklyDefs = getWeeklyMissions(weeklyMissionsWeek || 0);

  const handleClaim = (id: string, type: 'daily' | 'weekly') => {
    const success = claimMission(id, type);
    if (success) hapticSuccess();
  };

  const renderMission = (m: MissionProgress, type: 'daily' | 'weekly') => {
    const defs = type === 'daily' ? dailyDefs : weeklyDefs;
    const def = defs.find((d) => d.id === m.id);
    if (!def) return null;

    const progress = Math.min(m.progress / m.target, 1);
    const complete = m.progress >= m.target;

    return (
      <View key={m.id} style={styles.missionRow}>
        <View style={styles.missionInfo}>
          <Text style={[styles.missionText, m.claimed && styles.claimedText]}>
            {def.description}
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {m.progress}/{m.target}
          </Text>
        </View>
        {complete && !m.claimed ? (
          <Pressable style={styles.claimButton} onPress={() => handleClaim(m.id, type)}>
            <Text style={styles.claimText}>+{def.rewardCoins}</Text>
          </Pressable>
        ) : m.claimed ? (
          <Text style={styles.doneText}>Done</Text>
        ) : null}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>DAILY MISSIONS</Text>
      {dailyMissions.map((m) => renderMission(m, 'daily'))}

      <View style={styles.sectionDivider} />

      <Text style={styles.sectionTitle}>WEEKLY</Text>
      {weeklyMissions.map((m) => renderMission(m, 'weekly'))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(15, 52, 96, 0.3)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
    marginHorizontal: 0,
    marginBottom: 24,
  },
  sectionTitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 16,
  },
  sectionDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 16,
  },
  missionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  missionInfo: {
    flex: 1,
  },
  missionText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: 4,
  },
  claimedText: {
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.gridLine,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.accentGold,
    borderRadius: 3,
  },
  progressText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  claimButton: {
    backgroundColor: COLORS.accentGold,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginLeft: 12,
    shadowColor: COLORS.accentGold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  claimText: {
    color: COLORS.background,
    fontSize: 13,
    fontWeight: '800',
  },
  doneText: {
    color: COLORS.success,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 12,
  },
});
