import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

export interface Activity {
  id: string;
  stepNumber: number;
  time: string;
  category: string;
  name: string;
  description: string;
  image: string;
  tags: string[];
  duration: string;
  cost: string | number;
  rating?: number;
}

interface ActivityCardProps {
  activity: Activity;
}

export default function ActivityCard({ activity }: ActivityCardProps) {
  return (
    <View style={styles.card}>
      {/* Image with overlays */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: activity.image }}
          style={styles.image}
          resizeMode="cover"
        />
        {/* Time badge */}
        <View style={styles.timeBadge}>
          <Text style={styles.timeBadgeText}>{activity.time}</Text>
        </View>
        {/* Rating badge */}
        {activity.rating && (
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>★ {activity.rating}</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Step and Category */}
        <Text style={styles.category}>
          Stop {activity.stepNumber} • {activity.category}
        </Text>

        {/* Name */}
        <Text style={styles.name}>{activity.name}</Text>

        {/* Description */}
        <Text style={styles.description} numberOfLines={2}>
          {activity.description}
        </Text>

        {/* Tags */}
        {Array.isArray(activity.tags) && activity.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {activity.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{String(tag)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Duration and Cost */}
        <View style={styles.footer}>
          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>🕐</Text>
            <Text style={styles.infoText}>{activity.duration}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>💵</Text>
            <Text style={styles.infoText}>
              {typeof activity.cost === 'number' ? `$${activity.cost}` : activity.cost}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    height: 200,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  timeBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  timeBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F3D2B',
  },
  ratingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#2F6F6D',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    padding: 16,
  },
  category: {
    fontSize: 14,
    fontWeight: '600',
    color: '#C45C2E',
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F3D2B',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#E0F2F1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2F6F6D',
  },
  footer: {
    flexDirection: 'row',
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoIcon: {
    fontSize: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#4B5563',
  },
});
