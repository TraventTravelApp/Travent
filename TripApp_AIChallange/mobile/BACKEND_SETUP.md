# Backend Setup for Mobile App

## Current Status
⚠️ **Demo Mode Active** - The app works without a backend for testing UI/UX

---

## Why "Network Request Failed"?

Your phone can't reach `localhost:3000` because:
- `localhost` on your phone = your phone, not your computer
- Your backend needs to be accessible via network

---

## Options to Connect Backend

### Option 1: Demo Mode (Current) ✅
**Already configured!** The app bypasses backend calls and lets you test the UI.

- Login/Signup: Just enter any email/password and click the button
- Trip Preview: Uses mock data
- Everything else: Works without backend

### Option 2: Deploy to AWS (Production)
Deploy your backend to AWS and update the API URL:

1. **Deploy backend:**
   ```bash
   cd ../../backend
   # Follow DEPLOYMENT_GUIDE.md
   serverless deploy
   ```

2. **Get your API URL** from deployment output:
   ```
   https://YOUR-API-ID.execute-api.us-east-1.amazonaws.com/dev
   ```

3. **Update mobile app** in `src/services/api.ts`:
   ```typescript
   const API_BASE_URL = 'https://YOUR-API-ID.execute-api.us-east-1.amazonaws.com/dev';
   ```

4. **Restart Expo:**
   ```bash
   npm start
   ```

### Option 3: Local Development (Advanced)
Run backend locally and use your computer's IP:

1. **Install serverless-offline:**
   ```bash
   cd ../../backend
   npm install --save-dev serverless-offline
   ```

2. **Update serverless.yml** - add to plugins:
   ```yaml
   plugins:
     - serverless-python-requirements
     - serverless-offline
   ```

3. **Start backend locally:**
   ```bash
   serverless offline --host 0.0.0.0
   ```

4. **Get your computer's IP:**
   - Windows: `ipconfig` (look for IPv4)
   - Mac/Linux: `ifconfig` or `ip addr`
   - Your IP: **10.0.0.183** (already found this for you!)

5. **Update mobile app** in `src/services/api.ts`:
   ```typescript
   const API_BASE_URL = 'http://10.0.0.183:3000/dev';
   ```

6. **Make sure phone and computer are on same WiFi!**

7. **Restart Expo:**
   ```bash
   npm start
   ```

---

## Testing Without Backend

Current setup lets you test:
- ✅ All UI/UX
- ✅ Navigation between screens
- ✅ Trip Preview with mock data
- ✅ Form validation
- ✅ Layout and design

What won't work without backend:
- ❌ Real user accounts
- ❌ Saving trips to database
- ❌ AI-generated itineraries
- ❌ Real authentication tokens

---

## Quick Start (Current Demo Mode)

```bash
npm install
npm start
```

1. Scan QR code with Expo Go
2. Click "Sign Up" or "Log In"
3. Enter any email (test@example.com) and password (Test1234)
4. Click the button - you'll be logged in automatically
5. Test all the screens!

---

## When You're Ready for Real Backend

1. Deploy backend to AWS (see `../../DEPLOYMENT_GUIDE.md`)
2. Update `src/services/api.ts` with your API URL
3. Remove the demo mode code (or keep it for testing!)
4. Restart Expo

---

## Need Help?

- Backend deployment issues? Check `../../DEPLOYMENT_GUIDE.md`
- Can't connect? Make sure phone and computer are on same WiFi
- Still seeing errors? The app works in demo mode - just test the UI!
