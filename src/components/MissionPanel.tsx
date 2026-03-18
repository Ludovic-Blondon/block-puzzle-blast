import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { COLORS } from '../utils/colors';
import { usePlayerStore, MissionProgress } from '../store/playerStore';
import { getDailyMissions, getWeeklyMissions } from '../constants/missions';
import { hapticSuccess } from '../utils/haptics';

export default function MissionPanel() {
  const {
    dailyMissions,
    weeklyMissions,
    dailyMissionsDate,
    weeklyMissionsWeek,
    claimMission,
  } = usePlayerStore();

  const dailyDefs = getDailyMissions(dailyMissionsDate || '');
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
      <Text style={[styles.sectionTitle, { marginTop: 12 }]}>WEEKLY</Text>
      {weeklyMissions.map((m) => renderMission(m, 'weekly'))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  missionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  missionInfo: {
    flex: 1,
  },
  missionText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  claimedText: {
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.gridLine,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.accentGold,
    borderRadius: 2,
  },
  progressText: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  claimButton: {
    backgroundColor: COLORS.accentGold,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
  claimText: {
    color: COLORS.background,
    fontSize: 12,
    fontWeight: '800',
  },
  doneText: {
    color: COLORS.success,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 8,
  },
});
