/**
 * Map.tsx
 *
 * Om Sri Cinmaya Sadgurave Namaha. Om Sri Gurubyo Namaha.
 * Author: Abhiram Ramachandran
 * Date Authored: September 2, 2025
 * Last Date Modified: December 31, 2025
 *
 * Native mobile map component using react-native-maps for iOS and Android platforms.
 * Provides location-aware mapping with custom markers and user interaction.
 *
 * Dependencies:
 * - react-native-maps: Native map rendering
 * - expo-location: User location services
 */
import React, { useEffect, useState, useRef, useCallback, memo } from 'react'
import { StyleSheet, View, ActivityIndicator, Platform } from 'react-native'
import MapView, { Marker, Region, PROVIDER_GOOGLE } from 'react-native-maps'
import { getCurrentPosition } from '../utils'

// Styles for the map container and loading state
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
  },
})

// Type definitions
export interface MapPoint {
  id: string
  type: 'center' | 'event'
  name: string
  latitude: number
  longitude: number
  description?: string
}

export interface MapProps {
  points?: MapPoint[]
  onPointPress?: (point: MapPoint) => void
  onPointHover?: (point: MapPoint | null, x?: number, y?: number) => void
  onPointClick?: (point: MapPoint, x?: number, y?: number) => void
  initialRegion?: Region
  showUserLocation?: boolean
}

// Default San Francisco Bay Area region
const DEFAULT_REGION: Region = {
  latitude: 37.7749,
  longitude: -122.4194,
  latitudeDelta: 0.5,
  longitudeDelta: 0.5,
}

// Pin colors based on type
const PIN_COLORS = {
  center: '#dc2626', // Red for centers
  event: '#2563eb', // Blue for events
} as const

/**
 * Native Map Component for iOS and Android
 * Displays interactive map with custom markers and user location
 */
const Map = memo<MapProps>(function Map({
  points = [],
  onPointPress,
  initialRegion,
  showUserLocation = true,
}) {
  const mapRef = useRef<MapView>(null)
  const [region, setRegion] = useState<Region | null>(initialRegion || null)
  const [isLoading, setIsLoading] = useState(true)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)

  // Load user location on mount
  useEffect(() => {
    let mounted = true

    const loadLocation = async () => {
      try {
        const position = await getCurrentPosition()

        if (mounted && position && Array.isArray(position) && position.length === 2) {
          const [longitude, latitude] = position

          // Validate coordinates
          if (
            typeof latitude === 'number' &&
            typeof longitude === 'number' &&
            !isNaN(latitude) &&
            !isNaN(longitude) &&
            latitude >= -90 &&
            latitude <= 90 &&
            longitude >= -180 &&
            longitude <= 180
          ) {
            setUserLocation([longitude, latitude])

            // Set initial region if not provided
            if (!initialRegion) {
              setRegion({
                latitude,
                longitude,
                latitudeDelta: 0.1,
                longitudeDelta: 0.1,
              })
            }
          }
        }
      } catch (error) {
        // Failed to get user location - using default region
        if (mounted && !initialRegion) {
          setRegion(DEFAULT_REGION)
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    loadLocation()

    return () => {
      mounted = false
    }
  }, [initialRegion])

  // Handle marker press with proper callback
  const handleMarkerPress = useCallback(
    (point: MapPoint) => {
      if (onPointPress) {
        onPointPress(point)
      }
    },
    [onPointPress]
  )

  // Get pin color based on marker type
  const getPinColor = useCallback((type: MapPoint['type']): string => {
    return PIN_COLORS[type] || PIN_COLORS.event
  }, [])

  // Show loading state while determining location
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#dc2626" />
      </View>
    )
  }

  // Use determined region or fallback to default
  const effectiveRegion = region || DEFAULT_REGION

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={effectiveRegion}
        showsUserLocation={showUserLocation}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
        scrollEnabled={true}
        zoomEnabled={true}
        pitchEnabled={true}
        rotateEnabled={true}
        loadingEnabled={true}
        loadingIndicatorColor="#dc2626"
        loadingBackgroundColor="#ffffff"
        moveOnMarkerPress={false}
        toolbarEnabled={false}
        minZoomLevel={2}
        maxZoomLevel={20}
      >
        {points.map((point) => {
          // Validate point coordinates
          if (
            typeof point.latitude !== 'number' ||
            typeof point.longitude !== 'number' ||
            isNaN(point.latitude) ||
            isNaN(point.longitude) ||
            point.latitude < -90 ||
            point.latitude > 90 ||
            point.longitude < -180 ||
            point.longitude > 180
          ) {
            return null
          }

          return (
            <Marker
              key={point.id}
              coordinate={{
                latitude: point.latitude,
                longitude: point.longitude,
              }}
              title={point.name}
              description={point.description || point.type}
              pinColor={getPinColor(point.type)}
              onPress={() => handleMarkerPress(point)}
              identifier={point.id}
            />
          )
        })}
      </MapView>
    </View>
  )
})

export default Map
