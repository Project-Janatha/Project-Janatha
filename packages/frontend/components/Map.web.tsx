/**
 * Map.web.tsx
 *
 * Om Sri Cinmaya Sadgurave Namaha. Om Sri Gurubyo Namaha.
 * Author: Abhiram Ramachandran
 * Date Authored: September 2, 2025
 * Last Date Modified: January 1, 2026
 *
 * Web-only map component using react-map-gl with OpenStreetMap tiles.
 * Native platforms (iOS/Android) use Map.tsx with react-native-maps.
 */
import React, { useState, useCallback, memo, useRef, useMemo } from 'react'
import Map, { Marker, MapRef } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useThemeContext } from './contexts'

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
  initialCenter?: [number, number]
  initialZoom?: number
  showUserLocation?: boolean
}

// Default center - San Francisco Bay Area
const DEFAULT_CENTER = { latitude: 37.7749, longitude: -122.4194 }
const DEFAULT_ZOOM = 10

/**
 * Validate coordinate values
 */
const isValidCoordinate = (lat: number, lng: number): boolean => {
  return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
}

/**
 * Custom Map Controls - Leaflet-style controls using pure React
 */
interface CustomControlsProps {
  mapRef: React.RefObject<MapRef | null>
  isDark: boolean
}

const CustomControls = memo<CustomControlsProps>(({ mapRef, isDark }) => {
  const handleZoomIn = useCallback(() => {
    mapRef.current?.zoomIn()
  }, [mapRef])

  const handleZoomOut = useCallback(() => {
    mapRef.current?.zoomOut()
  }, [mapRef])

  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        mapRef.current?.flyTo({
          center: [position.coords.longitude, position.coords.latitude],
          zoom: 16,
          duration: 2000,
        })
      },
      (error) => {
        if (error.code === 1) {
          alert('Location access denied. Please enable location permissions.')
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }, [mapRef])

  const buttonClass = useMemo(
    () => (isDark ? 'map-control-dark' : 'map-control-light'),
    [isDark]
  )

  return (
    <>
      {/* Zoom controls */}
      <div className="map-control-container" style={{ bottom: '88px', right: '10px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <button
            className={`${buttonClass} map-zoom-in`}
            onClick={handleZoomIn}
            title="Zoom in"
            aria-label="Zoom in"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <button
            className={`${buttonClass} map-zoom-out`}
            onClick={handleZoomOut}
            title="Zoom out"
            aria-label="Zoom out"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Location button */}
      <div className="map-control-container" style={{ bottom: '42px', right: '10px' }}>
        <button
          className={buttonClass}
          onClick={handleLocate}
          title="Show my location"
          aria-label="Show my location"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polygon points="3 11 22 2 13 21 11 13 3 11" />
          </svg>
        </button>
      </div>
    </>
  )
})

CustomControls.displayName = 'CustomControls'

/**
 * Map Component for Web using react-map-gl with OpenStreetMap
 */
const MapComponent = memo<MapProps>(
  ({
    points = [],
    onPointPress,
    initialCenter,
    initialZoom = DEFAULT_ZOOM,
    showUserLocation = false,
  }) => {
    const { isDark } = useThemeContext()
    const mapRef = useRef<MapRef>(null)

    const center = initialCenter
      ? { longitude: initialCenter[1], latitude: initialCenter[0] }
      : { longitude: DEFAULT_CENTER.longitude, latitude: DEFAULT_CENTER.latitude }

    const [viewState, setViewState] = useState({
      ...center,
      zoom: initialZoom,
    })

    const handleMove = useCallback((evt: any) => {
      setViewState(evt.viewState)
    }, [])

    const handleMarkerClick = useCallback(
      (point: MapPoint) => (e: any) => {
        e.originalEvent?.stopPropagation()
        onPointPress?.(point)
      },
      [onPointPress]
    )

    const validPoints = useMemo(
      () => points.filter((point) => isValidCoordinate(point.latitude, point.longitude)),
      [points]
    )

    const mapStyle = useMemo(
      () =>
        isDark
          ? 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
          : 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      [isDark]
    )

    const markers = useMemo(
      () =>
        validPoints.map((point) => (
          <Marker
            key={point.id}
            longitude={point.longitude}
            latitude={point.latitude}
            anchor="bottom"
            onClick={handleMarkerClick(point)}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: '50% 50% 50% 0',
                background: point.type === 'center' ? '#ef4444' : '#3b82f6',
                transform: 'rotate(-45deg)',
                border: '2px solid white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                cursor: 'pointer',
              }}
              title={point.name}
            />
          </Marker>
        )),
      [validPoints, handleMarkerClick]
    )

    return (
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <Map
          ref={mapRef}
          {...viewState}
          onMove={handleMove}
          mapStyle={mapStyle}
          style={{ width: '100%', height: '100%' }}
          reuseMaps
          attributionControl={false}
        >
          {markers}
        </Map>
        <CustomControls mapRef={mapRef} isDark={isDark} />
      </div>
    )
  }
)

MapComponent.displayName = 'Map'

export default MapComponent
