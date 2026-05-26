# Trip Route Map Setup

## What Was Built

### 1. TripRouteViewScreen
A new screen that shows the daily route with an interactive map and activity list. This screen displays:

- **Header**: Trip name, date range, and action buttons (list view, guide book)
- **Day Selector**: Tabs to switch between different days of the trip
- **Interactive Map**: Shows all activity locations with pin markers
- **Route Card**: Displays stop count and estimated travel time with a "Start" button
- **Activity List**: Scrollable list of all activities for the selected day

**Location**: `src/screens/TripRouteViewScreen.tsx`

### 2. Navigation Flow
Updated the app navigation to connect:
- "Looks Good" button → TripRouteView
- "View Map" button → TripRouteView

### 3. Assets Added
- `list-icon.png`: Menu/list icon for header
- `book-icon.png`: Guide book icon for header

### 4. AWS Location Services Integration

#### Backend (serverless.yml)
Added AWS Location Service resources:
- **TripMapView**: Map resource using Esri vector streets style
- **TripPlaceIndex**: Place index for POI geocoding and search
- **TripRouteCalculator**: Route calculator for turn-by-turn directions

#### IAM Permissions
Added permissions for:
- `geo:GetMapTile` - Retrieve map tiles
- `geo:GetMapStyleDescriptor` - Get map styling
- `geo:SearchPlaceIndexForText` - Search for places by name
- `geo:SearchPlaceIndexForPosition` - Reverse geocoding
- `geo:CalculateRoute` - Calculate routes between points

#### Mobile Configuration
- Installed `react-native-maps`, `aws-amplify`, `@aws-amplify/geo`, `expo-location`
- Created `aws-config.ts` for AWS Amplify configuration
- Added map configuration to `app.json`

## Current State (Demo Mode)

The app currently works with **mock data** and placeholder coordinates:
- Mock trip data with hardcoded coordinates for Portland, Oregon
- Placeholder travel times (~45 min, ~30 min, etc.)
- Static activity locations

## Production Setup

To connect with real AWS Location Services and backend data:

### 1. Deploy Backend Resources
```bash
cd ../../../backend
serverless deploy
```

This will create:
- AWS Location Map resource
- Place Index for geocoding
- Route Calculator for directions

### 2. Get AWS Resource Names
After deployment, note these values:
- Map Name: `TripMapView`
- Place Index Name: `TripPlaceIndex`
- Route Calculator Name: `TripRouteCalculator`
- AWS Region: `us-east-1` (or your region)

### 3. Configure Mobile App

Create `.env` file in mobile directory:
```
EXPO_PUBLIC_AWS_REGION=us-east-1
EXPO_PUBLIC_COGNITO_USER_POOL_ID=your-user-pool-id
EXPO_PUBLIC_COGNITO_CLIENT_ID=your-client-id
EXPO_PUBLIC_LOCATION_MAP_NAME=TripMapView
EXPO_PUBLIC_LOCATION_PLACE_INDEX_NAME=TripPlaceIndex
```

### 4. Google Maps API Keys (Optional)

For better map tiles on native devices, add Google Maps API keys:

