import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ActivityCard, { Activity } from '../components/trip/ActivityCard';
import DaySummary from '../components/trip/DaySummary';
import { api } from '../services/api';

// Mock data - replace with actual data from API
const mockTripData = {
  tripId: '123',
  totalDays: 3,
  days: [
    {
      dayNumber: 1,
      duration: 'Full Day',
      estimatedCost: '$85 per person',
      activities: [
        {
          id: '1',
          stepNumber: 1,
          time: '9:00 AM',
          category: 'Coffee & Breakfast',
          name: 'Sunrise Roastery',
          description: 'Artisanal coffee shop with locally sourced pastries and a cozy atmosphere.',
          image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800',
          tags: ['Local Pick', 'Hidden Gem'],
          duration: '1 hour',
          cost: 12,
          rating: 94,
        },
      ],
    },
    {
      dayNumber: 2,
      duration: 'Full Day',
      estimatedCost: '$91 per person',
      activities: [
        {
          id: '1',
          stepNumber: 1,
          time: '8:00 AM',
          category: 'Coffee & Breakfast',
          name: 'Morning Brew Coffee Co.',
          description: 'Local favorite with house-roasted beans and artisan pastries. Known for their maple lavender latte.',
          image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800',
          tags: ['Local Pick', 'Low Crowd'],
          duration: '1 hour',
          cost: 15,
          rating: 87,
        },
        {
          id: '2',
          stepNumber: 2,
          time: '10:00 AM',
          category: 'Nature & Hiking',
          name: "Eagle's Nest Trail",
          description: 'Moderate hike with panoramic valley views. Best at golden hour, rarely crowded on weekdays.',
          image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800',
          tags: ['Community Favorite', 'Hidden Gem'],
          duration: '2.5 hours',
          cost: 'Free',
          rating: 92,
        },
        {
          id: '3',
          stepNumber: 3,
          time: '1:00 PM',
          category: 'Lunch & Dining',
          name: "The Forager's Table",
          description: 'Farm-to-table restaurant featuring seasonal ingredients from local farms. Try the wild mushroom risotto.',
          image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
          tags: ['Local Love', 'Underrated'],
          duration: '1.5 hours',
          cost: 35,
          rating: 95,
        },
        {
          id: '4',
          stepNumber: 4,
          time: '3:30 PM',
          category: 'Art & Culture',
          name: 'Watershed Gallery',
          description: 'Contemporary art space showcasing regional artists. Intimate setting with rotating exhibitions.',
          image: 'https://images.unsplash.com/photo-1564399579883-451a5d44ec08?w=800',
          tags: ['Community Favorite'],
          duration: '1 hour',
          cost: 12,
          rating: 78,
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
          name: 'Riverfront Market',
          description: 'Weekly farmers market with local produce, crafts, and live music.',
          image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800',
          tags: ['Local Pick', 'Community Favorite'],
          duration: '2 hours',
          cost: 20,
          rating: 89,
        },
      ],
    },
  ],
};

