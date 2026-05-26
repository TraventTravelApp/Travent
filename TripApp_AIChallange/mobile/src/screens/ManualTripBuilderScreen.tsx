import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'ManualTripBuilder'>;

interface DayActivity {
  id: string;
  name: string;
  time: string;
  duration: string;
  cost: string;
  category: string;
}

interface TripDay {
  dayNumber: number;
  activities: DayActivity[];
}

export default function ManualTripBuilderScreen({ navigation }: Props) {
  const [tripName, setTripName] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [numberOfDays, setNumberOfDays] = useState('3');
  const [days, setDays] = useState<TripDay[]>([
    { dayNumber: 1, activities: [] },
    { dayNumber: 2, activities: [] },
    { dayNumber: 3, activities: [] },
  ]);
  const [currentDay, setCurrentDay] = useState(1);
  const [showAddActivity, setShowAddActivity] = useState(false);

  // New activity form fields
  const [activityName, setActivityName] = useState('');
  const [activityTime, setActivityTime] = useState('');
  const [activityDuration, setActivityDuration] = useState('');
  const [activityCost, setActivityCost] = useState('');
  const [activityCategory, setActivityCategory] = useState('');

  const handleAddActivity = () => {
    setShowAddActivity(true);
  };

  const handleSaveActivity = () => {
    if (!activityName.trim()) {
      Alert.alert('Required', 'Please enter an activity name');
      return;
    }

    const newActivity: DayActivity = {
      id: Date.now().toString(),
      name: activityName,
      time: activityTime,
      duration: activityDuration,
      cost: activityCost,
      category: activityCategory || 'General',
    };

    setDays(days.map(day =>
      day.dayNumber === currentDay
        ? { ...day, activities: [...day.activities, newActivity] }
        : day
    ));

    // Reset form
    setActivityName('');
    setActivityTime('');
    setActivityDuration('');
    setActivityCost('');
    setActivityCategory('');
    setShowAddActivity(false);
  };

  const handleCancelActivity = () => {
    setActivityName('');
    setActivityTime('');
    setActivityDuration('');
    setActivityCost('');
    setActivityCategory('');
    setShowAddActivity(false);
  };

  const handleDeleteActivity = (activityId: string) => {
    Alert.alert(
      'Remove Activity',
      'Are you sure you want to remove this activity?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setDays(days.map(day =>
              day.dayNumber === currentDay
                ? { ...day, activities: day.activities.filter(a => a.id !== activityId) }
                : day
            ));
          },
        },
      ]
    );
  };

  const handleCreateTrip = () => {
    if (!tripName.trim()) {
      Alert.alert('Required', 'Please enter a trip name');
      return;
    }
    if (!destination.trim()) {
      Alert.alert('Required', 'Please enter a destination');
      return;
    }

    // TODO: Save trip to backend
    const tripId = `manual-trip-${Date.now()}`;
    navigation.navigate('TripPreview', { tripId });
  };

  const currentDayData = days.find(d => d.dayNumber === currentDay);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
          <Text style={styles.backText}>Build Manually</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>Build your trip from scratch</Text>
          <Text style={styles.subtitle}>
            Add trip details and plan activities day by day
          </Text>

          {/* Trip Details Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Trip Details</Text>

            <Text style={styles.label}>Trip Name *</Text>
            <TextInput
              style={styles.input}
              value={tripName}
              onChangeText={setTripName}
              placeholder="e.g., Weekend in Portland"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Destination *</Text>
            <TextInput
              style={styles.input}
              value={destination}
              onChangeText={setDestination}
              placeholder="e.g., Portland, OR"
              placeholderTextColor="#999"
            />

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Start Date</Text>
                <TextInput
                  style={styles.input}
                  value={startDate}
                  onChangeText={setStartDate}
                  placeholder="Mar 15, 2026"
                  placeholderTextColor="#999"
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.label}>End Date</Text>
                <TextInput
                  style={styles.input}
                  value={endDate}
                  onChangeText={setEndDate}
                  placeholder="Mar 18, 2026"
                  placeholderTextColor="#999"
                />
              </View>
            </View>
          </View>

          {/* Day Selector */}
          <View style={styles.daySelector}>
            <Text style={styles.daySelectorTitle}>Plan by Day</Text>
            <View style={styles.dayPills}>
              {days.map((day) => (
                <TouchableOpacity
                  key={day.dayNumber}
                  style={[
                    styles.dayPill,
                    currentDay === day.dayNumber && styles.dayPillActive,
                  ]}
                  onPress={() => setCurrentDay(day.dayNumber)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.dayPillText,
                      currentDay === day.dayNumber && styles.dayPillTextActive,
                    ]}
                  >
                    Day {day.dayNumber}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Activities List */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Day {currentDay} Activities</Text>

            {currentDayData && currentDayData.activities.length > 0 ? (
              <View style={styles.activitiesList}>
                {currentDayData.activities.map((activity) => (
                  <View key={activity.id} style={styles.activityItem}>
                    <View style={styles.activityInfo}>
                      <Text style={styles.activityName}>{activity.name}</Text>
                      {activity.time && (
                        <Text style={styles.activityDetail}>⏰ {activity.time}</Text>
                      )}
                      {activity.category && (
                        <Text style={styles.activityDetail}>📍 {activity.category}</Text>
                      )}
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeleteActivity(activity.id)}
                      style={styles.deleteButton}
                      activeOpacity={0.7}
                    >
                      <Image
                        source={require('../../assets/images/trash-icon.png')}
                        style={styles.deleteIcon}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyText}>
                No activities added yet. Tap "Add Activity" to start planning.
              </Text>
            )}

            {/* Add Activity Button */}
            {!showAddActivity && (
              <TouchableOpacity
                style={styles.addActivityButton}
                onPress={handleAddActivity}
                activeOpacity={0.7}
              >
                <Text style={styles.addActivityIcon}>+</Text>
                <Text style={styles.addActivityText}>Add Activity</Text>
              </TouchableOpacity>
            )}

            {/* Add Activity Form */}
            {showAddActivity && (
              <View style={styles.addForm}>
                <Text style={styles.formTitle}>Add New Activity</Text>

                <Text style={styles.label}>Activity Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Visit Powell's Books"
                  placeholderTextColor="#999"
                  value={activityName}
                  onChangeText={setActivityName}
                />

                <Text style={styles.label}>Category</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Shopping, Food, Nature"
                  placeholderTextColor="#999"
                  value={activityCategory}
                  onChangeText={setActivityCategory}
                />

                <View style={styles.row}>
                  <View style={styles.halfInput}>
                    <Text style={styles.label}>Time</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="10:00 AM"
                      placeholderTextColor="#999"
                      value={activityTime}
                      onChangeText={setActivityTime}
                    />
                  </View>
                  <View style={styles.halfInput}>
                    <Text style={styles.label}>Duration</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="2 hours"
                      placeholderTextColor="#999"
                      value={activityDuration}
                      onChangeText={setActivityDuration}
                    />
                  </View>
                </View>

                <Text style={styles.label}>Estimated Cost</Text>
                <TextInput
                  style={styles.input}
                  placeholder="$25"
                  placeholderTextColor="#999"
                  value={activityCost}
                  onChangeText={setActivityCost}
                />

                <View style={styles.formButtons}>
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSaveActivity}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.saveButtonText}>Add to Day {currentDay}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleCancelActivity}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Create Trip Button */}
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateTrip}
            activeOpacity={0.8}
          >
            <Text style={styles.createButtonText}>Create Trip</Text>
          </TouchableOpacity>
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
    backgroundColor: '#F4EBDC',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backIcon: {
    fontSize: 24,
    color: '#1F3D2B',
  },
  backText: {
    fontSize: 18,
    color: '#1F3D2B',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    color: '#1F3D2B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F3D2B',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F3D2B',
    marginTop: 12,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  daySelector: {
    marginBottom: 16,
  },
  daySelectorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F3D2B',
    marginBottom: 12,
  },
  dayPills: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  dayPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
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
  activitiesList: {
    gap: 12,
    marginBottom: 16,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
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
  activityDetail: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  deleteButton: {
    padding: 4,
  },
  deleteIcon: {
    width: 20,
    height: 20,
    tintColor: '#DC2626',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 24,
    fontStyle: 'italic',
  },
  addActivityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#1F3D2B',
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
  },
  addActivityIcon: {
    fontSize: 18,
    color: '#1F3D2B',
    fontWeight: '600',
  },
  addActivityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F3D2B',
  },
  addForm: {
    backgroundColor: '#F4EBDC',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F3D2B',
    marginBottom: 12,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#6B9080',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#1F3D2B',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F3D2B',
  },
  createButton: {
    backgroundColor: '#1F3D2B',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 40,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
