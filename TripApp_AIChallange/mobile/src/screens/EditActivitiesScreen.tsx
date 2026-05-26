import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'EditActivities'>;

interface Activity {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
}

// Mock activities data
const mockActivities: Activity[] = [
  {
    id: '1',
    name: 'Morning Brew Coffee Co.',
    category: 'Coffee & Breakfast',
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
  },
  {
    id: '2',
    name: "Eagle's Nest Trail",
    category: 'Nature & Hiking',
    imageUrl: 'https://images.unsplash.com/photo-1551632811-1e0d58224f24?w=400',
  },
  {
    id: '3',
    name: "The Forager's Table",
    category: 'Lunch & Dining',
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
  },
  {
    id: '4',
    name: 'Watershed Gallery',
    category: 'Art & Culture',
    imageUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400',
  },
];

export default function EditActivitiesScreen({ navigation, route }: Props) {
  const { tripId, dayNumber } = route.params;
  const [activities, setActivities] = useState<Activity[]>(mockActivities);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activityName, setActivityName] = useState('');
  const [category, setCategory] = useState('');
  const [duration, setDuration] = useState('');
  const [cost, setCost] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');

  const handleClose = () => {
    navigation.goBack();
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
            setActivities(activities.filter(a => a.id !== activityId));
          },
        },
      ]
    );
  };

  const handleAddActivity = () => {
    setShowAddForm(true);
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
    setActivityName('');
    setCategory('');
    setDuration('');
    setCost('');
    setTime('');
    setDescription('');
  };

  const handleSaveActivity = () => {
    if (!activityName.trim()) {
      Alert.alert('Required', 'Please enter an activity name');
      return;
    }

    // TODO: Add activity to backend
    const newActivity: Activity = {
      id: Date.now().toString(),
      name: activityName,
      category: category || 'General',
      imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
    };

    setActivities([...activities, newActivity]);
    handleCancelAdd();
    Alert.alert('Success', 'Activity added to itinerary!');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Edit Day {dayNumber} Activities</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Add or remove activities from your itinerary.
          </Text>

          {/* Activities List */}
          <View style={styles.activitiesList}>
            {activities.map((activity) => (
              <View key={activity.id} style={styles.activityItem}>
                <View style={styles.activityLeft}>
                  <View style={styles.activityImageContainer}>
                    <Image
                      source={{ uri: activity.imageUrl }}
                      style={styles.activityImage}
                      resizeMode="cover"
                    />
                  </View>
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityName}>{activity.name}</Text>
                    <Text style={styles.activityCategory}>{activity.category}</Text>
                  </View>
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

          {/* Add Activity Button */}
          {!showAddForm && (
            <TouchableOpacity
              style={styles.addActivityButton}
              onPress={handleAddActivity}
              activeOpacity={0.7}
            >
              <Text style={styles.addActivityIcon}>+</Text>
              <Text style={styles.addActivityText}>Add Activity</Text>
            </TouchableOpacity>
          )}

          {/* Add New Activity Form */}
          {showAddForm && (
            <View style={styles.addForm}>
              <Text style={styles.formTitle}>Add New Activity</Text>

              {/* Activity Name */}
              <Text style={styles.label}>Activity Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Riverside Café"
                placeholderTextColor="#999"
                value={activityName}
                onChangeText={setActivityName}
              />

              {/* Category */}
              <Text style={styles.label}>Category *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Coffee & Breakfast"
                placeholderTextColor="#999"
                value={category}
                onChangeText={setCategory}
              />

              {/* Duration and Cost */}
              <View style={styles.rowInputs}>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>Duration</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., 1.5 hours"
                    placeholderTextColor="#999"
                    value={duration}
                    onChangeText={setDuration}
                  />
                </View>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>Cost</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., $25"
                    placeholderTextColor="#999"
                    value={cost}
                    onChangeText={setCost}
                  />
                </View>
              </View>

              {/* Time */}
              <Text style={styles.label}>Time</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 9:00 AM"
                placeholderTextColor="#999"
                value={time}
                onChangeText={setTime}
              />

              {/* Description */}
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="What makes this spot special?"
                placeholderTextColor="#999"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

              {/* Buttons */}
              <View style={styles.formButtons}>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={handleSaveActivity}
                  activeOpacity={0.8}
                >
                  <Text style={styles.addButtonIcon}>✓</Text>
                  <Text style={styles.addButtonText}>Add to Itinerary</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancelAdd}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1F3D2B',
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 16,
    marginBottom: 20,
  },
  activitiesList: {
    gap: 12,
    marginBottom: 20,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  activityImageContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#E5E5E5',
  },
  activityImage: {
    width: '100%',
    height: '100%',
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
  activityCategory: {
    fontSize: 14,
    color: '#666',
  },
  deleteButton: {
    padding: 8,
  },
  deleteIcon: {
    width: 20,
    height: 20,
    tintColor: '#DC2626',
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
    fontSize: 16,
    fontWeight: '600',
    color: '#1F3D2B',
  },
  addForm: {
    backgroundColor: '#F4EBDC',
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F3D2B',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F3D2B',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1F3D2B',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  textArea: {
    minHeight: 80,
    paddingTop: 12,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  addButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#D87C52',
    paddingVertical: 14,
    borderRadius: 12,
  },
  addButtonIcon: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cancelButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#1F3D2B',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F3D2B',
  },
});
