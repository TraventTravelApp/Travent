import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'TripMemories'>;

interface DiaryEntry {
  id: string;
  day: number;
  timeOfDay: string;
  text: string;
  photoCount: number;
}

// Mock data
const mockTripData = {
  tripId: '1',
  name: 'Pacific Coast Highway',
  location: 'California',
  dates: 'Mar 15-18, 2026',
  heroImage: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=800',
};

const mockDiaryEntries: DiaryEntry[] = [
  {
    id: '1',
    day: 1,
    timeOfDay: 'Morning',
    text: '"Started the day at this incredible local coffee shop overlooking the ocean. The barista recommended a secret beach spot that wasn\'t crowded at all!"',
    photoCount: 3,
  },
  {
    id: '2',
    day: 2,
    timeOfDay: 'Afternoon',
    text: '"Best hike of my life! The hidden viewpoint was absolutely worth the extra mile off the main trail."',
    photoCount: 3,
  },
];

export default function TripMemoriesScreen({ navigation, route }: Props) {
  const { tripId } = route.params;

  const handleClose = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trip Memories</Text>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Hero Image */}
          <View style={styles.heroImageContainer}>
            <Image
              source={{ uri: mockTripData.heroImage }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          </View>

          {/* Trip Info */}
          <Text style={styles.tripName}>{mockTripData.name}</Text>
          <Text style={styles.tripDetails}>
            {mockTripData.location} • {mockTripData.dates}
          </Text>

          {/* Diary Entries Section */}
          <Text style={styles.sectionTitle}>Travel Diary Entries</Text>

          {/* Diary Entry Cards */}
          {mockDiaryEntries.map((entry) => (
            <View key={entry.id} style={styles.entryCard}>
              <View style={styles.entryHeader}>
                <Image
                  source={require('../../assets/images/camera-brown-icon.png')}
                  style={styles.entryHeaderIcon}
                  resizeMode="contain"
                />
                <Text style={styles.entryHeaderText}>
                  Day {entry.day} • {entry.timeOfDay}
                </Text>
              </View>

              <Text style={styles.entryText}>{entry.text}</Text>

              {/* Photo Placeholders */}
              <View style={styles.photosContainer}>
                {Array.from({ length: entry.photoCount }).map((_, index) => (
                  <View key={index} style={styles.photoPlaceholder}>
                    <Image
                      source={require('../../assets/images/camera-gray-icon.png')}
                      style={styles.photoPlaceholderIcon}
                      resizeMode="contain"
                    />
                  </View>
                ))}
              </View>
            </View>
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#F4EBDC',
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
  heroImageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  tripName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F3D2B',
    marginBottom: 8,
  },
  tripDetails: {
    fontSize: 15,
    color: '#666',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F3D2B',
    marginBottom: 16,
  },
  entryCard: {
    backgroundColor: '#E5D4C1',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  entryHeaderIcon: {
    width: 20,
    height: 20,
  },
  entryHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B7355',
  },
  entryText: {
    fontSize: 15,
    color: '#1F3D2B',
    lineHeight: 22,
    marginBottom: 16,
  },
  photosContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  photoPlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#D4C3B0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderIcon: {
    width: 32,
    height: 32,
    tintColor: '#8B7355',
  },
});
