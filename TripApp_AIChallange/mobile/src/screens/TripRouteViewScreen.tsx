import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import MapViewWrapper, { MarkerWrapper, PROVIDER } from '../components/map/MapViewWrapper';
import { api } from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'TripRouteView'>;

interface Activity {
  id: string;
  stepNumber: number;
  time: string;
  category: string;
  name: string;
  description: string;
  location: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

interface DayData {
  dayNumber: number;
  date: string;
  duration: string;
  estimatedCost: string;
  activities: Activity[];
  travelTime: string;
}

// Mock trip data
const mockTripData = {
  tripId: 'trip-demo-123',
  tripName: 'Pacific Coast Trip',
  dateRange: 'Mar 15-18, 2026',
  totalDays: 3,
  days: [
    {
      dayNumber: 1,
      date: 'Mar 15',
      duration: 'Full Day',
      estimatedCost: '$120 per person',
      travelTime: '~45 min',
      activities: [
        {
          id: '1',
          stepNumber: 1,
          time: '8:00 AM',
          category: 'Breakfast & Coffee',
          name: 'Morning Brew Coffee Co.',
          description: 'Cozy café with artisanal pastries and locally roasted coffee.',
          location: 'Downtown',
          coordinates: { latitude: 45.5231, longitude: -122.6765 },
        },
        {
          id: '2',
          stepNumber: 2,
          time: '10:00 AM',
          category: 'Nature & Hiking',
          name: "Eagle's Nest Trail",
          description: 'Beautiful urban forest with scenic trails.',
          location: 'East Ridge',
          coordinates: { latitude: 45.5428, longitude: -122.7104 },
        },
        {
          id: '3',
          stepNumber: 3,
          time: '1:00 PM',
          category: 'Lunch & Dining',
          name: "The Forager's Table",
          description: 'Farm-to-table restaurant with seasonal menu.',
          location: 'Arts District',
          coordinates: { latitude: 45.5205, longitude: -122.6809 },
        },
        {
          id: '4',
          stepNumber: 4,
          time: '3:30 PM',
          category: 'Art & Culture',
          name: 'Watershed Gallery',
          description: 'Contemporary art galleries in historic Pearl District.',
          location: 'Arts District',
          coordinates: { latitude: 45.5264, longitude: -122.6823 },
        },
      ],
    },
    {
      dayNumber: 2,
      date: 'Mar 16',
      duration: 'Full Day',
      estimatedCost: '$95 per person',
      travelTime: '~30 min',
      activities: [
        {
          id: '1',
          stepNumber: 1,
          time: '8:30 AM',
          category: 'Breakfast & Coffee',
          name: 'Sunrise Coffee House',
          description: 'Early morning coffee spot with fresh pastries.',
          location: 'Downtown',
          coordinates: { latitude: 45.5155, longitude: -122.6789 },
        },
        {
          id: '2',
          stepNumber: 2,
          time: '10:00 AM',
          category: 'Waterfront & Views',
          name: 'Waterfront Park',
          description: 'Scenic waterfront with walking paths and river views.',
          location: 'Waterfront',
          coordinates: { latitude: 45.5202, longitude: -122.6712 },
        },
      ],
    },
    {
      dayNumber: 3,
      date: 'Mar 17',
      duration: 'Half Day',
      estimatedCost: '$65 per person',
      travelTime: '~20 min',
      activities: [
        {
          id: '1',
          stepNumber: 1,
          time: '10:00 AM',
          category: 'Shopping & Markets',
          name: 'Portland Saturday Market',
          description: 'Weekly farmers market with local produce and crafts.',
          location: 'Downtown',
          coordinates: { latitude: 45.5231, longitude: -122.6708 },
        },
      ],
    },
  ],
};

export default function TripRouteViewScreen({ navigation, route }: Props) {
  const { tripId } = route.params || {};
  const [selectedDay, setSelectedDay] = useState(1);
  const [tripData, setTripData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTripData();
  }, [tripId]);

