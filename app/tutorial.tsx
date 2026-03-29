import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../src/utils/colors';
import { usePlayerStore } from '../src/store/playerStore';
import { hapticMedium } from '../src/utils/haptics';

const STEPS = [
  { titleKey: 'tutorial.step1Title', descKey: 'tutorial.step1Desc', icon: '🎮' },
  { titleKey: 'tutorial.step2Title', descKey: 'tutorial.step2Desc', icon: '👆' },
  { titleKey: 'tutorial.step3Title', descKey: 'tutorial.step3Desc', icon: '✨' },
  { titleKey: 'tutorial.step4Title', descKey: 'tutorial.step4Desc', icon: '🔥' },
  { titleKey: 'tutorial.step5Title', descKey: 'tutorial.step5Desc', icon: '💣' },
  { titleKey: 'tutorial.step6Title', descKey: 'tutorial.step6Desc', icon: '🚀' },
];

export default function TutorialScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const { completeTutorial } = usePlayerStore();
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const animateTransition = (nextStep: number) => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -30, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      setStep(nextStep);
      slideAnim.setValue(30);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true }),
      ]).start();
    });
  };

  const handleNext = () => {
    hapticMedium();
    if (step < STEPS.length - 1) {
      animateTransition(step + 1);
    } else {
      completeTutorial();
      router.back();
    }
  };

  const handleSkip = () => {
    hapticMedium();
    completeTutorial();
    router.back();
  };

  const current = STEPS[step];

  return (
    <LinearGradient
      colors={[COLORS.background, COLORS.backgroundLight, COLORS.background]}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      {/* Skip button */}
      <View style={styles.topBar}>
        <Pressable onPress={handleSkip} accessibilityRole="button" accessibilityLabel={t('tutorial.skip')}>
          <Text style={styles.skipText}>{t('tutorial.skip')}</Text>
        </Pressable>
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <Text style={styles.icon}>{current.icon}</Text>
        <Text style={styles.title}>{t(current.titleKey)}</Text>
        <Text style={styles.description}>{t(current.descKey)}</Text>
      </Animated.View>

      {/* Step dots */}
      <View style={styles.dots}>
        {STEPS.map((_, i) => (
          <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
        ))}
      </View>

      {/* Next button */}
      <Pressable style={styles.nextButton} onPress={handleNext} accessibilityRole="button" accessibilityLabel="Next step">
        <Text style={styles.nextText}>
          {step === STEPS.length - 1 ? t('tutorial.start') : t('tutorial.next')}
        </Text>
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  topBar: {
    position: 'absolute',
    top: 60,
    right: 24,
  },
  skipText: {
    color: COLORS.textMuted,
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    alignItems: 'center',
    marginBottom: 48,
  },
  icon: {
    fontSize: 80,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gridLine,
  },
  dotActive: {
    backgroundColor: COLORS.accent,
    width: 24,
  },
  nextButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  nextText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
  },
});
