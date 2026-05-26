import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
  SafeAreaView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'TravelDiary'>;

interface DiaryPhoto {
  id: string;
  uri: string;
  dayNumber: number;
}

interface DiaryEntry {
  id: string;
  dayNumber: number;
  date: string;
  notes: string;
  photos: DiaryPhoto[];
}

// Mock previous entries
const mockPreviousEntries: DiaryEntry[] = [
  {
    id: '1',
    dayNumber: 1,
    date: 'Mar 15, 2026',
    notes: "The Eagle's Nest Trail was absolutely worth it! Met a local who recommended a secret viewpoint off the main path. The coffee at Morning Brew is as good as advertised.",
    photos: [
      { id: '1', uri: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800', dayNumber: 1 },
      { id: '2', uri: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800', dayNumber: 1 },
    ],
  },
];

export default function TravelDiaryScreen({ navigation, route }: Props) {
  const { tripId } = route.params;
  const [selectedDay, setSelectedDay] = useState(1);
  const [notes, setNotes] = useState('');
  const [uploadedPhotos, setUploadedPhotos] = useState<DiaryPhoto[]>([]);

  const totalDays = 3; // TODO: Get from trip data using tripId

  const handleUploadPhotos = () => {
    // TODO: Implement photo picker
    Alert.alert('Upload Photos', 'Photo picker will be implemented here');
  };

  const handleTakePhoto = () => {
    // TODO: Implement camera
    Alert.alert('Take Photo', 'Camera will be implemented here');
  };

  const handleSaveEntry = () => {
    if (!notes.trim() && uploadedPhotos.length === 0) {
      Alert.alert('Empty Entry', 'Please add some notes or photos before saving.');
      return;
    }

    // TODO: Save to backend
    Alert.alert('Entry Saved', 'Your travel diary entry has been saved!');
    setNotes('');
    setUploadedPhotos([]);
  };

  const handleClose = () => {
    navigation.goBack();
  };

  const currentDayEntries = mockPreviousEntries.filter((entry) => entry.dayNumber === selectedDay);

  return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Travel Diary</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Day Selector */}
            <Text style={styles.sectionLabel}>Viewing</Text>
            <View style={styles.daySelector}>
              {Array.from({ length: totalDays }, (_, i) => i + 1).map((day) => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayButton,
                    selectedDay === day && styles.dayButtonActive,
                  ]}
                  onPress={() => setSelectedDay(day)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.dayButtonText,
                      selectedDay === day && styles.dayButtonTextActive,
                    ]}
                  >
                    Day {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Photos Upload Section */}
            <Text style={styles.sectionLabel}>Day {selectedDay} Photos</Text>
            <TouchableOpacity
              style={styles.uploadBox}
              onPress={handleUploadPhotos}
              activeOpacity={0.7}
            >
              <Image
                source={require('../../assets/images/upload-icon.png')}
                style={styles.uploadIcon}
                resizeMode="contain"
              />
              <Text style={styles.uploadText}>Tap to upload photos</Text>
            </TouchableOpacity>

            {/* Notes & Memories Section */}
            <Text style={styles.sectionLabel}>Notes & Memories</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Jot down your favorite moments, hidden gems you discovered, or tips for future travelers..."
              placeholderTextColor="#999"
              value={notes}
              onChangeText={setNotes}
              multiline
              textAlignVertical="top"
            />

            {/* Previous Entries Section */}
            {currentDayEntries.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>Previous Entries</Text>
                {currentDayEntries.map((entry) => (
                  <View key={entry.id} style={styles.entryCard}>
                    <View style={styles.entryHeader}>
                      <Image
                        source={require('../../assets/images/camera-icon.png')}
                        style={styles.entryIcon}
                        resizeMode="contain"
                      />
                      <Text style={styles.entryTitle}>Day {entry.dayNumber} Entry</Text>
                    </View>
                    <Text style={styles.entryNotes}>{entry.notes}</Text>

                    {/* Entry Photos */}
                    {entry.photos.length > 0 && (
                      <View style={styles.entryPhotos}>
                        {entry.photos.map((photo) => (
                          <View key={photo.id} style={styles.entryPhotoPlaceholder}>
                            <Image
                              source={require('../../assets/images/camera-icon.png')}
                              style={styles.entryPhotoIcon}
                              resizeMode="contain"
                            />
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                ))}
              </>
            )}
          </View>
        </ScrollView>

        {/* Save Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveEntry}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>Save Entry</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    paddingBottom: 20,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1F3D2B',
    marginBottom: 12,
    marginTop: 8,
  },
  daySelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  dayButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
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
  uploadBox: {
    backgroundColor: '#E5D4C1',
    borderRadius: 16,
    paddingVertical: 60,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#D4C3B0',
    borderStyle: 'dashed',
  },
  uploadIcon: {
    width: 48,
    height: 48,
    tintColor: '#8B7355',
    marginBottom: 12,
  },
  uploadText: {
    fontSize: 15,
    color: '#8B7355',
    fontWeight: '500',
  },
  notesInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    color: '#1F3D2B',
    minHeight: 140,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E5E5',
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
  entryIcon: {
    width: 20,
    height: 20,
    tintColor: '#8B7355',
  },
  entryTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F3D2B',
  },
  entryNotes: {
    fontSize: 14,
    color: '#1F3D2B',
    lineHeight: 20,
    marginBottom: 12,
  },
  entryPhotos: {
    flexDirection: 'row',
    gap: 12,
  },
  entryPhotoPlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#D4C3B0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  entryPhotoIcon: {
    width: 32,
    height: 32,
    tintColor: '#8B7355',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F4EBDC',
  },
  saveButton: {
    backgroundColor: '#1F3D2B',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
