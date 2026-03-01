// Achievement definitions are managed in playerStore.ts
// This file exports helper utilities for achievements

export function formatAchievementDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString();
}