  const fetchTripData = async () => {
    if (!tripId) {
      console.log('[TripRouteView] No tripId provided, using mock data');
      setTripData(mockTripData);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('[TripRouteView] Fetching trip:', tripId);

      const response = await api.get(`/trips/${tripId}`);

      console.log('[TripRouteView] Response:', {
        success: response.success,
        hasData: !!response.data,
        error: response.error,
      });

      if (response.success && response.data) {
        const transformedData = transformBackendData(response.data);
        console.log('[TripRouteView] Trip loaded successfully');
        setTripData(transformedData);
        setError(null);
      } else {
        console.error('[TripRouteView] Fetch failed:', response.error);
        setError(response.error || 'Failed to load trip');
        setTripData(mockTripData); // Fallback to mock data
      }
    } catch (error) {
      console.error('[TripRouteView] Exception:', error);
      setError(error instanceof Error ? error.message : 'Network error');
      setTripData(mockTripData); // Fallback to mock data
    } finally {
      setLoading(false);
    }
  };

  const transformBackendData = (backendTrip: any) => {
    console.log('[TripRouteView] Transforming backend data:', {
      trip_id: backendTrip.trip_id,
      duration: backendTrip.duration,
      daysCount: backendTrip.itinerary?.days?.length,
    });

    return {
      tripId: backendTrip.trip_id,
      tripName: backendTrip.title || 'Trip',
      dateRange: `${backendTrip.start_date} - ${backendTrip.end_date}`,
      totalDays: backendTrip.duration || backendTrip.itinerary?.days?.length || 1,
      days: (backendTrip.itinerary?.days || []).map((day: any, index: number) => ({
        dayNumber: day.day || index + 1,
        date: backendTrip.start_date || 'TBD',
        duration: `${day.activities?.length || 0} activities`,
        estimatedCost: day.total_cost ? `$${day.total_cost}` : 'TBD',
        travelTime: '~30 min',
        activities: (day.activities || []).map((activity: any, actIndex: number) => ({
          id: `${index}-${actIndex}`,
          stepNumber: actIndex + 1,
          time: String(activity.time || 'TBD'),
          category: String(activity.category || 'Activity'),
          name: String(activity.name || 'Activity'),
          description: String(activity.description || ''),
          location: String(activity.location || 'Location'),
          coordinates: activity.coordinates || (activity.latitude && activity.longitude
            ? { latitude: activity.latitude, longitude: activity.longitude }
            : null),
        })),
      })),
    };
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1F3D2B" />
          <Text style={styles.loadingText}>Loading trip...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!tripData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No trip data available</Text>
          <TouchableOpacity onPress={fetchTripData} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentDayData = tripData.days.find((d: any) => d.dayNumber === selectedDay) || tripData.days[0];

  // Calculate map region to fit all markers
  const getMapRegion = () => {
    const coordinates = currentDayData.activities
      .filter((a) => a.coordinates)
      .map((a) => a.coordinates!);

    if (coordinates.length === 0) {
      return {
        latitude: 45.5231,
        longitude: -122.6765,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
    }

    const latitudes = coordinates.map((c) => c.latitude);
    const longitudes = coordinates.map((c) => c.longitude);

    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);

    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    const latDelta = (maxLat - minLat) * 1.5 || 0.0922;
    const lngDelta = (maxLng - minLng) * 1.5 || 0.0421;

    return {
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: latDelta,
      longitudeDelta: lngDelta,
    };
  };

  const handleStartRoute = () => {
    // TODO: Integrate with navigation app or start turn-by-turn
    console.log('Starting route for day', selectedDay);
  };

  const handleOpenListView = () => {
    navigation.navigate('TripDayListView', { tripId: tripData.tripId });
  };

  const handleOpenDiary = () => {
    navigation.navigate('TravelDiary', { tripId: tripData.tripId });
  };

  const handleSaveAndExit = () => {
    // TODO: Save trip to backend
    // For now, just navigate to home
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.tripName}>{tripData.tripName}</Text>
            <Text style={styles.dateRange}>{tripData.dateRange}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIconButton} onPress={handleOpenListView}>
            <Image
              source={require('../../assets/images/list-icon.png')}
              style={styles.headerIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconButton} onPress={handleOpenDiary}>
            <Image
              source={require('../../assets/images/book-icon.png')}
              style={styles.headerIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Day Selector */}
        <View style={styles.daySelector}>
          {tripData.days.map((day) => (
            <TouchableOpacity
              key={day.dayNumber}
              style={[
                styles.dayButton,
                selectedDay === day.dayNumber && styles.dayButtonActive,
              ]}
              onPress={() => setSelectedDay(day.dayNumber)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.dayButtonText,
                  selectedDay === day.dayNumber && styles.dayButtonTextActive,
                ]}
              >
                Day {day.dayNumber}
              </Text>
              <Text
                style={[
                  styles.dayButtonDate,
                  selectedDay === day.dayNumber && styles.dayButtonDateActive,
                ]}
              >
                {day.date}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Map */}
        <View style={styles.mapContainer}>
          <MapViewWrapper
            style={styles.map}
            provider={PROVIDER}
            initialRegion={getMapRegion()}
            region={getMapRegion()}
            scrollEnabled={true}
            zoomEnabled={true}
          >
            {currentDayData.activities.map((activity) => {
              if (!activity.coordinates) return null;
              return (
                <MarkerWrapper
                  key={activity.id}
                  coordinate={activity.coordinates}
                  pinColor="#1F3D2B"
                />
              );
            })}
          </MapViewWrapper>

          {/* Zoom Controls */}
          <View style={styles.zoomControls}>
            <TouchableOpacity style={styles.zoomButton}>
              <Text style={styles.zoomButtonText}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.zoomButton}>
              <Text style={styles.zoomButtonText}>−</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Today's Route Card */}
        <View style={styles.routeCard}>
          <View style={styles.routeCardLeft}>
            <Text style={styles.routeCardTitle}>Today's Route</Text>
            <Text style={styles.routeCardSubtitle}>
              {currentDayData.activities.length} stops • {currentDayData.travelTime} travel
            </Text>
          </View>
          <TouchableOpacity style={styles.startButton} onPress={handleStartRoute} activeOpacity={0.8}>
            <Text style={styles.startButtonIcon}>➔</Text>
            <Text style={styles.startButtonText}>Start</Text>
          </TouchableOpacity>
        </View>

