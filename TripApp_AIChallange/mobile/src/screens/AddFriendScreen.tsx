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
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { api } from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'AddFriend'>;

export default function AddFriendScreen({ navigation }: Props) {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [sending, setSending] = useState(false);

  const handleClose = () => {
    navigation.goBack();
  };

  const handleSendRequest = async () => {
    const email = emailOrUsername.trim();
    if (!email) {
      Alert.alert('Email Required', 'Please enter a friend\'s email address');
      return;
    }

    try {
      setSending(true);
      const response = await api.post('/friends/request', { email });
      if (response.success) {
        Alert.alert(
          'Friend Request Sent',
          'Your friend request has been sent successfully!',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Error', response.error || 'Failed to send friend request');
      }
    } catch (err) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Friend</Text>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Instructional note */}
          <View style={styles.noteBox}>
            <Text style={styles.noteText}>Enter a friend's email below to add them</Text>
          </View>

          {/* Email Input */}
          <Text style={styles.inputLabel}>Email or Username</Text>
          <View style={styles.inputContainer}>
            <Image
              source={require('../../assets/images/mail-icon.png')}
              style={styles.mailIcon}
              resizeMode="contain"
            />
            <TextInput
              style={styles.textInput}
              placeholder="friend@example.com"
              placeholderTextColor="#999"
              value={emailOrUsername}
              onChangeText={setEmailOrUsername}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Send Friend Request Button */}
          <TouchableOpacity
            style={[styles.sendButton, sending && styles.sendButtonDisabled]}
            onPress={handleSendRequest}
            activeOpacity={0.8}
            disabled={sending}
          >
            <Text style={styles.sendButtonText}>
              {sending ? 'Sending…' : 'Send Friend Request'}
            </Text>
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
    width: 40,
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
    width: 40,
    alignItems: 'flex-end',
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
  noteBox: {
    backgroundColor: '#E5D4C1',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  noteText: {
    fontSize: 15,
    color: '#1F3D2B',
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1F3D2B',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5D4C1',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 24,
  },
  mailIcon: {
    width: 20,
    height: 20,
    tintColor: '#8B7355',
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#1F3D2B',
  },
  sendButton: {
    backgroundColor: '#6B9080',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  sendButtonDisabled: {
    opacity: 0.7,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
