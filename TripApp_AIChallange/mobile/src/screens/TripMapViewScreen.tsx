import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import MapViewWrapper, { MarkerWrapper, PROVIDER } from '../components/map/MapViewWrapper';

// Polyline wrapper - only available with real maps
let PolylineWrapper: any = null;
try {
  const maps = require('react-native-maps');
  PolylineWrapper = maps.Polyline;
} catch (e) {
  PolylineWrapper = () => null;
}

type Props = NativeStackScreenProps<RootStackParamList, 'TripMapView'>;

interface Activity {
  id: string;
  stepNumber: number;
  time: string;
  category: string;
  name: string;
  description: string;
  image: string;
  tags: string[];
  duration: string;
  cost: string | number;
  rating?: number;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

interface DayData {
  dayNumber: number;
  duration: string;
  estimatedCost: string;
  activities: Activity[];
}

// Mock trip data with coordinates
// In production, these would come from the backend with geocoded addresses
const mockTripData = {
  tripId: 'trip-demo-123',
  destination: 'Portland, Oregon',
  totalDays: 3,
  days: [
    {
      dayNumber: 1,
      duration: 'Full Day',
      estimatedCost: '$120 per person',
      activities: [
        {
          id: '1',
          stepNumber: 1,
          time: '9:00 AM',
          category: 'Breakfast & Coffee',
          name: 'Morning Glory Café',
          description: 'Cozy café with artisanal pastries and locally roasted coffee.',
          image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800',
          tags: ['Local Pick', 'Low Crowd'],
          duration: '1 hour',
          cost: 15,
          rating: 87,
          coordinates: { latitude: 45.5231, longitude: -122.6765 },
        },
        {
          id: '2',
          stepNumber: 2,
          time: '10:30 AM',
          category: 'Nature & Parks',
          name: 'Forest Park Trail',
          description: 'Beautiful urban forest with scenic trails.',
          image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800',
          tags: ['Community Favorite', 'Hidden Gem'],
          duration: '2.5 hours',
          cost: 'Free',
          rating: 92,
          coordinates: { latitude: 45.5428, longitude: -122.7104 },
        },
        {
          id: '3',
          stepNumber: 3,
          time: '1:30 PM',
          category: 'Lunch & Dining',
          name: 'Farm Fresh Bistro',
          description: 'Farm-to-table restaurant with seasonal menu.',
          image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
          tags: ['Local Love', 'Underrated'],
          duration: '1.5 hours',
          cost: 35,
          rating: 95,
          coordinates: { latitude: 45.5205, longitude: -122.6809 },
        },
        {
          id: '4',
          stepNumber: 4,
          time: '3:30 PM',
          category: 'Art & Culture',
          name: 'Pearl District Galleries',
          description: 'Contemporary art galleries in historic Pearl District.',
          image: 'https://images.unsplash.com/photo-1564399579883-451a5d44ec08?w=800',
          tags: ['Community Favorite'],
          duration: '1.5 hours',
          cost: 12,
          rating: 78,
          coordinates: { latitude: 45.5264, longitude: -122.6823 },
        },
      ],
    },
    {
      dayNumber: 2,
      duration: 'Full Day',
      estimatedCost: '$95 per person',
      activities: [
        {
          id: '1',
          stepNumber: 1,
          time: '8:30 AM',
          category: 'Breakfast & Coffee',
          name: 'Sunrise Coffee House',
          description: 'Early morning coffee spot with fresh pastries.',
          image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800',
          tags: ['Local Pick'],
          duration: '45 minutes',
          cost: 12,
          rating: 85,
          coordinates: { latitude: 45.5155, longitude: -122.6789 },
        },
        {
          id: '2',
          stepNumber: 2,
          time: '10:00 AM',
          category: 'Waterfront & Views',
          name: 'Waterfront Park',
          description: 'Scenic waterfront with walking paths and river views.',
          image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800',
          tags: ['Hidden Gem'],
          duration: '2 hours',
          cost: 'Free',
          rating: 90,
          coordinates: { latitude: 45.5202, longitude: -122.6712 },
        },
      ],
    },
    {
      dayNumber: 3,
      duration: 'Half Day',
      estimatedCost: '$65 per person',
      activities: [
        {
          id: '1',
          stepNumber: 1,
          time: '10:00 AM',
          category: 'Shopping & Markets',
          name: 'Portland Saturday Market',
          description: 'Weekly farmers market with local produce and crafts.',
          image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800',
          tags: ['Local Pick', 'Community Favorite'],
          duration: '2 hours',
          cost: 20,
          rating: 89,
          coordinates: { latitude: 45.5231, longitude: -122.6708 },
        },
      ],
    },
  ],
};

export default function TripMapViewScreen({ navigation, route }: Props) {
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const tripData = mockTripData;
  const currentDayData = tripData.days.find((d) => d.dayNumber === selectedDay) || tripData.days[0];

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

  // Get route coordinates for polyline
  const getRouteCoordinates = () => {
    return currentDayData.activities
      .filter((a) => a.coordinates)
      .map((a) => ({
        latitude: a.coordinates!.latitude,
        longitude: a.coordinates!.longitude,
      }));
  };

  const getCategoryColor = (category: string): string => {
    const colors: { [key: string]: string } = {
      'Breakfast & Coffee': '#E57373',
      'Nature & Parks': '#81C784',
      'Nature & Hiking': '#81C784',
      'Lunch & Dining': '#FFB74D',
      'Art & Culture': '#9575CD',
      'Waterfront & Views': '#4FC3F7',
      'Shopping & Markets': '#F06292',
    };
    return colors[category] || '#1F3D2B';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
          <Text style={styles.backText}>Back to Preview</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{tripData.destination}</Text>
      </View>

      {/* Day Selector */}
      <View style={styles.daySelector}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayScrollContent}>
          {tripData.days.map((day) => (
            <TouchableOpacity
              key={day.dayNumber}
              style={[
                styles.dayButton,
                selectedDay === day.dayNumber && styles.dayButtonActive,
              ]}
              onPress={() => {
                setSelectedDay(day.dayNumber);
                setSelectedActivity(null);
              }}
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
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapViewWrapper
          style={styles.map}
          provider={PROVIDER}
          initialRegion={getMapRegion()}
          region={getMapRegion()}
        >
          {/* Route polyline */}
          {PolylineWrapper && getRouteCoordinates().length > 1 && (
            <PolylineWrapper
              coordinates={getRouteCoordinates()}
              strokeColor="#1F3D2B"
              strokeWidth={3}
              lineDashPattern={[5, 5]}
            />
          )}

          {/* Activity markers */}
          {currentDayData.activities.map((activity) => {
            if (!activity.coordinates) return null;
            return (
              <MarkerWrapper
                key={activity.id}
                coordinate={activity.coordinates}
                onPress={() => setSelectedActivity(activity)}
                pinColor={getCategoryColor(activity.category)}
              >
                <View style={styles.markerContainer}>
                  <View
                    style={[
                      styles.marker,
                      {
                        backgroundColor: getCategoryColor(activity.category),
                        borderColor: selectedActivity?.id === activity.id ? '#1F3D2B' : 'white',
                        borderWidth: selectedActivity?.id === activity.id ? 3 : 2,
                      },
                    ]}
                  >
                    <Text style={styles.markerText}>{activity.stepNumber}</Text>
                  </View>
                </View>
              </MarkerWrapper>
            );
          })}
        </MapViewWrapper>
      </View>

      {/* Selected Activity Info */}
      {selectedActivity && (
        <View style={styles.activityInfo}>
          <View style={styles.activityInfoHeader}>
            <View style={styles.activityInfoTitle}>
              <View
                style={[
                  styles.activityInfoDot,
                  { backgroundColor: getCategoryColor(selectedActivity.category) },
                ]}
              />
              <Text style={styles.activityInfoName}>{selectedActivity.name}</Text>
            </View>
            <TouchableOpacity onPress={() => setSelectedActivity(null)}>
              <Text style={styles.activityInfoClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.activityInfoCategory}>{selectedActivity.category}</Text>
          <Text style={styles.activityInfoDescription}>{selectedActivity.description}</Text>
          <View style={styles.activityInfoDetails}>
            <Text style={styles.activityInfoDetail}>⏱ {selectedActivity.duration}</Text>
            <Text style={styles.activityInfoDetail}>
              💰 {typeof selectedActivity.cost === 'number' ? `$${selectedActivity.cost}` : selectedActivity.cost}
            </Text>
            {selectedActivity.rating && (
              <Text style={styles.activityInfoDetail}>⭐ {selectedActivity.rating}%</Text>
            )}
          </View>
        </View>
      )}

      {/* Legend */}
      {!selectedActivity && (
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Activity Types</Text>
          <View style={styles.legendItems}>
            {Array.from(new Set(currentDayData.activities.map((a) => a.category))).map((category) => (
              <View key={category} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: getCategoryColor(category) }]} />
                <Text style={styles.legendText}>{category}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4EBDC',
  },
  header: {
    backgroundColor: '#F4EBDC',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  backIcon: {
    fontSize: 24,
    color: '#1F3D2B',
  },
  backText: {
    fontSize: 16,
    color: '#1F3D2B',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F3D2B',
  },
  daySelector: {
    backgroundColor: '#F4EBDC',
    paddingVertical: 12,
  },
  dayScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  dayButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5D4C1',
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
  mapContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  map: {
    width: Dimensions.get('window').width,
    height: '100%',
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  marker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  activityInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  activityInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  activityInfoTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  activityInfoDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  activityInfoName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F3D2B',
    flex: 1,
  },
  activityInfoClose: {
    fontSize: 24,
    color: '#666',
    padding: 4,
  },
  activityInfoCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    marginLeft: 22,
  },
  activityInfoDescription: {
    fontSize: 14,
    color: '#1F3D2B',
    lineHeight: 20,
    marginBottom: 12,
    marginLeft: 22,
  },
  activityInfoDetails: {
    flexDirection: 'row',
    gap: 16,
    marginLeft: 22,
  },
  activityInfoDetail: {
    fontSize: 13,
    color: '#1F3D2B',
    fontWeight: '500',
  },
  legend: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F3D2B',
    marginBottom: 12,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#1F3D2B',
  },
});