export default function TripPreviewScreen({ navigation, route }: any) {
  const { tripId } = route.params || {};
  const [currentDay, setCurrentDay] = useState(1);
  const [tripData, setTripData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTripData();
  }, [tripId]);

  const fetchTripData = async () => {
    if (!tripId) {
      // Fallback to mock data if no tripId
      console.log('[TripPreview] No tripId provided, using mock data');
      setTripData(mockTripData);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('[TripPreview] Fetching trip:', tripId);

      const response = await api.get(`/trips/${tripId}`);

      // LOG FULL RESPONSE
      console.log('[TripPreview] Response:', {
        success: response.success,
        hasData: !!response.data,
        error: response.error,
        dataKeys: response.data ? Object.keys(response.data) : []
      });

      if (response.success && response.data) {
        // Transform backend data to match expected format
        console.log('[TripPreview] Transforming trip data...');
        const transformedData = transformBackendData(response.data);
        console.log('[TripPreview] Trip loaded successfully');
        setTripData(transformedData);
        setError(null); // Clear any previous errors
      } else {
        // LOG ERROR DETAILS
        console.error('[TripPreview] Fetch failed:', {
          success: response.success,
          error: response.error,
          tripId: tripId
        });
        // Set error state instead of silent fallback
        setError(response.error || 'Failed to load trip from server');
        setTripData(null);
      }
    } catch (error) {
      // LOG EXCEPTION
      console.error('[TripPreview] Exception:', {
        message: error instanceof Error ? error.message : 'Unknown',
        tripId: tripId
      });
      // Set error state instead of silent fallback
      setError(error instanceof Error ? error.message : 'Network error');
      setTripData(null);
    } finally {
      setLoading(false);
    }
  };

  const transformBackendData = (backendTrip: any) => {
    // Transform backend trip format to UI format
    return {
      tripId: backendTrip.trip_id,
      totalDays: backendTrip.duration || backendTrip.itinerary?.days?.length || 1,
      days: (backendTrip.itinerary?.days || []).map((day: any, index: number) => ({
        dayNumber: day.day || index + 1,
        duration: `${day.activities?.length || 0} activities`,
        estimatedCost: day.totalCostUSD ? `$${day.totalCostUSD}` : 'TBD',
        activities: (day.activities || []).map((activity: any, actIndex: number) => ({
          id: `${index}-${actIndex}`,
          stepNumber: actIndex + 1,
          time: String(activity.time || 'TBD'),
          category: String(activity.type || activity.category || 'Activity'),
          name: String(activity.name || 'Activity'),
          description: String(activity.description || ''),
          image: String(activity.image || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800'),
          tags: Array.isArray(activity.tags) ? activity.tags.map(String) : [],
          duration: String(activity.duration || (activity.durationHours ? `${activity.durationHours} hours` : (activity.estimated_duration || 'TBD'))),
          cost: typeof activity.cost === 'number' ? activity.cost : (activity.costUSD || activity.estimated_cost || 0),
          rating: typeof activity.rating === 'number' ? activity.rating : 0,
        })),
      })),
    };
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2F6F6D" />
          <Text style={styles.loadingText}>Loading your trip...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Failed to Load Trip</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <View style={styles.errorButtons}>
            <TouchableOpacity onPress={fetchTripData} style={styles.retryButton}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setTripData(mockTripData);
                setError(null);
              }}
              style={styles.demoButton}
            >
              <Text style={styles.demoText}>Use Demo Data</Text>
            </TouchableOpacity>
          </View>
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

  const currentDayData = tripData.days.find((d: any) => d.dayNumber === currentDay) || tripData.days[0];

  const handlePreviousDay = () => {
    if (currentDay > 1) {
      setCurrentDay(currentDay - 1);
    }
  };

  const handleNextDay = () => {
    if (currentDay < tripData.totalDays) {
      setCurrentDay(currentDay + 1);
    }
  };

  const handleLooksGood = () => {
    // Save trip and navigate to route view
    navigation.navigate('TripRouteView', { tripId: tripData.tripId });
  };

  const handleEditActivities = () => {
    navigation.navigate('EditActivities', {
      tripId: tripData.tripId,
      dayNumber: currentDay
    });
  };

  const handleViewMap = () => {
    navigation.navigate('TripRouteView', { tripId: tripData.tripId });
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
            <Text style={styles.headerTitle}>Trip Preview</Text>
            <Text style={styles.headerSubtitle}>
              Day {currentDay} of {tripData.totalDays}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleLooksGood} style={styles.looksGoodButton}>
          <Text style={styles.looksGoodText}>Looks Good!</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Day Selector */}
        <View style={styles.daySelector}>
          <TouchableOpacity
            onPress={handlePreviousDay}
            disabled={currentDay === 1}
            style={[styles.arrowButton, currentDay === 1 && styles.arrowButtonDisabled]}
          >
            <Text style={[styles.arrowText, currentDay === 1 && styles.arrowTextDisabled]}>
              ‹
            </Text>
          </TouchableOpacity>

          <View style={styles.dayPills}>
            {Array.from({ length: tripData.totalDays }, (_, i) => i + 1).map((day) => (
              <TouchableOpacity
                key={day}
                onPress={() => setCurrentDay(day)}
                style={[styles.dayPill, day === currentDay && styles.dayPillActive]}
              >
                <Text style={[styles.dayPillText, day === currentDay && styles.dayPillTextActive]}>
                  Day {day}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            onPress={handleNextDay}
            disabled={currentDay === tripData.totalDays}
            style={[
              styles.arrowButton,
              currentDay === tripData.totalDays && styles.arrowButtonDisabled,
            ]}
          >
            <Text
              style={[
                styles.arrowText,
                currentDay === tripData.totalDays && styles.arrowTextDisabled,
              ]}
            >
              ›
            </Text>
          </TouchableOpacity>
        </View>

        {/* Day Summary */}
        <DaySummary
          dayNumber={currentDay}
          duration={String(currentDayData.duration || 'TBD')}
          estimatedCost={String(currentDayData.estimatedCost || 'TBD')}
          activityCount={currentDayData.activities?.length || 0}
        />

        {/* Activities Header */}
        <View style={styles.activitiesHeader}>
          <Text style={styles.activitiesTitle}>Day {currentDay} Activities</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditActivities}
            activeOpacity={0.7}
          >
            <Text style={styles.editButtonText}>Edit Activities</Text>
          </TouchableOpacity>
        </View>

        {/* Activities List */}
        <View style={styles.activitiesList}>
          {currentDayData.activities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </View>

        {/* Map CTA */}
        <View style={styles.mapCta}>
          <View style={styles.mapIconCircle}>
            <Text style={styles.mapIcon}>🗺️</Text>
          </View>
          <Text style={styles.mapTitle}>Ready to explore?</Text>
          <Text style={styles.mapSubtitle}>
            View your trip on an interactive map with turn-by-turn routing
          </Text>
          <TouchableOpacity onPress={handleViewMap} style={styles.viewMapButton}>
            <Text style={styles.viewMapButtonText}>🗺️ View Map</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F3EF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8B7355',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F3D2B',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#8B7355',
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#8B7355',
    marginBottom: 20,
  },
  errorButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  retryButton: {
    backgroundColor: '#2F6F6D',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#F4EBDC',
    fontSize: 16,
    fontWeight: '600',
  },
  demoButton: {
    backgroundColor: '#C45C2E',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  demoText: {
    color: '#F4EBDC',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#1F3D2B',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F3D2B',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  looksGoodButton: {
    backgroundColor: '#C45C2E',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  looksGoodText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  daySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 12,
  },
  arrowButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
  },
  arrowButtonDisabled: {
    opacity: 0.3,
  },
  arrowText: {
    fontSize: 24,
    color: '#1F3D2B',
  },
  arrowTextDisabled: {
    color: '#9CA3AF',
  },
  dayPills: {
    flexDirection: 'row',
    gap: 8,
  },
  dayPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  dayPillActive: {
    backgroundColor: '#1F3D2B',
  },
  dayPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  dayPillTextActive: {
    color: '#FFFFFF',
  },
  activitiesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  activitiesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F3D2B',
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  activitiesList: {
    marginBottom: 16,
  },
  mapCta: {
    backgroundColor: '#1F3D2B',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  mapIconCircle: {
    width: 64,
    height: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  mapIcon: {
    fontSize: 32,
  },
  mapTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  mapSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  viewMapButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  viewMapButtonText: {
    color: '#1F3D2B',
    fontWeight: '600',
    fontSize: 16,
  },
});
