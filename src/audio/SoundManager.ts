import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';

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
  place: require('../../assets/sounds/place.mp3'),
  lineClear: require('../../assets/sounds/line_clear.mp3'),
  combo: require('../../assets/sounds/combo.mp3'),
  gameOver: require('../../assets/sounds/game_over.mp3'),
  buttonTap: require('../../assets/sounds/button_tap.mp3'),
  powerUp: require('../../assets/sounds/power_up.mp3'),
  achievement: require('../../assets/sounds/achievement.mp3'),
  levelUp: require('../../assets/sounds/level_up.mp3'),
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
      await setAudioModeAsync({
        playsInSilentMode: false,
      });
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
