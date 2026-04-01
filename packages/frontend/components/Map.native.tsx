import React, { useEffect, useState, useRef, useCallback, memo } from 'react'
import { StyleSheet, View, Platform } from 'react-native'
import MapView, { Marker, Region, PROVIDER_GOOGLE } from 'react-native-maps'
import { getCurrentPosition } from '../utils'

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
  /** ID of the user's home center — map falls back to this center's location when device location is unavailable */
  userCenterID?: string | null
  /** Extra bottom padding so controls stay above a bottom sheet (native only, ignored on web) */
  bottomPadding?: number
}

const DEFAULT_REGION: Region = {
  latitude: 37.7749,
  longitude: -122.4194,
  latitudeDelta: 0.5,
  longitudeDelta: 0.5,
}

const isValidCoord = (lat: number, lng: number): boolean =>
  typeof lat === 'number' &&
  typeof lng === 'number' &&
  !isNaN(lat) &&
  !isNaN(lng) &&
  lat >= -90 &&
  lat <= 90 &&
  lng >= -180 &&
  lng <= 180

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
  userCenterID,
  bottomPadding = 0,
}) {
  const mapRef = useRef<MapView>(null)
  const pointsRef = useRef(points)
  pointsRef.current = points

  // Compute initial region synchronously — user's center > SF default
  const computeInitialRegion = (): Region => {
    if (initialRegion) return initialRegion
    const homeCenter = userCenterID
      ? points.find((p) => p.id === userCenterID && p.type === 'center')
      : undefined
    if (homeCenter && isValidCoord(homeCenter.latitude, homeCenter.longitude)) {
      return { latitude: homeCenter.latitude, longitude: homeCenter.longitude, latitudeDelta: 0.2, longitudeDelta: 0.2 }
    }
    return DEFAULT_REGION
  }

  const [region] = useState<Region>(computeInitialRegion)

  // Async: try to get device location and fly to it
  useEffect(() => {
    let mounted = true

    getCurrentPosition()
      .then((position) => {
        if (!mounted || !position || !Array.isArray(position) || position.length !== 2) return
        const [longitude, latitude] = position
        if (!isValidCoord(latitude, longitude)) return

        mapRef.current?.animateToRegion(
          { latitude, longitude, latitudeDelta: 0.1, longitudeDelta: 0.1 },
          500
        )
      })
      .catch(() => {})

    return () => { mounted = false }
  }, [])

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

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={region}
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
        mapPadding={{ top: 0, right: 0, bottom: bottomPadding, left: 0 }}
      >
        {points
          .filter((p) => isValidCoord(p.latitude, p.longitude))
          .map((point) => (
            <Marker
              key={point.id}
              coordinate={{ latitude: point.latitude, longitude: point.longitude }}
              title={point.name}
              description={point.description || point.type}
              pinColor={getPinColor(point.type)}
              onPress={() => handleMarkerPress(point)}
              identifier={point.id}
            />
          ))}
      </MapView>
    </View>
  )
})

export default Map

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
})
