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

type Props = NativeStackScreenProps<RootStackParamList, 'AddFriend'>;

interface SuggestedFriend {
  id: string;
  name: string;
  initials: string;
  mutualFriends: number;
  email?: string;
}

// Mock suggested friends data
const mockSuggestedFriends: SuggestedFriend[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    initials: 'AJ',
    mutualFriends: 3,
    email: 'alex@example.com',
  },
  {
    id: '2',
    name: 'Jordan Lee',
    initials: 'JL',
    mutualFriends: 3,
    email: 'jordan@example.com',
  },
  {
    id: '3',
    name: 'Taylor Smith',
    initials: 'TS',
    mutualFriends: 3,
    email: 'taylor@example.com',
  },
];

export default function AddFriendScreen({ navigation, route }: Props) {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [suggestedFriends, setSuggestedFriends] = useState<SuggestedFriend[]>(mockSuggestedFriends);
  const [selectedFriends, setSelectedFriends] = useState<Set<string>>(new Set());

  const handleClose = () => {
    navigation.goBack();
  };

  const handleToggleFriend = (friendId: string) => {
    const newSelected = new Set(selectedFriends);
    if (newSelected.has(friendId)) {
      newSelected.delete(friendId);
    } else {
      newSelected.add(friendId);
    }
    setSelectedFriends(newSelected);
  };

  const handleSendRequest = () => {
    if (!emailOrUsername && selectedFriends.size === 0) {
      Alert.alert('No Friends Selected', 'Please enter an email or select suggested friends');
      return;
    }

    // TODO: Send friend requests to backend
    const friendCount = selectedFriends.size + (emailOrUsername ? 1 : 0);
    Alert.alert(
      'Friend Request Sent',
      `Friend request${friendCount > 1 ? 's' : ''} sent successfully!`,
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]
    );
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
            {/* Email or Username Input */}
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

            {/* Suggested Friends Section */}
            <Text style={styles.sectionTitle}>Suggested Friends</Text>

            {/* Suggested Friends List */}
            <View style={styles.suggestedList}>
              {suggestedFriends.map((friend) => (
                <View key={friend.id} style={styles.suggestedCard}>
                  <View style={styles.suggestedLeft}>
                    <View style={styles.suggestedAvatar}>
                      <Text style={styles.suggestedAvatarText}>{friend.initials}</Text>
                    </View>
                    <View style={styles.suggestedInfo}>
                      <Text style={styles.suggestedName}>{friend.name}</Text>
                      <Text style={styles.mutualFriends}>Mutual: {friend.mutualFriends} friends</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.addButton,
                      selectedFriends.has(friend.id) && styles.addButtonSelected,
                    ]}
                    onPress={() => handleToggleFriend(friend.id)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.addButtonText,
                        selectedFriends.has(friend.id) && styles.addButtonTextSelected,
                      ]}
                    >
                      {selectedFriends.has(friend.id) ? '✓' : '+'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Send Friend Request Button */}
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendRequest}
              activeOpacity={0.8}
            >
              <Text style={styles.sendButtonText}>Send Friend Request</Text>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F3D2B',
    marginBottom: 16,
  },
  suggestedList: {
    gap: 12,
    marginBottom: 24,
  },
  suggestedCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E5D4C1',
    padding: 16,
    borderRadius: 16,
  },
  suggestedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  suggestedAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6B9080',
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestedAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  suggestedInfo: {
    flex: 1,
  },
  suggestedName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F3D2B',
    marginBottom: 4,
  },
  mutualFriends: {
    fontSize: 14,
    color: '#666',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#1F3D2B',
    backgroundColor: '#E5D4C1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonSelected: {
    backgroundColor: '#1F3D2B',
    borderColor: '#1F3D2B',
  },
  addButtonText: {
    fontSize: 20,
    color: '#1F3D2B',
    fontWeight: '600',
  },
  addButtonTextSelected: {
    color: '#FFFFFF',
  },
  sendButton: {
    backgroundColor: '#6B9080',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
