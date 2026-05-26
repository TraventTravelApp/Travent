import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import * as Device from 'expo-device';

// Conditional import for MapView
let MapView: any = null;
let Marker: any = null;
let PROVIDER_DEFAULT: any = null;

try {
  const maps = require('react-native-maps');
  MapView = maps.default;
  Marker = maps.Marker;
  PROVIDER_DEFAULT = maps.PROVIDER_DEFAULT;
} catch (e) {
  // MapView not available in Expo Go
  console.log('MapView not available - using fallback');
}

interface MapViewWrapperProps {
  style: any;
  region: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  children?: React.ReactNode;
  scrollEnabled?: boolean;
  zoomEnabled?: boolean;
  provider?: any;
  initialRegion?: any;
}

export default function MapViewWrapper(props: MapViewWrapperProps) {
  const isExpoGo = !Device.isDevice || __DEV__;

  // If MapView is available and not in Expo Go, use real maps
  if (MapView && !isExpoGo) {
    return <MapView {...props} />;
  }

  // Fallback for Expo Go - show placeholder
  return (
    <View style={[props.style, styles.fallbackContainer]}>
      <View style={styles.fallbackContent}>
        <Text style={styles.fallbackIcon}>🗺️</Text>
        <Text style={styles.fallbackTitle}>Map Preview</Text>
        <Text style={styles.fallbackSubtitle}>
          Maps require a development build.{'\n'}
          Run: npx expo run:ios
        </Text>
        <View style={styles.coordinateBox}>
          <Text style={styles.coordinateText}>
            📍 {props.region.latitude.toFixed(4)}, {props.region.longitude.toFixed(4)}
          </Text>
        </View>
      </View>
    </View>
  );
}

// Export Marker wrapper
export function MarkerWrapper(props: any) {
  if (Marker) {
    return <Marker {...props} />;
  }
  // Fallback - render nothing
  return null;
}

// Export provider constant
export const PROVIDER = PROVIDER_DEFAULT;

const styles = StyleSheet.create({
  fallbackContainer: {
    backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    overflow: 'hidden',
  },
  fallbackContent: {
    alignItems: 'center',
    padding: 24,
  },
  fallbackIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  fallbackTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F3D2B',
    marginBottom: 8,
  },
  fallbackSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  coordinateBox: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  coordinateText: {
    fontSize: 12,
    color: '#1F3D2B',
    fontFamily: 'monospace',
  },
});
