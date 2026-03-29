import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { Platform } from 'react-native';

type SoundName =
  | 'place'
  | 'lineClear'
  | 'combo'
  | 'gameOver'
  | 'buttonTap'
  | 'powerUp'
  | 'achievement'
  | 'levelUp';

const SOUND_ASSETS: Record<SoundName, number> = {
  place: require('../../assets/sounds/place.wav'),
  lineClear: require('../../assets/sounds/line_clear.wav'),
  combo: require('../../assets/sounds/combo.wav'),
  gameOver: require('../../assets/sounds/game_over.wav'),
  buttonTap: require('../../assets/sounds/button_tap.wav'),
  powerUp: require('../../assets/sounds/power_up.wav'),
  achievement: require('../../assets/sounds/achievement.wav'),
  levelUp: require('../../assets/sounds/level_up.wav'),
};

const VOLUMES: Partial<Record<SoundName, number>> = {
  combo: 0.8,
  achievement: 0.8,
  levelUp: 0.8,
  buttonTap: 0.3,
};

class SoundManager {
  private enabled = true;
  private initialized = false;

  async init() {
    if (this.initialized) return;
    try {
      await setAudioModeAsync(
        Platform.OS === 'ios' ? { playsInSilentMode: false } : {}
      );
      this.initialized = true;
    } catch {
      // Native module not available
      this.initialized = false;
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  isEnabled() {
    return this.enabled;
  }

  async play(name: SoundName) {
    if (!this.enabled || !this.initialized) return;

    try {
      const source = SOUND_ASSETS[name];
      if (!source) return;

      const player = createAudioPlayer(source);
      player.volume = VOLUMES[name] ?? 0.5;
      player.play();
    } catch {
      // Silently fail
    }
  }
}

export const soundManager = new SoundManager();
