import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePlayerStore } from '../src/store/playerStore';
import { COLORS } from '../src/utils/colors';
import { GameMode, MODE_CONFIGS } from '../src/constants/config';

const MODES: GameMode[] = ['classic', 'blitz', 'daily'];

export default function LeaderboardScreen() {
  const insets = useSafeAreaInsets();
  const { leaderboard } = usePlayerStore();
  const [selectedMode, setSelectedMode] = useState<GameMode>('classic');

  const filteredScores = leaderboard
    .filter((e) => e.mode === selectedMode)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return (
    <LinearGradient
      colors={[COLORS.background, COLORS.backgroundLight, COLORS.background]}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.title}>LEADERBOARD</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Mode tabs */}
      <View style={styles.tabs}>
        {MODES.map((mode) => (
          <Pressable
            key={mode}
            style={[styles.tab, selectedMode === mode && styles.tabActive]}
            onPress={() => setSelectedMode(mode)}
          >
            <Text style={[styles.tabText, selectedMode === mode && styles.tabTextActive]}>
              {MODE_CONFIGS[mode].icon} {MODE_CONFIGS[mode].name}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {filteredScores.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🏆</Text>
            <Text style={styles.emptyText}>No scores yet!</Text>
            <Text style={styles.emptySubtext}>Play {MODE_CONFIGS[selectedMode].name} to set a record</Text>
          </View>
        )}

        {filteredScores.map((entry, index) => (
          <View key={`${entry.date}-${entry.score}-${index}`} style={styles.row}>
            <Text style={[styles.rank, index < 3 && styles.topRank]}>
              {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
            </Text>
            <View style={styles.scoreInfo}>
              <Text style={styles.scoreValue}>{entry.score.toLocaleString()}</Text>
              <Text style={styles.scoreDate}>{entry.date}</Text>
            </View>
          </View>
        ))}
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
  tabs: {
    flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 16,
  },
  tab: {
    flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: COLORS.surface,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: COLORS.accent },
  tabText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '700' },
  tabTextActive: { color: COLORS.text },
  scrollView: { flex: 1 },
  content: { padding: 16, gap: 8 },
  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: COLORS.text, fontSize: 18, fontWeight: '800' },
  emptySubtext: { color: COLORS.textMuted, fontSize: 14, marginTop: 4 },
  row: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    borderRadius: 14, padding: 16,
  },
  rank: { fontSize: 18, fontWeight: '800', color: COLORS.textSecondary, minWidth: 44 },
  topRank: { fontSize: 24 },
  scoreInfo: { flex: 1, alignItems: 'flex-end' },
  scoreValue: { color: COLORS.text, fontSize: 20, fontWeight: '800' },
  scoreDate: { color: COLORS.textMuted, fontSize: 11, marginTop: 2 },
});
