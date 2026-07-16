import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Trip } from '../types';
import { api } from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'ShareTrip'>;

function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return isoString;
  }
}

export default function ShareTripScreen({ navigation, route }: Props) {
  const { friendId, friendName } = route.params;
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [sharingId, setSharingId] = useState<string | null>(null);

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      setLoading(true);
      const response = await api.get<Trip[]>('/trips');
      if (response.success && response.data) {
        setTrips(response.data);
      }
    } catch (err) {
      // Trips list stays empty
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    navigation.goBack();
  };

  const handleShareTrip = async (trip: Trip) => {
    try {
      setSharingId(trip.trip_id);
      const response = await api.post(`/trips/${trip.trip_id}/share`, { friend_id: friendId });
      if (response.success) {
        Alert.alert(
          'Trip Shared',
          `${trip.destination || 'Your trip'} has been shared with ${friendName}!`
        );
      } else {
        Alert.alert('Error', response.error || 'Failed to share trip');
      }
    } catch (err) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setSharingId(null);
    }
  };

  const getTripDisplayName = (trip: Trip): string => {
    if (trip.destination) return trip.destination;
    if (trip.type === 'roadtrip') return 'Road Trip';
    return 'Trip';
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

          {/* Loading / Empty / List */}
          {loading ? (
            <View style={styles.centeredState}>
              <ActivityIndicator size="large" color="#1F3D2B" />
            </View>
          ) : trips.length === 0 ? (
            <View style={styles.centeredState}>
              <Text style={styles.emptyText}>No trips yet. Create a trip first to share it!</Text>
            </View>
          ) : (
            <View style={styles.tripsList}>
              {trips.map((trip) => (
                <TouchableOpacity
                  key={trip.trip_id}
                  style={styles.tripCard}
                  onPress={() => handleShareTrip(trip)}
                  activeOpacity={0.7}
                  disabled={sharingId === trip.trip_id}
                >
                  <View style={styles.tripLeft}>
                    <View style={styles.tripColorBlock}>
                      <Text style={styles.tripColorBlockText}>
                        {getTripDisplayName(trip).slice(0, 2).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.tripInfo}>
                      <Text style={styles.tripName}>{getTripDisplayName(trip)}</Text>
                      <Text style={styles.tripStatus}>{trip.status}</Text>
                      <Text style={styles.tripDates}>{formatDate(trip.created_at)}</Text>
                    </View>
                  </View>
                  <View style={styles.tripRight}>
                    {sharingId === trip.trip_id ? (
                      <ActivityIndicator size="small" color="#1F3D2B" />
                    ) : (
                      <View style={styles.shareIconButton}>
                        <Text style={styles.shareIconText}>⤴</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
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
  centeredState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
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
  tripColorBlock: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#D87C52',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tripColorBlockText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
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
  tripStatus: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
    textTransform: 'capitalize',
  },
  tripDates: {
    fontSize: 13,
    color: '#666',
  },
  tripRight: {
    marginLeft: 8,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareIconButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareIconText: {
    fontSize: 18,
    color: '#1F3D2B',
  },
});
