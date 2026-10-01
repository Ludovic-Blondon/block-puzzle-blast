import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../utils/colors';

interface StuckBannerProps {
  visible: boolean;
  onGiveUp: () => void;
}

// Shown over the score when no piece fits but the player still has power-ups:
// the game only ends once they are used up or the player gives up
function StuckBanner({ visible, onGiveUp }: StuckBannerProps) {
  const { t } = useTranslation();
  if (!visible) return null;

  return (
    <View style={styles.container} accessibilityLiveRegion="polite">
      <View style={styles.textBox}>
        <Text style={styles.title}>{t('stuck.title')}</Text>
        <Text style={styles.hint}>{t('stuck.hint')}</Text>
      </View>
      <Pressable style={styles.button} onPress={onGiveUp} accessibilityRole="button" accessibilityLabel={t('stuck.giveUp')}>
        <Text style={styles.buttonText}>{t('stuck.giveUp')}</Text>
      </Pressable>
    </View>
  );
}

export default React.memo(StuckBanner);

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    marginHorizontal: 16,
    marginVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.warning,
    paddingHorizontal: 16,
    gap: 12,
  },
  textBox: {
    flex: 1,
  },
  title: {
    color: COLORS.warning,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  hint: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  button: {
    backgroundColor: COLORS.backgroundLight,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  buttonText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '800',
  },
});
