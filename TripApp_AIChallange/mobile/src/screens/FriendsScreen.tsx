import React, { useState } from 'react';
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

type Props = NativeStackScreenProps<RootStackParamList, 'Friends'>;

interface Friend {
  id: string;
  name: string;
  initials: string;
  sharedTrips: number;
  email?: string;
}

// Mock friends data
const mockFriends: Friend[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    initials: 'SC',
    sharedTrips: 2,
    email: 'sarah@example.com',
  },
  {
    id: '2',
    name: 'Mike Torres',
    initials: 'MT',
    sharedTrips: 2,
    email: 'mike@example.com',
  },
  {
    id: '3',
    name: 'Emma Rodriguez',
    initials: 'ER',
    sharedTrips: 2,
    email: 'emma@example.com',
  },
];

export default function FriendsScreen({ navigation, route }: Props) {
  const [friends, setFriends] = useState<Friend[]>(mockFriends);

  const handleClose = () => {
    navigation.goBack();
  };

  const handleAddFriend = () => {
    navigation.navigate('AddFriend');
  };

  const handleShareTrip = (friend: Friend) => {
    navigation.navigate('ShareTrip', {
      friendId: friend.id,
      friendName: friend.name,
    });
  };

  return (
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Friends</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Add Friend Button */}
            <TouchableOpacity
              style={styles.addFriendButton}
              onPress={handleAddFriend}
              activeOpacity={0.8}
            >
              <Text style={styles.addFriendIcon}>+</Text>
              <Text style={styles.addFriendText}>Add Friend</Text>
            </TouchableOpacity>

            {/* My Friends Section */}
            <Text style={styles.sectionTitle}>My Friends ({friends.length})</Text>

            {/* Friends List */}
            <View style={styles.friendsList}>
              {friends.map((friend) => (
                <View key={friend.id} style={styles.friendCard}>
                  <View style={styles.friendLeft}>
                    <View style={styles.avatarCircle}>
                      <Text style={styles.avatarText}>{friend.initials}</Text>
                    </View>
                    <View style={styles.friendInfo}>
                      <Text style={styles.friendName}>{friend.name}</Text>
                      <Text style={styles.sharedTrips}>{friend.sharedTrips} shared trips</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.shareButton}
                    onPress={() => handleShareTrip(friend)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.shareIcon}>⤴</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Collaborate Info Box */}
            <View style={styles.infoBox}>
              <View style={styles.infoHeader}>
                <Image
                  source={require('../../assets/images/group-icon-new.png')}
                  style={styles.infoIcon}
                  resizeMode="contain"
                />
                <Text style={styles.infoTitle}>Collaborate on Trips</Text>
              </View>
              <Text style={styles.infoDescription}>
                Share trips with friends to plan together! They can add activities, vote on favorites, and share memories.
              </Text>
            </View>
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
  addFriendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D87C52',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 8,
  },
  addFriendIcon: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  addFriendText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F3D2B',
    marginBottom: 16,
  },
  friendsList: {
    gap: 12,
    marginBottom: 24,
  },
  friendCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  friendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#D87C52',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F3D2B',
    marginBottom: 4,
  },
  sharedTrips: {
    fontSize: 14,
    color: '#666',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#1F3D2B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareIcon: {
    fontSize: 18,
    color: '#1F3D2B',
  },
  infoBox: {
    backgroundColor: '#E5D4C1',
    borderRadius: 16,
    padding: 20,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  infoIcon: {
    width: 24,
    height: 24,
    tintColor: '#1F3D2B',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F3D2B',
  },
  infoDescription: {
    fontSize: 14,
    color: '#1F3D2B',
    lineHeight: 20,
  },
});
