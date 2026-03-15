import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { usePlayerStore } from '../src/store/playerStore';
import { COLORS } from '../src/utils/colors';
import ErrorBoundary from '../src/components/ErrorBoundary';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const loadData = usePlayerStore((s) => s.loadData);
  const loaded = usePlayerStore((s) => s.loaded);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <ErrorBoundary>
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
        </Stack>
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
