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
  private enabled = true;
  private initialized = false;

  async init() {
    // Audio disabled until a dev build with expo-av native module is available.
    // In Expo Go, ExponentAV native module does not exist.
    this.initialized = false;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  isEnabled() {
    return this.enabled;
  }

  async play(_name: SoundName) {
    // No-op until expo-av native module is available in a dev build
  }
}

export const soundManager = new SoundManager();
