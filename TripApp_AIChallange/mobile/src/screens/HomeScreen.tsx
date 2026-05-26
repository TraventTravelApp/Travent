import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Platform,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

interface Trip {
  id: string;
  title: string;
  location: string;
  dates: string;
  budget: string;
  image: any;
  status: string;
}

export default function HomeScreen({ navigation }: Props) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [startDateText, setStartDateText] = useState('Mar 15, 2026');
  const [endDateText, setEndDateText] = useState('Mar 18, 2026');

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const response = await api.get('/trips');
      
      if (response.success && response.data) {
        // Transform backend data to UI format
        const formattedTrips = response.data.map((trip: any) => ({
          id: trip.trip_id,
          title: trip.title || trip.destination || 'Untitled Trip',
          location: trip.destination || trip.location || 'Unknown',
          dates: formatDates(trip.start_date, trip.end_date),
          budget: `$${trip.budget || 0} budget`,
          image: require('../../assets/images/trip-placeholder.png'),
          status: getStatus(trip.start_date),
        }));
        setTrips(formattedTrips);
      }
    } catch (error) {
      console.error('Error fetching trips:', error);
      Alert.alert('Error', 'Failed to load trips. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDates = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return 'Dates TBD';
    
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
      const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
      const startDay = start.getDate();
      const endDay = end.getDate();
      const year = start.getFullYear();
      
      if (startMonth === endMonth) {
        return `${startMonth} ${startDay}-${endDay}, ${year}`;
      }
      return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
    } catch {
      return 'Dates TBD';
    }
  };

  const getStatus = (startDate: string) => {
    if (!startDate) return 'Planning';
    
    try {
      const start = new Date(startDate);
      const now = new Date();
      
      if (start > now) return 'Upcoming';
      if (start < now) return 'Past';
      return 'In Progress';
    } catch {
      return 'Planning';
    }
  };

  const handleMenuToggle = (tripId: string, event: any) => {
    event.stopPropagation();
    setOpenMenuId(openMenuId === tripId ? null : tripId);
  };

  const handleEditTrip = (tripId: string) => {
    setOpenMenuId(null);
    navigation.navigate('TripListView', { tripId });
  };

  const handleChangeDate = (tripId: string) => {
    setOpenMenuId(null);
    setSelectedTripId(tripId);
    setShowDatePicker(true);
  };

  const handleSaveDates = async () => {
    if (!selectedTripId) return;
    
    try {
      // TODO: Parse dates and update backend
      setShowDatePicker(false);
      Alert.alert(
        'Dates Updated',
        `Trip dates changed to ${startDateText} - ${endDateText}`
      );
      fetchTrips(); // Refresh trips
    } catch (error) {
      Alert.alert('Error', 'Failed to update dates');
    }
  };

  const handleCancelDatePicker = () => {
    setShowDatePicker(false);
    setSelectedTripId(null);
  };

  const handleReminisce = (tripId: string) => {
    setOpenMenuId(null);
    navigation.navigate('TripMemories', { tripId });
  };

  const handleDeleteTrip = (tripId: string) => {
    setOpenMenuId(null);
    Alert.alert(
      'Delete Trip',
      'Are you sure you want to delete this trip? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await api.delete(`/trips/${tripId}`);
              if (response.success) {
                Alert.alert('Trip Deleted', 'Your trip has been deleted.');
                fetchTrips(); // Refresh trips
              } else {
                Alert.alert('Error', response.error || 'Failed to delete trip');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete trip');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="rgba(255, 255, 255, 0.5)" translucent={false} />
      {/* Header */}
      <View style={styles.headerContainer}>
        <SafeAreaView>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
          <Image
            source={require('../../assets/images/map-icon.png')}
            style={styles.mapIcon}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.logoText}>Chronicle</Text>
            <Text style={styles.taglineText}>Travel like a local</Text>
            </View>
          </View>
            <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Friends')}
            activeOpacity={0.7}
          >
            <Image
              source={require('../../assets/images/friends-icon.png')}
              style={styles.friendsIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.7}
          >
            <Image
              source={require('../../assets/images/profile-icon.png')}
              style={styles.profileIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* My Trips Section */}
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>My Trips</Text>
          <Text style={styles.sectionSubtitle}>
            Your curated collection of hidden{'\n'}weekend escapes
          </Text>

          {/* Start New Trip Button */}
          <TouchableOpacity
            style={styles.newTripButton}
            onPress={() => navigation.navigate('NewTrip')}
            activeOpacity={0.8}
          >
            <Text style={styles.newTripText}>+ Start New Trip</Text>
          </TouchableOpacity>

          {/* Trip Cards */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1F3D2B" />
              <Text style={styles.loadingText}>Loading your trips...</Text>
            </View>
          ) : trips.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No trips yet!</Text>
              <Text style={styles.emptySubtext}>
                Start planning your next adventure
              </Text>
            </View>
          ) : (
            trips.map((trip) => (
            <TouchableOpacity
              key={trip.id}
              style={styles.tripCard}
              onPress={() => navigation.navigate('TripRouteView', { tripId: trip.id })}
              activeOpacity={0.9}
            >
              {/* Trip Image */}
              <View style={styles.tripImageContainer}>
                <Image
                  source={trip.image}
                  style={styles.tripImage}
                  resizeMode="cover"
                />
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{trip.status}</Text>
                </View>
                <TouchableOpacity
                  style={styles.tripMenuButton}
                  activeOpacity={0.7}
                  onPress={(e) => handleMenuToggle(trip.id, e)}
                >
                  <View style={styles.menuDot} />
                  <View style={styles.menuDot} />
                  <View style={styles.menuDot} />
                </TouchableOpacity>

                {/* Dropdown Menu */}
                {openMenuId === trip.id && (
                  <View style={styles.dropdownMenu}>
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => handleEditTrip(trip.id)}
                      activeOpacity={0.7}
                    >
                      <Image
                        source={require('../../assets/images/edit-icon.png')}
                        style={styles.menuIcon}
                        resizeMode="contain"
                      />
                      <Text style={styles.menuItemText}>Edit Trip</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => handleChangeDate(trip.id)}
                      activeOpacity={0.7}
                    >
                      <Image
                        source={require('../../assets/images/calendar-icon.png')}
                        style={styles.menuIcon}
                        resizeMode="contain"
                      />
                      <Text style={styles.menuItemText}>Change Date</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => handleReminisce(trip.id)}
                      activeOpacity={0.7}
                    >
                      <Image
                        source={require('../../assets/images/camera2-icon.png')}
                        style={styles.menuIcon}
                        resizeMode="contain"
                      />
                      <Text style={styles.menuItemText}>Reminisce</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.menuItem, styles.menuItemLast]}
                      onPress={() => handleDeleteTrip(trip.id)}
                      activeOpacity={0.7}
                    >
                      <Image
                        source={require('../../assets/images/trash-icon.png')}
                        style={[styles.menuIcon, styles.menuIconDelete]}
                        resizeMode="contain"
                      />
                      <Text style={styles.menuItemTextDelete}>Delete Trip</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Trip Info */}
              <View style={styles.tripInfo}>
                <Text style={styles.tripTitle}>{trip.title}</Text>
                <View style={styles.tripDetail}>
                  <Text style={styles.tripDetailIcon}>📍</Text>
                  <Text style={styles.tripDetailText}>{trip.location}</Text>
                </View>
                <View style={styles.tripDetail}>
                  <Text style={styles.tripDetailIcon}>📅</Text>
                  <Text style={styles.tripDetailText}>{trip.dates}</Text>
                </View>
                <View style={styles.tripDetail}>
                  <Text style={styles.tripDetailIcon}>💰</Text>
                  <Text style={styles.tripDetailText}>{trip.budget}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
          )}
        </View>

        {/* Hidden Gem Score */}
        <View style={styles.hiddenGemCard}>
          <Image
            source={require('../../assets/images/hidden-gem-icon.png')}
            style={styles.hiddenGemIcon}
            resizeMode="contain"
          />
          <View style={styles.hiddenGemContent}>
            <Text style={styles.hiddenGemTitle}>Hidden Gem Score</Text>
            <Text style={styles.hiddenGemText}>
              Our AI finds places with low crowd risk and high local love. Every
              recommendation is curated, not just algorithmic.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={handleCancelDatePicker}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.datePickerContainer}>
              <View style={styles.datePickerHeader}>
                <TouchableOpacity onPress={handleCancelDatePicker}>
                  <Text style={styles.datePickerCancel}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.datePickerTitle}>Change Dates</Text>
                <TouchableOpacity onPress={handleSaveDates}>
                  <Text style={styles.datePickerDone}>Done</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.datePickerContent}>
                <Text style={styles.dateLabel}>Start Date</Text>
                <TextInput
                  style={styles.dateInput}
                  value={startDateText}
                  onChangeText={setStartDateText}
                  placeholder="e.g. Mar 15, 2026"
                  placeholderTextColor="#999"
                />

                <Text style={styles.dateLabel}>End Date</Text>
                <TextInput
                  style={styles.dateInput}
                  value={endDateText}
                  onChangeText={setEndDateText}
                  placeholder="e.g. Mar 18, 2026"
                  placeholderTextColor="#999"
                />
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4EBDC',
  },
  headerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mapIcon: {
    width: 40,
    height: 40,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F3D2B',
  },
  taglineText: {
    fontSize: 12,
    color: '#666',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsIcon: {
    width: 24,
    height: 24,
  },
  friendsIcon: {
    width: 24,
    height: 24,
  },
  profileButton: {
    width: 40,
    height: 40,
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1F3D2B',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  newTripButton: {
    backgroundColor: '#1F3D2B',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
    alignSelf: 'flex-start',
  },
  newTripText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  tripCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  tripImageContainer: {
    position: 'relative',
    height: 180,
  },
  tripImage: {
    width: '100%',
    height: '100%',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#2F6F6D',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  tripMenuButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FFFFFF',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: 3,
  },
  menuDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#1F3D2B',
  },
  tripInfo: {
    padding: 16,
  },
  tripTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F3D2B',
    marginBottom: 12,
  },
  tripDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  tripDetailIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  tripDetailText: {
    fontSize: 14,
    color: '#666',
  },
  hiddenGemCard: {
    flexDirection: 'row',
    backgroundColor: '#E8EBE4',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    marginTop: 0,
    gap: 16,
  },
  hiddenGemIcon: {
    width: 56,
    height: 56,
  },
  hiddenGemContent: {
    flex: 1,
  },
  hiddenGemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F3D2B',
    marginBottom: 8,
  },
  hiddenGemText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 48,
    right: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1000,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  menuItemLast: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  menuIcon: {
    width: 20,
    height: 20,
    tintColor: '#1F3D2B',
  },
  menuIconDelete: {
    tintColor: '#DC2626',
  },
  menuItemText: {
    fontSize: 15,
    color: '#1F3D2B',
    fontWeight: '500',
  },
  menuItemTextDelete: {
    fontSize: 15,
    color: '#DC2626',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  datePickerContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F3D2B',
  },
  datePickerCancel: {
    fontSize: 16,
    color: '#666',
  },
  datePickerDone: {
    fontSize: 16,
    color: '#6B9080',
    fontWeight: '600',
  },
  datePickerContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F3D2B',
    marginTop: 16,
    marginBottom: 8,
  },
  dateInput: {
    backgroundColor: '#F4EBDC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F3D2B',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F3D2B',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
  },
});
