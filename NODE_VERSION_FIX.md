# 🔧 Node.js Version Fix

**Issue**: Your Node.js version (v20.11.1) is too old. React Native 0.84 requires Node.js v20.19.4 or higher.

---

## Quick Fix (Recommended)

### Option 1: Update Node.js via Homebrew

```bash
# Update Node.js
brew upgrade node

# Verify new version
node --version  # Should show v20.19.4 or higher

# Clean and reinstall
cd TripApp_AIChallange/mobile
rm -rf node_modules package-lock.json
npm cache clean --force
npm install --legacy-peer-deps
```

### Option 2: Use the Fix Script

```bash
./fix-node-and-install.sh
```

---

## Manual Steps

### 1. Update Node.js

**Via Homebrew (macOS):**
```bash
brew upgrade node
```

**Via Official Installer:**
- Download from: https://nodejs.org/
- Install the LTS version (v20.19.4 or higher)

**Via nvm (Node Version Manager):**
```bash
# Install nvm if you don't have it
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install latest Node 20
nvm install 20
nvm use 20
```

### 2. Verify Installation

```bash
node --version  # Should be v20.19.4 or higher
npm --version   # Should be 10.x or higher
```

### 3. Clean and Reinstall Dependencies

```bash
cd TripApp_AIChallange/mobile

# Remove old files
rm -rf node_modules package-lock.json

# Clean npm cache
npm cache clean --force

# Reinstall with legacy peer deps flag
npm install --legacy-peer-deps
```

### 4. Start the App

```bash
npm start
```

---

## Why This Happened

React Native 0.84 and Expo 55 require:
- Node.js >= v20.19.4
- npm >= 10.x

Your current versions:
- Node.js: v20.11.1 ❌
- npm: 10.2.4 ✅

---

## Network Timeout Fix

If you get `EIDLETIMEOUT` errors during npm install:

```bash
# Increase timeout and retries
npm install --legacy-peer-deps \
  --fetch-timeout=60000 \
  --fetch-retries=5 \
  --maxsockets=1
```

Or use a different registry:
```bash
# Use Yarn instead (faster)
npm install -g yarn
cd TripApp_AIChallange/mobile
yarn install
```

---

## Alternative: Downgrade React Native (Not Recommended)

If you can't update Node.js, you could downgrade React Native, but this is not recommended:

```bash
cd TripApp_AIChallange/mobile

# Edit package.json and change:
# "react-native": "0.84.1" → "react-native": "0.81.6"
# "expo": "~55.0.0" → "expo": "~52.0.0"

npm install --legacy-peer-deps
```

---

## Troubleshooting

### "Homebrew not found"
Install Homebrew first:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### "Permission denied"
Use sudo (not recommended) or fix npm permissions:
```bash
# Fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
source ~/.zshrc
```

### "Still getting engine warnings"
The warnings are okay as long as the app runs. The `--legacy-peer-deps` flag allows installation despite version mismatches.

---

## Summary

**Quick Fix:**
```bash
# 1. Update Node.js
brew upgrade node

# 2. Clean and reinstall
cd TripApp_AIChallange/mobile
rm -rf node_modules package-lock.json
npm cache clean --force
npm install --legacy-peer-deps

# 3. Start app
npm start
```

**Expected Result:**
- Node.js v20.19.4 or higher ✅
- All dependencies installed ✅
- App starts successfully ✅

---

**Need Help?**
- Check Node.js version: `node --version`
- Check npm version: `npm --version`
- View npm logs: `cat ~/.npm/_logs/*-debug-0.log`
