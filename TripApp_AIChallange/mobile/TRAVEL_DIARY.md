# Travel Diary Feature

## Overview

The Travel Diary is a modal screen where users can document their trip experiences, upload photos, and write notes about their favorite moments and hidden gems discovered during their journey.

## How to Access

**From Trip Route View:**
- Click the **book icon** (📖) in the top-right header
- Modal slides up from bottom

## Features

### 1. Day Selector
- Switch between different days of the trip
- Active day shown in dark green (#1F3D2B)
- Inactive days in white with borders
- Shows "Viewing" label above tabs

### 2. Photo Upload Section
**UI:**
- Large beige/tan upload area with dashed border
- Upload icon (arrow pointing up from tray)
- "Tap to upload photos" text

**Functionality (To Be Implemented):**
- Tap to open photo picker
- Select multiple photos from gallery
- Camera integration for taking new photos
- Photos saved per day

### 3. Notes & Memories
**UI:**
- White text input area with rounded corners
- Placeholder text: "Jot down your favorite moments, hidden gems you discovered, or tips for future travelers..."
- Multi-line input with proper height

**Functionality:**
- Type notes and memories for the selected day
- Auto-saves on "Save Entry"
- Preserves notes when switching days

### 4. Previous Entries Section
**Shows past entries for the selected day:**
- Camera icon + "Day X Entry" header
- Entry text/notes
- Photo thumbnails (2 photos side by side)
- Tan/beige background cards

**Mock Data Included:**
- Sample Day 1 entry about Eagle's Nest Trail
- Placeholder for 2 photos

### 5. Save Entry Button
- Large dark green button at bottom
- Fixed position (always visible)
- Saves current day's notes and photos

## Design Specifications

### Colors
- **Background**: `#F4EBDC` (cream/beige)
- **Active Day Tab**: `#1F3D2B` (dark green)
- **Upload Area**: `#E5D4C1` (tan/beige)
- **Entry Cards**: `#E5D4C1` (tan/beige)
- **Save Button**: `#1F3D2B` (dark green)
- **Icon Tint**: `#8B7355` (brown)
- **Text Input**: `#FFFFFF` (white)

### Layout
- Modal presentation (slides from bottom)
- Close button (X) in top-right
- Scrollable content area
- Fixed save button at bottom
- 20px horizontal padding

### Typography
- **Header Title**: 20px, semi-bold
- **Section Labels**: 15px, medium weight
- **Day Buttons**: 14px, semi-bold
- **Upload Text**: 15px, medium weight
- **Notes Placeholder**: 15px
- **Entry Title**: 15px, semi-bold
- **Entry Notes**: 14px, line height 20px

## Assets

### Icons Added
1. **camera-icon.png**: Brown camera icon for entries
2. **upload-icon.png**: Upload arrow icon for photo section
3. **book-icon.png**: Book icon in header (already added)

**Location**: `assets/images/`

## File Structure

```
src/
├── screens/
│   └── TravelDiaryScreen.tsx (Main diary modal component)
├── types/
│   └── index.ts (Added TravelDiary to navigation types)
└── navigation/
    └── AppNavigator.tsx (Added modal route)

assets/
└── images/
    ├── camera-icon.png (new)
    ├── upload-icon.png (new)
    └── book-icon.png (existing)
```

## Navigation Flow

```
TripRouteViewScreen
    ↓ (Click book icon)
TravelDiaryScreen (Modal)
    ↓ (Click X or back)
Back to TripRouteViewScreen
```

## Data Structure

### DiaryPhoto Interface
```typescript
interface DiaryPhoto {
  id: string;
  uri: string;
  dayNumber: number;
}
```

### DiaryEntry Interface
```typescript
interface DiaryEntry {
  id: string;
  dayNumber: number;
  date: string;
  notes: string;
  photos: DiaryPhoto[];
}
```

## Backend Integration (To Be Implemented)

### Save Entry Endpoint
**POST** `/trips/{tripId}/diary/entries`

```json
{
  "dayNumber": 1,
  "notes": "Amazing experience at...",
  "photos": [
    "s3://bucket/trip-123/day-1/photo-1.jpg",
    "s3://bucket/trip-123/day-1/photo-2.jpg"
  ]
}
```

### Get Entries Endpoint
**GET** `/trips/{tripId}/diary/entries?day={dayNumber}`

Returns all diary entries for a specific day.

### Photo Upload
**POST** `/uploads/diary-photo`

Upload photos to S3 and return URLs.

## Features To Implement

### Immediate:
- [ ] Implement photo picker (expo-image-picker)
- [ ] Implement camera integration
- [ ] Connect to backend save endpoint
- [ ] Load previous entries from backend
- [ ] Show loading states

### Future Enhancements:
- [ ] Photo editing (crop, filters)
- [ ] Voice notes recording
- [ ] Location tagging for photos
- [ ] Share diary entries to social media
- [ ] Export diary as PDF
- [ ] Collaborative diaries for group trips
- [ ] Add tags/categories to entries
- [ ] Search through diary entries
- [ ] Offline support with sync

## Testing

### Current State (Demo Mode)
1. Navigate to Trip Route View
2. Click the book icon (📖)
3. Travel Diary modal appears
4. Switch between days
5. Type in notes field
6. Click "Save Entry" to see alert
7. Close with X button

### With Backend
1. All above steps
2. Upload photos from gallery
3. Take photos with camera
4. Save entry to database
5. See previous entries load
6. Photos display in entries

## Photo Picker Implementation

To add photo functionality:

```bash
npm install expo-image-picker
```

Then update `handleUploadPhotos`:

```typescript
import * as ImagePicker from 'expo-image-picker';

const handleUploadPhotos = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsMultipleSelection: true,
    quality: 1,
  });

  if (!result.canceled) {
    const newPhotos = result.assets.map((asset, index) => ({
      id: `${Date.now()}-${index}`,
      uri: asset.uri,
      dayNumber: selectedDay,
    }));
    setUploadedPhotos([...uploadedPhotos, ...newPhotos]);
  }
};
```

## Camera Implementation

```typescript
const handleTakePhoto = async () => {
  const result = await ImagePicker.launchCameraAsync({
    quality: 1,
  });

  if (!result.canceled) {
    const newPhoto: DiaryPhoto = {
      id: `${Date.now()}`,
      uri: result.assets[0].uri,
      dayNumber: selectedDay,
    };
    setUploadedPhotos([...uploadedPhotos, newPhoto]);
  }
};
```

## Permissions Required

Add to `app.json`:

```json
"plugins": [
  [
    "expo-image-picker",
    {
      "photosPermission": "Allow LocalSide to access your photos to save travel memories.",
      "cameraPermission": "Allow LocalSide to use your camera to capture trip moments."
    }
  ]
]
```

## Troubleshooting

**Modal not appearing:**
- Check that navigation is set up correctly
- Verify TravelDiary is in RootStackParamList
- Check book icon has onPress handler

**Photos not uploading:**
- Ensure expo-image-picker is installed
- Check permissions in app.json
- Verify device has camera/photo access enabled

**Save button not working:**
- Check backend endpoint is deployed
- Verify tripId is being passed correctly
- Check network connectivity

## Summary

The Travel Diary feature provides users with a beautiful, intuitive way to document their travel experiences. The modal design matches the overall app aesthetic with cream/beige backgrounds and dark green accents. Users can organize entries by day, upload photos, and write detailed notes about their discoveries.

**Current Implementation:**
- ✅ Complete UI matching design spec
- ✅ Day switching functionality
- ✅ Notes text input
- ✅ Mock previous entries display
- ✅ Modal presentation
- ✅ Save entry validation

**Next Steps:**
- Photo picker integration
- Backend API connection
- Photo upload to S3
- Load real diary entries
