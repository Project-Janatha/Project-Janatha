import React, { useEffect, useState, useRef, useCallback, memo } from 'react'
import { StyleSheet, View, Pressable, Platform } from 'react-native'
import MapView, { Marker, Region, PROVIDER_GOOGLE } from 'react-native-maps'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Plus, Minus, Navigation } from 'lucide-react-native'
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
  const currentRegionRef = useRef<Region>(region)
  const insets = useSafeAreaInsets()

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

  // Zoom by adjusting region delta. Camera.zoom is Google-Maps-only;
  // on iOS Apple Maps the camera object doesn't expose zoom, which is
  // why the previous implementation was a no-op on iOS.
  // factor < 1 → zoom in (smaller delta); factor > 1 → zoom out.
  const handleZoom = useCallback((factor: number) => {
    const r = currentRegionRef.current
    if (!r) return
    mapRef.current?.animateToRegion(
      {
        latitude: r.latitude,
        longitude: r.longitude,
        latitudeDelta: Math.max(0.0005, Math.min(180, r.latitudeDelta * factor)),
        longitudeDelta: Math.max(0.0005, Math.min(180, r.longitudeDelta * factor)),
      },
      200
    )
  }, [])

  // Recenter to device location. iOS's `showsMyLocationButton` is
  // Android-only, so we wire our own button to getCurrentPosition.
  const handleLocate = useCallback(async () => {
    const position = await getCurrentPosition().catch(() => null)
    if (!position || !Array.isArray(position) || position.length !== 2) return
    const [longitude, latitude] = position
    if (!isValidCoord(latitude, longitude)) return
    mapRef.current?.animateToRegion(
      { latitude, longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 },
      500
    )
  }, [])

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={region}
        onRegionChangeComplete={(r) => { currentRegionRef.current = r }}
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
              // iOS performance: without this, every marker re-renders its
              // view on each map gesture, which is what causes the "frozen
              // map" symptom on iOS with 100+ markers.
              tracksViewChanges={false}
            />
          ))}
      </MapView>

      {/* Custom controls in the top-right, sitting under the profile
          icon. react-native-maps' built-in user-location button is
          Android-only and zoom buttons aren't built in at all. */}
      <View style={[styles.controls, { top: insets.top + 64 }]} pointerEvents="box-none">
        <Pressable onPress={() => handleZoom(0.5)} style={styles.controlButton} accessibilityLabel="Zoom in">
          <Plus size={18} color="#1a1a1a" />
        </Pressable>
        <Pressable onPress={() => handleZoom(2)} style={styles.controlButton} accessibilityLabel="Zoom out">
          <Minus size={18} color="#1a1a1a" />
        </Pressable>
        <Pressable onPress={handleLocate} style={[styles.controlButton, { marginTop: 8 }]} accessibilityLabel="Show my location">
          <Navigation size={16} color="#E8862A" />
        </Pressable>
      </View>
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
  controls: {
    position: 'absolute',
    right: 12,
    gap: 4,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
})
