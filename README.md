# Block Puzzle Blast

A modern, addictive block puzzle game built with React Native and Expo. Available on iOS and Android.

## About

Block Puzzle Blast is a strategic puzzle game where you place blocks on a 10x10 grid to complete and clear lines. Simple to learn, challenging to master — aim for the highest score possible!

## Screenshots

*Coming soon*

## Features

- **Intuitive drag & drop** gameplay with haptic feedback
- **Combo system** — clear multiple lines at once for score multipliers
- **Streak bonuses** — consecutive clears reward you
- **Daily rewards** — earn coins just by opening the app
- **12 achievements** to unlock
- **3 power-ups** — Bomb, Line Clear, Rotate
- **In-game shop** to spend your coins
- **Persistent progress** — best score, coins, and achievements are saved
- **Minimalist dark theme** with vibrant block colors and smooth animations

## Tech Stack

- **React Native** + **Expo SDK 55**
- **expo-router** — file-based navigation
- **PanResponder** — drag & drop (RN core)
- **Animated** — 60fps animations (RN core)
- **zustand** — state management
- **AsyncStorage** — local data persistence
- **expo-haptics** — tactile feedback
- **expo-linear-gradient** — visual effects

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- [Expo Go](https://expo.dev/go) app on your phone (for testing)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd game-app

# Install dependencies
npm install

# Start the development server
npx expo start -c
```

### Running on device

- **iOS Simulator**: `npm run start:clear` then press `i`
- **Android Emulator**: `npm run start:clear` then press `a`
- **Physical device**: scan the QR code with Expo Go

### Install release build on iPhone via USB

Connect your iPhone by cable then run:

```bash
npm run ios:device
```

This cleans any previous native build, regenerates the `ios/` folder, builds a release configuration, and installs directly on your device. On first run you may need to configure signing in Xcode (**Signing & Capabilities → Automatically manage signing**) and trust the developer certificate on your iPhone (**Settings → General → VPN & Device Management**).

### Building for production (EAS)

```bash
# Install EAS CLI
npm install -g eas-cli

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

## Project Structure

```
game-app/
├── app/                    # Screens (expo-router)
│   ├── _layout.tsx         # Root layout
│   ├── index.tsx           # Home screen
│   ├── game.tsx            # Game screen
│   ├── shop.tsx            # Power-up shop
│   └── achievements.tsx    # Achievements screen
├── src/
│   ├── components/         # UI components
│   ├── game/               # Game logic (engine, pieces, scoring, power-ups)
│   ├── store/              # State management (Zustand)
│   ├── utils/              # Colors, haptics, sounds
│   └── constants/          # Config and achievements
└── assets/                 # Icons, splash screen
```

## Roadmap

### Done

- [x] Sound effects (place, clear, combo, game over) via `expo-audio`
- [x] Leaderboard (local, multi-mode: Classic / Blitz / Daily)
- [x] Theming / color palette selector (8 themes, shop integration)

### Next up (by priority)

1. [x] Animations on power-up activation (bomb explosion, line sweep, rotation)
2. [x] Android: test and polish on physical devices
3. [x] Accessibility (VoiceOver labels, reduced motion support)
4. [ ] Unit tests for game logic (engine, scoring, power-ups)
5. [ ] Localization (FR, EN)

## License

MIT
