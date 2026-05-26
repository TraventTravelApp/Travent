#!/bin/bash

echo "🚀 Starting Chronicle Mobile App"
echo ""

# Check Node version
NODE_VERSION=$(node --version | cut -d'v' -f2)
REQUIRED_VERSION="20.19.4"

echo "Current Node.js: v$NODE_VERSION"
echo "Required: v$REQUIRED_VERSION or higher"
echo ""

# Compare versions
if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo "⚠️  Node.js is outdated!"
    echo ""
    echo "Please update Node.js first:"
    echo ""
    echo "Option 1 - Download installer:"
    echo "  Visit: https://nodejs.org/en/download"
    echo "  Download and install Node.js v20.19.4 or higher"
    echo ""
    echo "Option 2 - Use Homebrew (if installed):"
    echo "  brew install node@20"
    echo ""
    echo "Option 3 - Use nvm:"
    echo "  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
    echo "  nvm install 20"
    echo "  nvm use 20"
    echo ""
    read -p "Continue anyway? (not recommended) [y/N]: " continue
    if [ "$continue" != "y" ] && [ "$continue" != "Y" ]; then
        exit 1
    fi
fi

# Navigate to mobile directory
echo "📁 Navigating to mobile app directory..."
cd TripApp_AIChallange/mobile || {
    echo "❌ Error: Could not find TripApp_AIChallange/mobile directory"
    echo "Make sure you're running this from the Chronicle2 root folder"
    exit 1
}

echo "✓ In mobile directory"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 node_modules not found. Installing dependencies..."
    echo ""
    npm install --legacy-peer-deps
    echo ""
fi

# Start Expo
echo "🎬 Starting Expo..."
echo ""
npx expo start

