import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import Slider from '@react-native-community/slider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';
import DateTimePicker from '@react-native-community/datetimepicker';

type Props = NativeStackScreenProps<RootStackParamList, 'TripQuestionnaire'>;

interface LocationSuggestion {
  label: string;
  fullLabel: string;
  coordinates: number[];
  city: string;
  state: string;
  country: string;
}


const getIntensityLabel = (level: number): string => {
  const labels = {
    1: 'Very relaxed',
    2: 'Relaxed',
    3: 'Moderately packed',
    4: 'Packed',
    5: 'Very packed'
  };
  return labels[level as keyof typeof labels] || 'Moderate';
};

const getIntensityDescription = (level: number): string => {
  const descriptions = {
    1: '≤ 2 activities per day (very relaxed)',
    2: '2-3 activities per day (relaxed)',
    3: '3-4 activities per day (moderately packed)',
    4: '4-5 activities per day (packed)',
    5: '≥ 5 activities per day (very packed)'
  };
  return descriptions[level as keyof typeof descriptions] || '';
};

export default function TripQuestionnaireScreen({ navigation, route }: Props) {
  const { type } = route.params;

  const [destination, setDestination] = useState('');
  const [startingPoint, setStartingPoint] = useState('');
  const [endingPoint, setEndingPoint] = useState('');
  const [duration, setDuration] = useState('3');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)); // 3 days later
  const [budget, setBudget] = useState('500');
  const [intensity, setIntensity] = useState(3); // 1-5 scale
  const [travelWith, setTravelWith] = useState<'solo' | 'group'>('solo');
  const [includeGas, setIncludeGas] = useState(false);
  const [scenicRoute, setScenicRoute] = useState(true);
  const [includeTransport, setIncludeTransport] = useState(false);
  const [loading, setLoading] = useState(false);

  // Autocomplete states
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  const [showStartSuggestions, setShowStartSuggestions] = useState(false);
  const [showEndSuggestions, setShowEndSuggestions] = useState(false);
  const [destinationSuggestions, setDestinationSuggestions] = useState<LocationSuggestion[]>([]);
  const [startSuggestions, setStartSuggestions] = useState<LocationSuggestion[]>([]);
  const [endSuggestions, setEndSuggestions] = useState<LocationSuggestion[]>([]);
  const [searchingLocations, setSearchingLocations] = useState(false);

  // Date picker states
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // Debounce timer for location search
  let searchTimer: NodeJS.Timeout | null = null;

  // Search locations using AWS Location Service
  const searchLocations = async (query: string): Promise<LocationSuggestion[]> => {
    if (query.length < 2) return [];
    
    try {
      setSearchingLocations(true);
      const response = await api.get(`/location/search?query=${encodeURIComponent(query)}&maxResults=10`);
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error searching locations:', error);
      return [];
    } finally {
      setSearchingLocations(false);
    }
  };

  const handleDestinationChange = (text: string) => {
    setDestination(text);
    setShowDestinationSuggestions(true);
    
    if (searchTimer) clearTimeout(searchTimer);
    searchTimer = setTimeout(async () => {
      const results = await searchLocations(text);
      setDestinationSuggestions(results);
    }, 300);
  };

  const handleStartingPointChange = (text: string) => {
    setStartingPoint(text);
    setShowStartSuggestions(true);
    
    if (searchTimer) clearTimeout(searchTimer);
    searchTimer = setTimeout(async () => {
      const results = await searchLocations(text);
      setStartSuggestions(results);
    }, 300);
  };

  const handleEndingPointChange = (text: string) => {
    setEndingPoint(text);
    setShowEndSuggestions(true);
    
    if (searchTimer) clearTimeout(searchTimer);
    searchTimer = setTimeout(async () => {
      const results = await searchLocations(text);
      setEndSuggestions(results);
    }, 300);
  };

  const selectDestination = (location: LocationSuggestion) => {
    setDestination(location.label);
    setShowDestinationSuggestions(false);
  };

  const selectStartingPoint = (location: LocationSuggestion) => {
    setStartingPoint(location.label);
    setShowStartSuggestions(false);
  };

  const selectEndingPoint = (location: LocationSuggestion) => {
    setEndingPoint(location.label);
    setShowEndSuggestions(false);
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const onStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
      // Auto-update end date if it's before start date
      if (selectedDate > endDate) {
        const newEndDate = new Date(selectedDate);
        newEndDate.setDate(newEndDate.getDate() + parseInt(duration) || 3);
        setEndDate(newEndDate);
      }
    }
  };

  const onEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
      // Calculate duration
      const diffTime = Math.abs(selectedDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDuration(diffDays.toString());
    }
  };

  const handleGenerateTrip = async () => {
    // Validation
    if (type === 'location' && !destination) {
      Alert.alert('Missing Info', 'Please enter a destination');
      return;
    }
    if (type === 'roadtrip' && (!startingPoint || !endingPoint)) {
      Alert.alert('Missing Info', 'Please enter starting and ending points');
      return;
    }

    setLoading(true);

    try {
      // Get quiz results from AsyncStorage
      const quizResultsJson = await AsyncStorage.getItem('quiz_results');
      const interests = quizResultsJson ? JSON.parse(quizResultsJson) : [];

      // Build request payload
      const payload: any = {
        trip_type: type,
        duration: parseInt(duration) || 3,
        start_date: startDate.toISOString().split('T')[0], // Format: YYYY-MM-DD
        end_date: endDate.toISOString().split('T')[0],
        budget: parseInt(budget) || 500,
        intensity: intensity, // 1-5 scale as per PDF requirements
        group_type: travelWith,
        interests: interests, // Include quiz results for personalization
      };

      if (type === 'location') {
        payload.destination = destination;
        payload.include_transport = includeTransport;
      } else {
        payload.start_location = startingPoint;
        payload.end_location = endingPoint;
        payload.include_gas = includeGas;
        payload.scenic_route = scenicRoute;
      }

      console.log('Generating trip with payload:', payload);

      // Call AI backend to generate itinerary
      const response = await api.post('/ai/itinerary/generate', payload);

      if (response.success && response.data) {
        // Backend returns trip_id and full trip data
        const tripId = response.data.trip_id;
        
        console.log('Trip generated successfully:', tripId);
        
        // Navigate to preview with the real trip ID
        navigation.navigate('TripPreview', { tripId });
      } else {
        // Show error
        Alert.alert(
          'Generation Failed', 
          response.error || 'Failed to generate trip. Please try again.',
          [
            { text: 'OK', onPress: () => {} }
          ]
        );
      }
    } catch (error) {
      console.error('Error generating trip:', error);
      Alert.alert(
        'Error', 
        'Failed to generate trip. Please check your connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
          <Text style={styles.backText}>Trip Details</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>Tell us about your adventure</Text>
          <Text style={styles.subtitle}>
            We'll use these details to craft the perfect itinerary
          </Text>

          {/* Location Trip - Destination */}
          {type === 'location' && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Image
                  source={require('../../assets/images/location-pin-icon.png')}
                  style={styles.cardIcon}
                  resizeMode="contain"
                />
                <Text style={styles.cardTitle}>Destination</Text>
              </View>
              <TextInput
                style={styles.input}
                value={destination}
                onChangeText={handleDestinationChange}
                placeholder="e.g., New York City, NY"
                placeholderTextColor="#999"
                onFocus={() => {
                  if (destination.length >= 2) {
                    setShowDestinationSuggestions(true);
                  }
                }}
              />
              {showDestinationSuggestions && destinationSuggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  <View style={styles.suggestionsList}>
                    {destinationSuggestions.map((item) => (
                      <TouchableOpacity
                        key={item.fullLabel}
                        style={styles.suggestionItem}
                        onPress={() => selectDestination(item)}
                      >
                        <Image
                          source={require('../../assets/images/location-pin-icon.png')}
                          style={styles.suggestionIcon}
                          resizeMode="contain"
                        />
                        <Text style={styles.suggestionText}>{item.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
              <Text style={styles.helperText}>Select from popular destinations or type your own</Text>
            </View>
          )}

          {/* Road Trip - Starting and Ending Points */}
          {type === 'roadtrip' && (
            <>
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Image
                    source={require('../../assets/images/location-pin-icon.png')}
                    style={styles.cardIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.cardTitle}>Starting Point</Text>
                </View>
                <TextInput
                  style={styles.input}
                  value={startingPoint}
                  onChangeText={handleStartingPointChange}
                  placeholder="e.g., San Francisco, CA"
                  placeholderTextColor="#999"
                  onFocus={() => {
                    if (startingPoint.length >= 2) {
                      setShowStartSuggestions(true);
                    }
                  }}
                />
                {showStartSuggestions && startSuggestions.length > 0 && (
                  <View style={styles.suggestionsContainer}>
                    <View style={styles.suggestionsList}>
                      {startSuggestions.map((item) => (
                        <TouchableOpacity
                          key={item.fullLabel}
                          style={styles.suggestionItem}
                          onPress={() => selectStartingPoint(item)}
                        >
                          <Image
                            source={require('../../assets/images/location-pin-icon.png')}
                            style={styles.suggestionIcon}
                            resizeMode="contain"
                          />
                          <Text style={styles.suggestionText}>{item.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
              </View>

              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Image
                    source={require('../../assets/images/location-pin-icon.png')}
                    style={styles.cardIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.cardTitle}>Ending Point</Text>
                </View>
                <TextInput
                  style={styles.input}
                  value={endingPoint}
                  onChangeText={handleEndingPointChange}
                  placeholder="e.g., Los Angeles, CA"
                  placeholderTextColor="#999"
                  onFocus={() => {
                    if (endingPoint.length >= 2) {
                      setShowEndSuggestions(true);
                    }
                  }}
                />
                {showEndSuggestions && endSuggestions.length > 0 && (
                  <View style={styles.suggestionsContainer}>
                    <View style={styles.suggestionsList}>
                      {endSuggestions.map((item) => (
                        <TouchableOpacity
                          key={item.fullLabel}
                          style={styles.suggestionItem}
                          onPress={() => selectEndingPoint(item)}
                        >
                          <Image
                            source={require('../../assets/images/location-pin-icon.png')}
                            style={styles.suggestionIcon}
                            resizeMode="contain"
                          />
                          <Text style={styles.suggestionText}>{item.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            </>
          )}

          {/* Duration */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Duration (days)</Text>
            <TextInput
              style={styles.input}
              value={duration}
              onChangeText={setDuration}
              placeholder="3"
              placeholderTextColor="#999"
              keyboardType="number-pad"
            />
            <Text style={styles.helperText}>How many days will you be exploring?</Text>
          </View>

          {/* Trip Dates */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Trip Dates</Text>
            
            <Text style={styles.label}>Start Date</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => {
                setShowStartDatePicker(!showStartDatePicker);
                setShowEndDatePicker(false);
              }}
            >
              <Image
                source={require('../../assets/images/calendar-icon.png')}
                style={styles.dateIcon}
                resizeMode="contain"
              />
              <Text style={styles.dateText}>{formatDate(startDate)}</Text>
            </TouchableOpacity>
            
            {showStartDatePicker && (
              <View style={styles.datePickerDropdown}>
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display="inline"
                  onChange={onStartDateChange}
                  minimumDate={new Date()}
                  style={styles.inlineDatePicker}
                />
              </View>
            )}

            <Text style={styles.label}>End Date</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => {
                setShowEndDatePicker(!showEndDatePicker);
                setShowStartDatePicker(false);
              }}
            >
              <Image
                source={require('../../assets/images/calendar-icon.png')}
                style={styles.dateIcon}
                resizeMode="contain"
              />
              <Text style={styles.dateText}>{formatDate(endDate)}</Text>
            </TouchableOpacity>
            
            {showEndDatePicker && (
              <View style={styles.datePickerDropdown}>
                <DateTimePicker
                  value={endDate}
                  mode="date"
                  display="inline"
                  onChange={onEndDateChange}
                  minimumDate={startDate}
                  style={styles.inlineDatePicker}
                />
              </View>
            )}

            <Text style={styles.helperText}>
              Duration: {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} days
            </Text>
          </View>

          {/* Budget */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Budget ($)</Text>
            <TextInput
              style={styles.input}
              value={budget}
              onChangeText={setBudget}
              placeholder="500"
              placeholderTextColor="#999"
              keyboardType="number-pad"
            />
            <Text style={styles.helperText}>Total budget for the trip</Text>
          </View>

          {/* Activity Intensity Slider */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>How jam-packed do you want your days?</Text>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={5}
              step={1}
              value={intensity}
              onValueChange={setIntensity}
              minimumTrackTintColor="#2F6F6D"
              maximumTrackTintColor="#E5D4C1"
              thumbTintColor="#2F6F6D"
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>Very relaxed</Text>
              <Text style={styles.sliderLabelCenter}>
                Level {intensity}: {getIntensityLabel(intensity)}
              </Text>
              <Text style={styles.sliderLabel}>Very packed</Text>
            </View>
            <Text style={styles.helperText}>{getIntensityDescription(intensity)}</Text>
          </View>

          {/* Traveling With */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Traveling with...</Text>
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  travelWith === 'solo' && styles.toggleButtonActive,
                ]}
                onPress={() => setTravelWith('solo')}
                activeOpacity={0.8}
              >
                <Image
                  source={require('../../assets/images/user-icon.png')}
                  style={[
                    styles.toggleIcon,
                    travelWith === 'solo' && styles.toggleIconActive,
                  ]}
                  resizeMode="contain"
                />
                <Text
                  style={[
                    styles.toggleText,
                    travelWith === 'solo' && styles.toggleTextActive,
                  ]}
                >
                  Solo
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  travelWith === 'group' && styles.toggleButtonActive,
                ]}
                onPress={() => setTravelWith('group')}
                activeOpacity={0.8}
              >
                <Image
                  source={require('../../assets/images/group-icon.png')}
                  style={[
                    styles.toggleIcon,
                    travelWith === 'group' && styles.toggleIconActive,
                  ]}
                  resizeMode="contain"
                />
                <Text
                  style={[
                    styles.toggleText,
                    travelWith === 'group' && styles.toggleTextActive,
                  ]}
                >
                  Group
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Road Trip Preferences */}
          {type === 'roadtrip' && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Road Trip Preferences</Text>
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setIncludeGas(!includeGas)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, includeGas && styles.checkboxChecked]}>
                  {includeGas && <View style={styles.checkboxInner} />}
                </View>
                <Text style={styles.checkboxLabel}>Include gas costs in budget</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setScenicRoute(!scenicRoute)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, scenicRoute && styles.checkboxChecked]}>
                  {scenicRoute && <View style={styles.checkboxInner} />}
                </View>
                <Text style={styles.checkboxLabel}>Take the scenic route</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Location Trip Preferences */}
          {type === 'location' && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Trip Preferences</Text>
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setIncludeTransport(!includeTransport)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, includeTransport && styles.checkboxChecked]}>
                  {includeTransport && <View style={styles.checkboxInner} />}
                </View>
                <Text style={styles.checkboxLabel}>Include public transport costs in budget</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Bottom Buttons */}
          <View style={styles.bottomButtons}>
            <TouchableOpacity
              style={styles.backButtonBottom}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
              disabled={loading}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.generateButton, loading && styles.generateButtonDisabled]}
              onPress={handleGenerateTrip}
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text style={styles.generateButtonText}>Generating...</Text>
                </View>
              ) : (
                <Text style={styles.generateButtonText}>Generate My Trip</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardIcon: {
    width: 20,
    height: 20,
    tintColor: '#1F3D2B',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F3D2B',
    marginBottom: 12,
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
    paddingVertical: 14,
    fontSize: 15,
    color: '#333',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sliderLabel: {
    fontSize: 12,
    color: '#666',
  },
  sliderLabelCenter: {
    fontSize: 14,
    color: '#1F3D2B',
    fontWeight: '600',
  },
  toggleContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  toggleButtonActive: {
    backgroundColor: '#1F3D2B',
    borderColor: '#1F3D2B',
  },
  toggleIcon: {
    width: 20,
    height: 20,
    tintColor: '#1F3D2B',
  },
  toggleIconActive: {
    tintColor: '#FFFFFF',
  },
  toggleText: {
    fontSize: 15,
    color: '#1F3D2B',
    fontWeight: '500',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#1F3D2B',
    borderColor: '#1F3D2B',
  },
  checkboxInner: {
    width: 10,
    height: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#1F3D2B',
  },
  bottomButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 40,
  },
  backButtonBottom: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#1F3D2B',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#1F3D2B',
    fontSize: 16,
    fontWeight: '500',
  },
  generateButton: {
    flex: 1,
    backgroundColor: '#1F3D2B',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  suggestionsContainer: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    maxHeight: 200,
    overflow: 'hidden',
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  suggestionIcon: {
    width: 16,
    height: 16,
    tintColor: '#666',
  },
  suggestionText: {
    fontSize: 14,
    color: '#333',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  dateIcon: {
    width: 20,
    height: 20,
    tintColor: '#1F3D2B',
  },
  dateText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  datePickerDropdown: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  inlineDatePicker: {
    width: '100%',
    backgroundColor: '#FFFFFF',
  },
});
