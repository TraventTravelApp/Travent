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
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../types';
import { api } from '../services/api';
import { authService } from '../services/auth';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export default function ProfileScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [budget, setBudget] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      // Pre-fill from local storage immediately
      const storedEmail = await AsyncStorage.getItem('email');
      if (storedEmail) setEmail(storedEmail);

      // Fetch full profile from backend
      const response = await api.get<{ name?: string; email?: string; bio?: string }>('/profile');
      if (response.success && response.data) {
        setName(response.data.name || '');
        setEmail(response.data.email || storedEmail || '');
        setBio(response.data.bio || '');
      }
    } catch (err) {
      // Non-fatal — user still sees whatever was pre-filled
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await api.put('/profile', { name, bio });
      if (response.success) {
        Alert.alert('Success', 'Profile updated successfully');
      } else {
        Alert.alert('Error', response.error || 'Failed to save changes');
      }
    } catch (err) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await authService.logout();
    navigation.navigate('Welcome');
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#1F3D2B" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
          <Text style={styles.backText}>Home</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Image
              source={require('../../assets/images/profile-section-icon.png')}
              style={styles.sectionIcon}
              resizeMode="contain"
            />
            <View>
              <Text style={styles.sectionTitle}>Profile</Text>
              <Text style={styles.sectionSubtitle}>Manage your account</Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={email}
              editable={false}
              placeholder="Enter your email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Bio</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell us a bit about yourself"
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
            />
          </View>

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            activeOpacity={0.8}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Image
              source={require('../../assets/images/preferences-icon.png')}
              style={styles.sectionIcon}
              resizeMode="contain"
            />
            <View>
              <Text style={styles.sectionTitle}>Preferences</Text>
              <Text style={styles.sectionSubtitle}>Customize your experience</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.preferenceCard}
            onPress={() => navigation.navigate('InterestQuiz')}
            activeOpacity={0.7}
          >
            <Text style={styles.preferenceTitle}>Update Interest Quiz</Text>
            <Text style={styles.preferenceDescription}>
              Retake the quiz to update your travel preferences
            </Text>
          </TouchableOpacity>

          <View style={styles.budgetCard}>
            <Text style={styles.preferenceTitle}>Default Budget Range</Text>
            <TextInput
              style={styles.budgetInput}
              value={budget}
              onChangeText={setBudget}
              placeholder=""
              placeholderTextColor="#999"
            />
            <Text style={styles.budgetLabel}>Typical trip budget</Text>
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Image
              source={require('../../assets/images/notifications-icon.png')}
              style={styles.sectionIcon}
              resizeMode="contain"
            />
            <View>
              <Text style={styles.sectionTitle}>Notifications</Text>
              <Text style={styles.sectionSubtitle}>Manage alerts</Text>
            </View>
          </View>

          <View style={styles.preferenceCard}>
            <Text style={styles.preferenceTitle}>Trip Reminders</Text>
            <Text style={styles.preferenceDescription}>
              Get notified about upcoming trips
            </Text>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Image
              source={require('../../assets/images/about-icon.png')}
              style={styles.sectionIcon}
              resizeMode="contain"
            />
            <View>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.sectionSubtitle}>Learn more</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.linkItem} activeOpacity={0.7}>
            <Text style={styles.linkText}>Privacy Policy</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkItem} activeOpacity={0.7}>
            <Text style={styles.linkText}>Terms of Service</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkItem} activeOpacity={0.7}>
            <Text style={styles.linkText}>Help & Support</Text>
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          activeOpacity={0.8}
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4EBDC',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
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
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  sectionIcon: {
    width: 48,
    height: 48,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F3D2B',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F3D2B',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  inputDisabled: {
    color: '#888',
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#1F3D2B',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  preferenceCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  preferenceTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F3D2B',
    marginBottom: 6,
  },
  preferenceDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  budgetCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
  },
  budgetInput: {
    backgroundColor: '#EFEFEF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  budgetLabel: {
    fontSize: 12,
    color: '#666',
  },
  linkItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  linkText: {
    fontSize: 15,
    color: '#1F3D2B',
  },
  signOutButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#1F3D2B',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 80,
    marginTop: 8,
  },
  signOutText: {
    color: '#1F3D2B',
    fontSize: 16,
    fontWeight: '500',
  },
  bottomPadding: {
    height: 40,
  },
});
