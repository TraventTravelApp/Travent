import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'ShareTrip'>;

interface ShareableTrip {
  id: string;
  name: string;
  location: string;
  dates: string;
  imageUrl: string;
  isShared: boolean;
}

// Mock trips data
const mockTrips: ShareableTrip[] = [
  {
    id: '1',
    name: 'Pacific Coast Highway',
    location: 'California',
    dates: 'Mar 15-18, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=800',
    isShared: false,
  },
  {
    id: '2',
    name: 'Desert Canyon Adventu',
    location: 'Arizona & Utah',
    dates: 'Apr 22-25, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1434394673726-e8232a5903b4?w=800',
    isShared: true,
  },
];

export default function ShareTripScreen({ navigation, route }: Props) {
  const { friendId, friendName } = route.params;
  const [trips, setTrips] = useState<ShareableTrip[]>(mockTrips);

  const handleClose = () => {
    navigation.goBack();
  };

  const handleShareTrip = (trip: ShareableTrip) => {
    if (trip.isShared) {
      Alert.alert('Already Shared', `This trip is already shared with ${friendName}`);
      return;
    }

    // TODO: Share trip with friend via backend
    Alert.alert(
      'Trip Shared',
      `${trip.name} has been shared with ${friendName}!`,
      [
        {
          text: 'OK',
          onPress: () => {
            // Update local state to mark as shared
            setTrips(trips.map(t =>
              t.id === trip.id ? { ...t, isShared: true } : t
            ));
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={handleClose} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Share Trip with {friendName}</Text>
        </View>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Select which trip you'd like to share with {friendName}. They'll be able to view, edit, and add activities.
          </Text>

          {/* Trip List */}
          <View style={styles.tripsList}>
            {trips.map((trip) => (
              <TouchableOpacity
                key={trip.id}
                style={styles.tripCard}
                onPress={() => handleShareTrip(trip)}
                activeOpacity={0.7}
              >
                <View style={styles.tripLeft}>
                  <View style={styles.tripImageContainer}>
                    <Image
                      source={{ uri: trip.imageUrl }}
                      style={styles.tripImage}
                      resizeMode="cover"
                    />
                  </View>
                  <View style={styles.tripInfo}>
                    <Text style={styles.tripName}>{trip.name}</Text>
                    <Text style={styles.tripLocation}>{trip.location}</Text>
                    <Text style={styles.tripDates}>{trip.dates}</Text>
                  </View>
                </View>
                <View style={styles.tripRight}>
                  {trip.isShared ? (
                    <View style={styles.sharedIndicator}>
                      <Text style={styles.checkmark}>✓</Text>
                      <Text style={styles.sharedText}>Shared</Text>
                    </View>
                  ) : (
                    <View style={styles.shareIconButton}>
                      <Text style={styles.shareIconText}>⤴</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4EBDC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#F4EBDC',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  backButton: {
    padding: 4,
  },
  backIcon: {
    fontSize: 24,
    color: '#1F3D2B',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F3D2B',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  closeIcon: {
    fontSize: 24,
    color: '#1F3D2B',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 24,
  },
  tripsList: {
    gap: 12,
  },
  tripCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E5D4C1',
    padding: 16,
    borderRadius: 16,
  },
  tripLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  tripImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#D4C3B0',
  },
  tripImage: {
    width: '100%',
    height: '100%',
  },
  tripInfo: {
    flex: 1,
  },
  tripName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F3D2B',
    marginBottom: 4,
  },
  tripLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  tripDates: {
    fontSize: 13,
    color: '#666',
  },
  tripRight: {
    marginLeft: 8,
  },
  shareIconButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareIconText: {
    fontSize: 18,
    color: '#1F3D2B',
  },
  sharedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  checkmark: {
    fontSize: 16,
    color: '#6B9080',
    fontWeight: '700',
  },
  sharedText: {
    fontSize: 14,
    color: '#6B9080',
    fontWeight: '500',
  },
});
