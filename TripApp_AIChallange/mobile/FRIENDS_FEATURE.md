# Friends Feature

## Overview

The Friends feature allows users to manage their friend connections, view shared trips, and collaborate on travel planning together.

## How to Access

**From Home Page:**
- Click the **friends icon** (👥) in the top-right header
- Modal slides up from bottom

## Features

### 1. Add Friend Button
**UI:**
- Large terracotta/orange button at the top
- "+" icon with "Add Friend" text
- Full width with rounded corners

**Functionality (To Be Implemented):**
- Tap to open add friend dialog
- Enter friend's email or username
- Send friend request
- Receive confirmation

### 2. My Friends List
**UI:**
- Section header: "My Friends (3)" showing count
- List of friend cards with:
  - Circular avatar with initials (e.g., "SC", "MT", "ER")
  - Friend name
  - Shared trips count (e.g., "2 shared trips")
  - Share button (⤴ icon) on the right

**Features:**
- White cards with subtle shadow
- Terracotta/orange avatar background (#D87C52)
- Clean, readable layout

### 3. Share Trip Functionality
**UI:**
- Share icon button (⤴) on each friend card
- Bordered circular button

**Functionality (To Be Implemented):**
- Tap to select a trip to share
- Friend receives notification
- Collaborative editing enabled
- Real-time updates

### 4. Collaborate on Trips Info Box
**UI:**
- Tan/beige background card (#E5D4C1)
- Group icon with "Collaborate on Trips" header
- Descriptive text about collaboration features

**Content:**
"Share trips with friends to plan together! They can add activities, vote on favorites, and share memories."

## Design Specifications

### Colors
- **Background**: `#F4EBDC` (cream/beige)
- **Add Friend Button**: `#D87C52` (terracotta/orange)
- **Avatar Circle**: `#D87C52` (terracotta/orange)
- **Friend Cards**: `#FFFFFF` (white)
- **Info Box**: `#E5D4C1` (tan/beige)
- **Share Button Border**: `#1F3D2B` (dark green)

### Layout
- Modal presentation (slides from bottom)
- Header with back arrow, "Friends" title, and close (X)
- Add Friend button at top
- Scrollable friends list
- Info box at bottom
- 20px horizontal padding

### Typography
- **Header Title**: 20px, semi-bold
- **Section Title**: 18px, semi-bold
- **Friend Name**: 16px, semi-bold
- **Shared Trips**: 14px, regular
- **Avatar Initials**: 18px, bold
- **Add Friend Text**: 16px, semi-bold
- **Info Title**: 16px, semi-bold
- **Info Description**: 14px, line height 20px

## Assets

### Icons Added
1. **group-icon-new.png**: Group/people icon for collaborate section

**Location**: `assets/images/`

## File Structure

```
src/
├── screens/
│   ├── FriendsScreen.tsx (Main friends modal component)
│   └── HomeScreen.tsx (Updated friends button)
├── types/
│   └── index.ts (Added Friends to navigation types)
└── navigation/
    └── AppNavigator.tsx (Added modal route)

assets/
└── images/
    └── group-icon-new.png (new)
```

## Navigation Flow

```
HomeScreen
    ↓ (Click friends icon 👥)
FriendsScreen (Modal)
    ↓ (Click X or back)
Back to HomeScreen
```

## Data Structure

### Friend Interface
```typescript
interface Friend {
  id: string;
  name: string;
  initials: string;
  sharedTrips: number;
  email?: string;
}
```

## Backend Integration (To Be Implemented)

### Get Friends Endpoint
**GET** `/friends`

Returns list of user's friends with shared trip counts.

### Add Friend Endpoint
**POST** `/friends/request`

```json
{
  "email": "friend@example.com"
}
```

Send friend request to another user.

### Accept Friend Request
**POST** `/friends/accept/{requestId}`

Accept a pending friend request.

### Share Trip Endpoint
**POST** `/trips/{tripId}/share`

```json
{
  "friendId": "friend-123",
  "permissions": "edit" // or "view"
}
```

Share a trip with a friend.

### Get Shared Trips
**GET** `/trips/shared`

Returns all trips shared with the user.

## Features To Implement

### Immediate:
- [ ] Add friend functionality (search by email)
- [ ] Friend request system (send/accept/decline)
- [ ] Share trip dialog with trip selection
- [ ] Connect to backend friends API
- [ ] Load real friends list

### Future Enhancements:
- [ ] Friend search with autocomplete
- [ ] Pending friend requests notification badge
- [ ] Remove/unfriend functionality
- [ ] Block user functionality
- [ ] Friend activity feed
- [ ] Shared trip notifications
- [ ] Collaborative trip editing with real-time sync
- [ ] Friend suggestions based on interests
- [ ] Group trip planning (multiple friends)
- [ ] Chat/messaging with friends
- [ ] Share trip memories/photos with friends
- [ ] Vote on activities together
- [ ] See friends' public trips
- [ ] Privacy settings (who can see your trips)

## Mock Data

Currently showing 3 mock friends:
1. **Sarah Chen** (SC) - 2 shared trips
2. **Mike Torres** (MT) - 2 shared trips
3. **Emma Rodriguez** (ER) - 2 shared trips

## Testing

### Current State (Demo Mode)
1. Navigate to Home screen
2. Click friends icon (👥) in top-right
3. Friends modal appears
4. See list of 3 mock friends
5. Click "Add Friend" to see alert
6. Click share button (⤴) to see alert
7. Close with X or back arrow

### With Backend
1. All above steps
2. Add friend by email
3. See pending requests
4. Accept/decline friend requests
5. Share actual trips with friends
6. See real shared trip count
7. Receive notifications

## Add Friend Implementation

To add the add friend functionality:

```typescript
const handleAddFriend = async () => {
  // Show input dialog for email
  Alert.prompt(
    'Add Friend',
    'Enter your friend\'s email address',
    async (email: string) => {
      if (!email) return;

      // Call backend API
      const response = await api.post('/friends/request', { email });

      if (response.success) {
        Alert.alert('Success', 'Friend request sent!');
      } else {
        Alert.alert('Error', response.error || 'Failed to send friend request');
      }
    },
    'plain-text'
  );
};
```

## Share Trip Implementation

```typescript
const handleShareTrip = async (friend: Friend) => {
  // Get list of user's trips
  const tripsResponse = await api.get('/trips');

  if (!tripsResponse.success) {
    Alert.alert('Error', 'Failed to load trips');
    return;
  }

  // Show action sheet to select trip
  const tripNames = tripsResponse.data.map(t => t.name);

  ActionSheetIOS.showActionSheetWithOptions(
    {
      options: ['Cancel', ...tripNames],
      cancelButtonIndex: 0,
    },
    async (buttonIndex) => {
      if (buttonIndex === 0) return;

      const selectedTrip = tripsResponse.data[buttonIndex - 1];

      // Share the trip
      const shareResponse = await api.post(
        `/trips/${selectedTrip.id}/share`,
        { friendId: friend.id, permissions: 'edit' }
      );

      if (shareResponse.success) {
        Alert.alert('Success', `Trip shared with ${friend.name}!`);
      } else {
        Alert.alert('Error', 'Failed to share trip');
      }
    }
  );
};
```

## Permissions System

When sharing trips, users can grant different permission levels:

- **View Only**: Friend can see the trip but not edit
- **Edit**: Friend can add/remove activities, edit details
- **Admin**: Friend can share with others, delete trip

## Troubleshooting

**Modal not appearing:**
- Check that Friends is in RootStackParamList
- Verify modal presentation option is set
- Check friends icon has correct onPress handler

**Friends list not loading:**
- Check backend endpoint is deployed
- Verify authentication token is valid
- Check network connectivity

**Share button not working:**
- Ensure friend ID is being passed correctly
- Check share endpoint permissions
- Verify trip ID is valid

## Summary

The Friends feature enables social collaboration on trip planning. Users can:
- ✅ View their friends list
- ✅ See shared trip counts
- ✅ Access share functionality
- ✅ Learn about collaboration features

**Current Implementation:**
- ✅ Complete UI matching design spec
- ✅ Friends list with avatars and info
- ✅ Add Friend button
- ✅ Share buttons on each friend
- ✅ Collaborate info box
- ✅ Modal presentation

**Next Steps:**
- Add friend request functionality
- Backend API integration
- Real-time collaboration features
- Notification system
