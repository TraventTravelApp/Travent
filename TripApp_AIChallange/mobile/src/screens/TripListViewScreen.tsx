import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import Button from '../components/ui/Button';

type Props = NativeStackScreenProps<RootStackParamList, 'TripListView'>;

export default function TripListViewScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Trip Itinerary</Text>
        <Text style={styles.subtitle}>Coming soon...</Text>
        <Button onPress={() => navigation.goBack()}>Go Back</Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4EBDC',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F3D2B',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#1F3D2BB3',
    marginBottom: 24,
  },
});
