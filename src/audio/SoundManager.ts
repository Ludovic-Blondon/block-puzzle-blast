import { Audio } from 'expo-av';

type SoundName =
  | 'place'
  | 'lineClear'
  | 'combo'
  | 'gameOver'
  | 'buttonTap'
  | 'powerUp'
  | 'achievement'
  | 'levelUp';

class SoundManager {
  private sounds: Map<SoundName, Audio.Sound> = new Map();
  private enabled = true;
  private initialized = false;

  async init() {
    if (this.initialized) return;
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: false,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
      this.initialized = true;
    } catch {
      // Audio not available (e.g. web)
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
      // Create a fresh sound each time for overlapping SFX
      const { sound } = await Audio.Sound.createAsync(
        this.getSource(name),
        { shouldPlay: true, volume: this.getVolume(name) }
      );
      // Auto-cleanup when done
      sound.setOnPlaybackStatusUpdate((status) => {
        if ('didJustFinish' in status && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch {
      // Silently fail if audio file missing
    }
  }

  private getSource(name: SoundName) {
    // Using programmatic tone generation via silent placeholder
    // In production, replace with actual audio assets
    switch (name) {
      case 'place':
        return require('../../assets/sounds/place.mp3');
      case 'lineClear':
        return require('../../assets/sounds/line_clear.mp3');
      case 'combo':
        return require('../../assets/sounds/combo.mp3');
      case 'gameOver':
        return require('../../assets/sounds/game_over.mp3');
      case 'buttonTap':
        return require('../../assets/sounds/button_tap.mp3');
      case 'powerUp':
        return require('../../assets/sounds/power_up.mp3');
      case 'achievement':
        return require('../../assets/sounds/achievement.mp3');
      case 'levelUp':
        return require('../../assets/sounds/level_up.mp3');
      default:
        return require('../../assets/sounds/button_tap.mp3');
    }
  }

  private getVolume(name: SoundName): number {
    switch (name) {
      case 'combo':
      case 'achievement':
      case 'levelUp':
        return 0.8;
      case 'buttonTap':
        return 0.3;
      default:
        return 0.5;
    }
  }

  async cleanup() {
    for (const sound of this.sounds.values()) {
      await sound.unloadAsync();
    }
    this.sounds.clear();
  }
}

export const soundManager = new SoundManager();