        {/* Activities List */}
        <View style={styles.activitiesList}>
          {currentDayData.activities.map((activity) => (
            <TouchableOpacity
              key={activity.id}
              style={styles.activityItem}
              activeOpacity={0.7}
              onPress={() => {
                // TODO: Navigate to activity details or show on map
                console.log('Activity tapped:', activity.name);
              }}
            >
              <View style={styles.activityNumberCircle}>
                <Text style={styles.activityNumber}>{activity.stepNumber}</Text>
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityName}>{activity.name}</Text>
                <View style={styles.activityMeta}>
                  <Text style={styles.activityTime}>{activity.time}</Text>
                  <Text style={styles.activityDot}>•</Text>
                  <Text style={styles.activityLocation}>{activity.location}</Text>
                </View>
              </View>
              <Image
                source={require('../../assets/images/location-pin-icon.png')}
                style={styles.activityLocationIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Save and Exit Button */}
        <View style={styles.saveButtonContainer}>
          <TouchableOpacity
            style={styles.saveAndExitButton}
            onPress={handleSaveAndExit}
            activeOpacity={0.8}
          >
            <Text style={styles.saveAndExitButtonText}>Save and Exit</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4EBDC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#1F3D2B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#F4EBDC',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  backButton: {
    padding: 4,
  },
  backIcon: {
    fontSize: 24,
    color: '#1F3D2B',
  },
  tripName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F3D2B',
  },
  dateRange: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  headerIcon: {
    width: 20,
    height: 20,
    tintColor: '#1F3D2B',
  },
  daySelector: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  dayButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  dayButtonActive: {
    backgroundColor: '#1F3D2B',
    borderColor: '#1F3D2B',
  },
  dayButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F3D2B',
  },
  dayButtonTextActive: {
    color: '#FFFFFF',
  },
  dayButtonDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  dayButtonDateActive: {
    color: '#E5D4C1',
  },
  mapContainer: {
    height: 280,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  zoomControls: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    gap: 8,
  },
  zoomButton: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  zoomButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F3D2B',
  },
  routeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  routeCardLeft: {
    flex: 1,
  },
  routeCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F3D2B',
    marginBottom: 4,
  },
  routeCardSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#D87C52',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  startButtonIcon: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  startButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  activitiesList: {
    marginTop: 16,
    marginHorizontal: 16,
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  activityNumberCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#D87C52',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  activityInfo: {
    flex: 1,
  },
  activityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F3D2B',
    marginBottom: 4,
  },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activityTime: {
    fontSize: 13,
    color: '#666',
  },
  activityDot: {
    fontSize: 13,
    color: '#666',
  },
  activityLocation: {
    fontSize: 13,
    color: '#666',
  },
  activityLocationIcon: {
    width: 20,
    height: 20,
    tintColor: '#666',
  },
  saveButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  saveAndExitButton: {
    backgroundColor: '#1F3D2B',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveAndExitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bottomSpacing: {
    height: 40,
  },
});
