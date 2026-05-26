import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import ActivityCard, { Activity } from '../components/trip/ActivityCard';
import DaySummary from '../components/trip/DaySummary';

type Props = NativeStackScreenProps<RootStackParamList, 'TripDayListView'>;

// Mock trip data
const mockTripData = {
  tripId: 'trip-demo-123',
  tripName: 'Pacific Coast Trip',
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
          description:
            'Cozy café with artisanal pastries and locally roasted coffee. Hidden gem recommended by locals.',
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
          description:
            'Moderate hike with panoramic valley views. Best at golden hour, rarely crowded on weekdays.',
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
          description:
            'Farm-to-table restaurant featuring seasonal ingredients from local farms. Try the wild mushroom risotto.',
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
          description:
            'Contemporary art space showcasing regional artists. Intimate setting with rotating exhibitions.',
          image: 'https://images.unsplash.com/photo-1564399579883-451a5d44ec08?w=800',
          tags: ['Community Favorite'],
          duration: '1 hour',
          cost: 12,
          rating: 78,
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
          description: 'Early morning coffee spot with fresh pastries and river views.',
          image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800',
          tags: ['Local Pick'],
          duration: '45 minutes',
          cost: 12,
          rating: 85,
        },
        {
          id: '2',
          stepNumber: 2,
          time: '10:00 AM',
          category: 'Nature & Parks',
          name: 'Riverside Trail',
          description: 'Scenic waterfront with walking paths and wildlife spotting.',
          image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800',
          tags: ['Hidden Gem', 'Low Crowd'],
          duration: '2 hours',
          cost: 'Free',
          rating: 90,
        },
        {
          id: '3',
          stepNumber: 3,
          time: '1:00 PM',
          category: 'Lunch & Dining',
          name: 'Harbor Market Kitchen',
          description: 'Fresh seafood market with prepared meals and local specialties.',
          image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
          tags: ['Local Love'],
          duration: '1.5 hours',
          cost: 28,
          rating: 88,
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
        {
          id: '2',
          stepNumber: 2,
          time: '12:30 PM',
          category: 'Lunch & Dining',
          name: 'Market Street Deli',
          description: 'Classic deli with homemade sandwiches and local ingredients.',
          image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
          tags: ['Local Pick'],
          duration: '1 hour',
          cost: 18,
          rating: 82,
        },
      ],
    },
  ],
};

export default function TripDayListViewScreen({ navigation, route }: Props) {
  const { tripId } = route.params;
  const [currentDay, setCurrentDay] = useState(1);

  const tripData = mockTripData;
  const currentDayData = tripData.days.find((d) => d.dayNumber === currentDay) || tripData.days[0];

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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>{tripData.tripName}</Text>
            <Text style={styles.headerSubtitle}>
              Day {currentDay} of {tripData.totalDays}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Day Selector */}
        <View style={styles.daySelector}>
          <TouchableOpacity
            onPress={handlePreviousDay}
            disabled={currentDay === 1}
            style={[styles.arrowButton, currentDay === 1 && styles.arrowButtonDisabled]}
          >
            <Text style={[styles.arrowText, currentDay === 1 && styles.arrowTextDisabled]}>‹</Text>
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
          duration={currentDayData.duration}
          estimatedCost={currentDayData.estimatedCost}
          activityCount={currentDayData.activities.length}
        />

        {/* Activities Header */}
        <View style={styles.activitiesHeader}>
          <Text style={styles.activitiesTitle}>Day {currentDay} Activities</Text>
        </View>

        {/* Activities List */}
        <View style={styles.activitiesList}>
          {currentDayData.activities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
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
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F3D2B',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  daySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    gap: 12,
  },
  arrowButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  arrowButtonDisabled: {
    opacity: 0.3,
  },
  arrowText: {
    fontSize: 24,
    color: '#1F3D2B',
    fontWeight: '600',
  },
  arrowTextDisabled: {
    color: '#999',
  },
  dayPills: {
    flexDirection: 'row',
    gap: 8,
  },
  dayPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  dayPillActive: {
    backgroundColor: '#1F3D2B',
    borderColor: '#1F3D2B',
  },
  dayPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F3D2B',
  },
  dayPillTextActive: {
    color: '#FFFFFF',
  },
  activitiesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  activitiesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F3D2B',
  },
  activitiesList: {
    paddingHorizontal: 20,
    gap: 16,
  },
});
