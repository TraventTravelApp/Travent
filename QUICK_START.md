# 🚀 Quick Start Guide

## Current Issues

1. ⚠️ **Node.js is outdated**: v20.11.1 (need v20.19.4+)
2. ⚠️ **Wrong directory**: Must run from `TripApp_AIChallange/mobile`

---

## Fix Node.js Version (Required)

### Option 1: Download Official Installer (Easiest)

1. Go to: https://nodejs.org/en/download
2. Download **Node.js v20.19.4 or higher** (LTS version)
3. Install it
4. Restart your terminal
5. Verify: `node --version` (should show v20.19.4+)

### Option 2: Use nvm (Node Version Manager)

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart terminal or run:
source ~/.zshrc

# Install Node 20
nvm install 20
nvm use 20

# Verify
node --version  # Should show v20.x.x
```

### Option 3: Use Homebrew (if you have it)

```bash
# Install Homebrew first if needed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node
brew install node@20

# Verify
node --version
```

---

## Start the App

### Method 1: Use the Start Script (Recommended)

```bash
# From Chronicle2 root directory
./start-app.sh
```

### Method 2: Manual Steps

```bash
# 1. Navigate to mobile directory
cd TripApp_AIChallange/mobile

# 2. Install dependencies (if not done)
npm install --legacy-peer-deps

# 3. Start Expo
npx expo start
```

---

## Common Errors & Solutions

### Error: "Node.js (v20.11.1) is outdated"
**Solution**: Update Node.js to v20.19.4+ (see above)

### Error: "package.json does not exist"
**Solution**: You're in the wrong directory. Run from `TripApp_AIChallange/mobile`:
```bash
cd TripApp_AIChallange/mobile
npx expo start
```

### Error: "EIDLETIMEOUT" during npm install
**Solution**: Retry with increased timeout:
```bash
npm install --legacy-peer-deps --fetch-timeout=60000 --fetch-retries=5
```

### Error: "EBADENGINE Unsupported engine"
**Solution**: These are warnings, not errors. Use `--legacy-peer-deps`:
```bash
npm install --legacy-peer-deps
```

---

## Complete Setup (Fresh Start)

If you want to start completely fresh:

```bash
# 1. Update Node.js (see options above)
node --version  # Verify it's v20.19.4+

# 2. Navigate to mobile directory
cd TripApp_AIChallange/mobile

# 3. Clean everything
rm -rf node_modules package-lock.json
npm cache clean --force

# 4. Reinstall
npm install --legacy-peer-deps

# 5. Start app
npx expo start
```

---

## After Starting Successfully

1. **Scan QR code** with Expo Go app on your phone
2. **Login** with: `test@chronicle.com` / `TestPass123`
3. **Create a trip** to test AI generation

---

## Verification Checklist

Before starting the app, verify:

- [ ] Node.js version is v20.19.4 or higher: `node --version`
- [ ] You're in the correct directory: `pwd` should show `.../Chronicle2/TripApp_AIChallange/mobile`
- [ ] Dependencies are installed: `ls node_modules` should show many folders
- [ ] Expo is available: `npx expo --version` should work

---

## Quick Commands Reference

```bash
# Check versions
node --version
npm --version

# Navigate to mobile app
cd TripApp_AIChallange/mobile

# Install dependencies
npm install --legacy-peer-deps

# Start app
npx expo start

# Clear cache and restart
npx expo start --clear

# View logs
npx expo start --dev-client
```

---

## Need Help?

1. **Check Node version**: `node --version`
2. **Check current directory**: `pwd`
3. **Check if package.json exists**: `ls package.json`
4. **View full error**: Copy the complete error message

---

## Summary

**To start the app:**

1. Update Node.js to v20.19.4+ (https://nodejs.org)
2. Navigate to mobile folder: `cd TripApp_AIChallange/mobile`
3. Install dependencies: `npm install --legacy-peer-deps`
4. Start app: `npx expo start`

**Or simply run:**
```bash
./start-app.sh
```

---

**Status**: ⚠️ Node.js update required before app can start
