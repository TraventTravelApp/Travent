#!/bin/bash

echo "📦 Installing dependencies and starting Chronicle app..."
echo ""

cd TripApp_AIChallange/mobile

echo "🧹 Cleaning old dependencies..."
rm -rf node_modules package-lock.json

echo ""
echo "📥 Installing dependencies (this may take a few minutes)..."
npm install --legacy-peer-deps

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Dependencies installed successfully!"
    echo ""
    echo "🚀 Starting Expo..."
    echo ""
    npx expo start --clear
else
    echo ""
    echo "❌ Installation failed"
    echo ""
    echo "Try manually:"
    echo "  cd TripApp_AIChallange/mobile"
    echo "  npm install --legacy-peer-deps"
    echo "  npx expo start"
fi
