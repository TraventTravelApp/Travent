#!/bin/bash

echo "🔧 Fixing Node.js version and npm install issues..."
echo ""

# Check current Node version
CURRENT_NODE=$(node --version)
echo "Current Node.js version: $CURRENT_NODE"
echo "Required: v20.19.4 or higher"
echo ""

# Option 1: Update Node.js using Homebrew (recommended for macOS)
echo "📦 Updating Node.js..."
echo ""
echo "Choose an option:"
echo "1) Update Node.js via Homebrew (recommended)"
echo "2) Skip Node.js update and try npm install with workarounds"
echo ""
read -p "Enter choice (1 or 2): " choice

if [ "$choice" = "1" ]; then
    echo ""
    echo "Updating Node.js via Homebrew..."
    
    # Check if Homebrew is installed
    if command -v brew &> /dev/null; then
        echo "✓ Homebrew found"
        brew upgrade node
        echo ""
        echo "✓ Node.js updated to: $(node --version)"
    else
        echo "❌ Homebrew not found"
        echo ""
        echo "Please install Homebrew first:"
        echo "  /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
        echo ""
        echo "Or download Node.js directly from: https://nodejs.org/"
        exit 1
    fi
fi

echo ""
echo "🧹 Cleaning npm cache and node_modules..."
cd TripApp_AIChallange/mobile

# Clean up
rm -rf node_modules package-lock.json
npm cache clean --force

echo ""
echo "📥 Installing dependencies with workarounds..."
echo ""

# Install with increased timeout and legacy peer deps
npm install --legacy-peer-deps --fetch-timeout=60000 --fetch-retries=5

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Installation successful!"
    echo ""
    echo "You can now run:"
    echo "  cd TripApp_AIChallange/mobile"
    echo "  npm start"
else
    echo ""
    echo "❌ Installation failed"
    echo ""
    echo "Try these manual steps:"
    echo "1. Update Node.js to v20.19.4+:"
    echo "   brew upgrade node"
    echo ""
    echo "2. Clean and reinstall:"
    echo "   cd TripApp_AIChallange/mobile"
    echo "   rm -rf node_modules package-lock.json"
    echo "   npm cache clean --force"
    echo "   npm install --legacy-peer-deps"
fi
