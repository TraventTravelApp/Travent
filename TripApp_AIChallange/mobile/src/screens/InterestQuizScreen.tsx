import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'InterestQuiz'>;

const { width } = Dimensions.get('window');

interface Interest {
  id: string;
  label: string;
  icon: any;
}

const INTERESTS: Interest[] = [
  { id: 'adventure', label: 'Adventure', icon: require('../../assets/images/icons/mountain.png') },
  { id: 'food', label: 'Food & Dining', icon: require('../../assets/images/icons/food.png') },
  { id: 'nature', label: 'Nature', icon: require('../../assets/images/icons/tree.png') },
  { id: 'art', label: 'Art & Culture', icon: require('../../assets/images/icons/paint.png') },
  { id: 'photography', label: 'Photography', icon: require('../../assets/images/icons/camera.png') },
  { id: 'music', label: 'Music', icon: require('../../assets/images/icons/music.png') },
  { id: 'reading', label: 'Reading Spots', icon: require('../../assets/images/icons/book.png') },
  { id: 'coffee', label: 'Coffee Shops', icon: require('../../assets/images/icons/coffee.png') },
  { id: 'water', label: 'Water Activities', icon: require('../../assets/images/icons/water.png') },
  { id: 'camping', label: 'Camping', icon: require('../../assets/images/icons/camping.png') },
  { id: 'hiking', label: 'Hiking', icon: require('../../assets/images/icons/Icon.png') },
  { id: 'local', label: 'Local Gems', icon: require('../../assets/images/icons/map.png') },
  { id: 'thrifting', label: 'Thrifting', icon: require('../../assets/images/icons/map.png') }, // TODO: Add thrifting-specific icon
];

const MIN_SELECTIONS = 3;
const MAX_SELECTIONS = 5;

export default function InterestQuizScreen({ navigation }: Props) {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleInterestPress = (id: string) => {
    if (selectedInterests.includes(id)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== id));
    } else if (selectedInterests.length < MAX_SELECTIONS) {
      setSelectedInterests([...selectedInterests, id]);
    }
  };

  const handleContinue = async () => {
    if (selectedInterests.length >= MIN_SELECTIONS) {
      setLoading(true);

      try {
        // Save to AsyncStorage for immediate use
        await AsyncStorage.setItem('quiz_results', JSON.stringify(selectedInterests));

        // Try to save to backend (will work after deployment)
        try {
          await api.post('/quiz/submit', { interests: selectedInterests });
        } catch (backendError) {
          // Backend not deployed yet - that's okay, we have it in AsyncStorage
          console.log('Quiz results saved locally, backend not yet connected');
        }

        navigation.navigate('Signup');
      } catch (error) {
        console.error('Failed to save quiz results:', error);
        // Still navigate even if save fails
        navigation.navigate('Signup');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>What sparks your wanderlust?</Text>
          <Text style={styles.subtitle}>
            Select 3-5 interests to personalize your adventures
          </Text>
        </View>

        {/* Interest Grid */}
        <View style={styles.grid}>
          {INTERESTS.map((interest) => {
            const isSelected = selectedInterests.includes(interest.id);
            return (
              <TouchableOpacity
                key={interest.id}
                style={[
                  styles.card,
                  isSelected && styles.cardSelected,
                ]}
                onPress={() => handleInterestPress(interest.id)}
                activeOpacity={0.7}
              >
                <Image
                  source={interest.icon}
                  style={[
                    styles.icon,
                    isSelected && styles.iconSelected,
                  ]}
                  resizeMode="contain"
                />
                <Text style={[
                  styles.label,
                  isSelected && styles.labelSelected,
                ]}>
                  {interest.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[
            styles.continueButton,
            (selectedInterests.length < MIN_SELECTIONS || loading) && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={selectedInterests.length < MIN_SELECTIONS || loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#F4EBDC" />
          ) : (
            <Text style={styles.continueButtonText}>Continue to My Trips</Text>
          )}
        </TouchableOpacity>

        {/* Quote */}
        <Text style={styles.quote}>
          "Not all who wander are lost, but some find better coffee."
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4EBDC',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F3D2B',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#1F3D2B',
    textAlign: 'center',
    opacity: 0.7,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  card: {
    width: (width - 48 - 16) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    minHeight: 120,
  },
  cardSelected: {
    backgroundColor: '#1F3D2B',
  },
  icon: {
    width: 40,
    height: 40,
    marginBottom: 12,
    tintColor: '#1F3D2B',
  },
  iconSelected: {
    tintColor: '#FFFFFF',
  },
  label: {
    fontSize: 14,
    color: '#1F3D2B',
    textAlign: 'center',
    fontWeight: '500',
  },
  labelSelected: {
    color: '#FFFFFF',
  },
  continueButton: {
    backgroundColor: '#8A9484',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 20,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  quote: {
    fontSize: 12,
    color: '#1F3D2B',
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.6,
  },
});
