#!/bin/bash
set -e

echo "🔧 Generating native iOS project..."
npx expo prebuild --platform ios --clean

echo "🔧 Fixing Podfile (disabling RNS_GAMMA_ENABLED)..."
sed -i '' "s/ENV\['RNS_GAMMA_ENABLED'\] ||= '1'/ENV['RNS_GAMMA_ENABLED'] ||= '0'/" ios/Podfile

echo "📦 Installing CocoaPods..."
cd ios && pod install && cd ..

echo "✅ Done! Opening Xcode..."
open ios/BlockPuzzleBlast.xcworkspace
