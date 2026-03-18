import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { usePlayerStore } from '../src/store/playerStore';
import { COLORS } from '../src/utils/colors';
import { ThemeProvider } from '../src/utils/ThemeContext';
import ErrorBoundary from '../src/components/ErrorBoundary';
import { soundManager } from '../src/audio/SoundManager';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const loadData = usePlayerStore((s) => s.loadData);
  const loaded = usePlayerStore((s) => s.loaded);

  useEffect(() => {
    loadData();
    soundManager.init();
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <View style={styles.container}>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: COLORS.background },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="game" options={{ gestureEnabled: false }} />
            <Stack.Screen name="blitz" options={{ gestureEnabled: false }} />
            <Stack.Screen name="zen" options={{ gestureEnabled: false }} />
            <Stack.Screen name="daily" options={{ gestureEnabled: false }} />
            <Stack.Screen name="tutorial" options={{ gestureEnabled: false, animation: 'fade' }} />
            <Stack.Screen name="shop" />
            <Stack.Screen name="achievements" />
            <Stack.Screen name="leaderboard" />
          </Stack>
        </View>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
