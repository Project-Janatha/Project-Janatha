import React, { useEffect, useState, useRef, useCallback, memo } from 'react'
import { StyleSheet, View, ActivityIndicator, Platform } from 'react-native'
import MapView, { Marker, Region, PROVIDER_GOOGLE } from 'react-native-maps'
import { getCurrentPosition } from '../utils'

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

const DEFAULT_REGION: Region = {
  latitude: 37.7749,
  longitude: -122.4194,
  latitudeDelta: 0.5,
  longitudeDelta: 0.5,
}

const PIN_COLORS = {
  center: '#dc2626',
  event: '#2563eb',
} as const

const Map = memo<MapProps>(function Map({
  points = [],
  onPointPress,
  onPointHover,
  onPointClick,
  initialRegion,
  showUserLocation = true,
}) {
  const mapRef = useRef<MapView>(null)
  const [region, setRegion] = useState<Region | null>(initialRegion || null)
  const [isLoading, setIsLoading] = useState(true)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)

  useEffect(() => {
    let mounted = true

    const loadLocation = async () => {
      try {
        const position = await getCurrentPosition()

        if (mounted && position && Array.isArray(position) && position.length === 2) {
          const [longitude, latitude] = position

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

  const handleMarkerPress = useCallback(
    (point: MapPoint) => {
      if (onPointPress) {
        onPointPress(point)
      }
    },
    [onPointPress]
  )

  const getPinColor = useCallback((type: MapPoint['type']): string => {
    return PIN_COLORS[type] || PIN_COLORS.event
  }, [])

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#dc2626" />
      </View>
    )
  }

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
