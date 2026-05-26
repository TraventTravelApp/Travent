import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface DaySummaryProps {
  dayNumber: number;
  duration: string;
  estimatedCost: string;
  activityCount: number;
}

export default function DaySummary({
  dayNumber,
  duration,
  estimatedCost,
  activityCount,
}: DaySummaryProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Day {dayNumber} Itinerary</Text>

      <View style={styles.itemsContainer}>
        {/* Duration */}
        <View style={styles.item}>
          <View style={[styles.iconCircle, { backgroundColor: '#DBEAFE' }]}>
            <Text style={styles.icon}>🕐</Text>
          </View>
          <View style={styles.itemContent}>
            <Text style={styles.label}>Duration</Text>
            <Text style={styles.value}>{duration}</Text>
          </View>
        </View>

        {/* Est. Cost */}
        <View style={styles.item}>
          <View style={[styles.iconCircle, { backgroundColor: '#FED7AA' }]}>
            <Text style={styles.icon}>💵</Text>
          </View>
          <View style={styles.itemContent}>
            <Text style={styles.label}>Est. Cost</Text>
            <Text style={styles.value}>{estimatedCost}</Text>
          </View>
        </View>

        {/* Activities */}
        <View style={styles.item}>
          <View style={[styles.iconCircle, { backgroundColor: '#D1FAE5' }]}>
            <Text style={styles.icon}>📍</Text>
          </View>
          <View style={styles.itemContent}>
            <Text style={styles.label}>Activities</Text>
            <Text style={styles.value}>
              {activityCount} {activityCount === 1 ? 'stop' : 'stops'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F3D2B',
    marginBottom: 16,
  },
  itemsContainer: {
    gap: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
  },
  itemContent: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F3D2B',
  },
});