1. Get API keys:
   - [Google Cloud Console](https://console.cloud.google.com/)
   - Enable "Maps SDK for iOS" and "Maps SDK for Android"

2. Update `app.json`:
```json
"ios": {
  "config": {
    "googleMapsApiKey": "YOUR-IOS-API-KEY"
  }
},
"android": {
  "config": {
    "googleMaps": {
      "apiKey": "YOUR-ANDROID-API-KEY"
    }
  }
}
```

### 5. Real Coordinates from Backend

When backend is deployed, the AI itinerary generation will:
1. Query the `travel-pois` DynamoDB table
2. Return activities with real coordinates from Google Places API
3. Use AWS Location Services to geocode addresses if coordinates missing

Update `TripRouteViewScreen.tsx` to fetch real trip data:
```typescript
// Replace mock data with API call
const response = await api.get(`/trips/${tripId}`);
const tripData = response.data;
```

### 6. Route Calculation

To add real route calculation between activities:

1. Use AWS Location Route Calculator:
```typescript
import { Geo } from 'aws-amplify';

const route = await Geo.calculateRoute({
  startPosition: [startLng, startLat],
  endPosition: [endLng, endLat],
});
```

2. Display route polyline on map
3. Show turn-by-turn directions
4. Calculate accurate travel time

## Features to Add

### Immediate:
- [ ] Integrate with real trip data from backend
- [ ] Add pull-to-refresh to reload trip data
- [ ] Handle loading and error states

### Future Enhancements:
- [ ] Turn-by-turn navigation integration
- [ ] Real-time route updates based on traffic
- [ ] Alternative route suggestions
- [ ] Offline map support
- [ ] Share route with friends
- [ ] Export to Google Maps / Apple Maps
- [ ] Add custom stops to route
- [ ] Reorder activities via drag-and-drop
- [ ] Show estimated arrival times
- [ ] Weather forecast for each stop
- [ ] Nearby parking information
- [ ] Accessibility route options

## Testing Without Backend

### Option 1: Testing in Expo Go (Current Setup)

The app now includes a **fallback map component** that works in Expo Go:
1. Run `npm start` in mobile directory
2. Scan QR code with Expo Go
3. Navigate through trip creation flow
4. Click "Generate My Trip"
5. Click "View Map" or "Looks Good"
6. See a placeholder map with coordinates (real map requires development build)

**What you'll see in Expo Go:**
- Map placeholder with 🗺️ icon
- "Map Preview" message
- Coordinates display
- Instructions to create development build
- Full activity list still works

### Option 2: Development Build (Full Maps)

To see the actual interactive maps with pins and routes:

**For iOS:**
```bash
npx expo run:ios
```

**For Android:**
```bash
npx expo run:android
```

**What you'll get with development build:**
- Full interactive maps
- Real-time panning and zooming
- Colored pin markers for each activity
- Route polylines between stops
- Tap markers to see activity details
- All map gestures and controls

## Architecture

```
User Flow:
1. TripQuestionnaireScreen (enter trip details)
2. TripPreviewScreen (view generated itinerary)
3. TripRouteViewScreen (view map + activities)
4. [Future] Turn-by-turn navigation

Data Flow:
Mobile App → API Gateway → Lambda → AWS Location Services
                                  ↓
                            DynamoDB (trips, pois)
                                  ↓
                            Google Places API (coordinates)
```

## Troubleshooting

**ERROR: 'RNMapsAirModule' could not be found**
- ✅ **FIXED**: This error is normal in Expo Go
- The app now shows a fallback placeholder map in Expo Go
- For real maps, create a development build: `npx expo run:ios` or `npx expo run:android`
- The fallback component automatically detects Expo Go vs development build

**Maps showing placeholder in Expo Go:**
- This is **expected behavior** - Expo Go doesn't support react-native-maps
- You'll see a friendly placeholder with coordinates
- All other features (activity list, navigation) work normally
- To see real maps, create a development build (see "Option 2" above)

**Maps not showing in development build:**
- Ensure you ran `npx expo run:ios` or `npx expo run:android` (not Expo Go)
- Check that `react-native-maps` is in package.json
- Rebuild: `npx expo prebuild --clean` then `npx expo run:ios`

**"Network request failed":**
- This is expected in demo mode
- Maps will work with mock coordinates
- Real API calls require deployed backend

**Pins not appearing:**
- Check that activities have valid coordinates
- Verify coordinate format: `{ latitude: number, longitude: number }`
- Check map region is set correctly

**iOS build issues:**
- Run `npx pod-install` in the iOS directory
- Ensure bundle identifier matches app.json
- Clear build: `cd ios && rm -rf build && cd ..`

**Android build issues:**
- Add Google Maps API key to app.json (optional)
- Sync Gradle files
- Enable Maps SDK in Google Cloud Console
- Clear cache: `cd android && ./gradlew clean && cd ..`
