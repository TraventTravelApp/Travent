import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageBackground,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'NewTrip'>;

export default function NewTripScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
          <Text style={styles.backText}>New Trip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>What kind of adventure awaits?</Text>
          <Text style={styles.subtitle}>Choose your journey type to get started</Text>

          {/* Road Trip Card */}
          <TouchableOpacity
            style={styles.tripCard}
            onPress={() => navigation.navigate('TripQuestionnaire', { type: 'roadtrip' })}
            activeOpacity={0.9}
          >
            <ImageBackground
              source={require('../../assets/images/road-trip.png')}
              style={styles.cardImage}
              imageStyle={styles.cardImageStyle}
            >
              <View style={styles.cardOverlayFull} />
              <View style={styles.cardIconContainer}>
                <Image
                  source={require('../../assets/images/road-trip-icon.png')}
                  style={styles.cardIconImage}
                  resizeMode="contain"
                />
                <Text style={styles.cardTitle}>Road Trip</Text>
              </View>
            </ImageBackground>
            <View style={styles.cardContent}>
              <Text style={styles.cardDescription}>
                Plan a scenic journey with stops along the way. Perfect for discovering
                hidden gems between destinations.
              </Text>
              <TouchableOpacity
                style={styles.planButton}
                onPress={() => navigation.navigate('TripQuestionnaire', { type: 'roadtrip' })}
                activeOpacity={0.7}
              >
                <Text style={styles.planButtonText}>Plan road trip →</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>

          {/* Location Trip Card */}
          <TouchableOpacity
            style={styles.tripCard}
            onPress={() => navigation.navigate('TripQuestionnaire', { type: 'location' })}
            activeOpacity={0.9}
          >
            <ImageBackground
              source={require('../../assets/images/location-trip.png')}
              style={styles.cardImage}
              imageStyle={styles.cardImageStyle}
            >
              <View style={styles.cardOverlayFull} />
              <View style={styles.cardIconContainer}>
                <Image
                  source={require('../../assets/images/location-trip-icon.png')}
                  style={styles.cardIconImage}
                  resizeMode="contain"
                />
                <Text style={styles.cardTitle}>Location Trip</Text>
              </View>
            </ImageBackground>
            <View style={styles.cardContent}>
              <Text style={styles.cardDescription}>
                Explore a specific destination in depth. Ideal for weekend getaways and city
                adventures.
              </Text>
              <TouchableOpacity
                style={styles.planButton}
                onPress={() => navigation.navigate('TripQuestionnaire', { type: 'location' })}
                activeOpacity={0.7}
              >
                <Text style={styles.planButtonText}>Plan location trip →</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>

          {/* Manual Planning Option */}
          <Text style={styles.manualText}>Want to plan day-by-day yourself?</Text>
          <TouchableOpacity
            style={styles.manualButton}
            onPress={() => navigation.navigate('ManualTripBuilder')}
            activeOpacity={0.8}
          >
            <Text style={styles.manualButtonText}>I'll build it manually</Text>
          </TouchableOpacity>
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
    paddingTop: 0,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1F3D2B',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
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
  cardImage: {
    width: '100%',
    height: 160,
    justifyContent: 'flex-end',
  },
  cardImageStyle: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  cardOverlayFull: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  cardIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  cardIconImage: {
    width: 28,
    height: 28,
    tintColor: '#FFFFFF',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cardContent: {
    padding: 16,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  planButton: {
    alignSelf: 'flex-start',
  },
  planButtonText: {
    fontSize: 14,
    color: '#2F6F6D',
    fontWeight: '600',
  },
  manualText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  manualButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#1F3D2B',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 40,
  },
  manualButtonText: {
    color: '#1F3D2B',
    fontSize: 15,
    fontWeight: '500',
  },
});
