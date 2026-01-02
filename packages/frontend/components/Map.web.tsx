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
import Map, { Marker, MapRef, AttributionControl } from 'react-map-gl/maplibre'
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

  return (
    <>
      {/* Zoom controls - bottom right */}
      <div className="absolute bottom-[52px] right-2.5 z-[1000] pointer-events-auto">
        <div className="flex flex-col gap-0.5">
          <button
            className={`w-9 h-9 border-none rounded-t cursor-pointer flex items-center justify-center shadow-[0_2px_6px_rgba(0,0,0,0.3)] transition-all duration-200 outline-none
              ${isDark ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-700'}
              hover:bg-orange-500 hover:text-white hover:shadow-[0_4px_8px_rgba(0,0,0,0.4)]
              active:scale-95 border-b ${isDark ? 'border-white/10' : 'border-black/[0.08]'}`}
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
            className={`w-9 h-9 border-none rounded-b cursor-pointer flex items-center justify-center shadow-[0_2px_6px_rgba(0,0,0,0.3)] transition-all duration-200 outline-none
              ${isDark ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-700'}
              hover:bg-orange-500 hover:text-white hover:shadow-[0_4px_8px_rgba(0,0,0,0.4)]
              active:scale-95`}
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

      {/* Location button - bottom right */}
      <div className="absolute bottom-2.5 right-2.5 z-[1000] pointer-events-auto">
        <button
          className={`w-9 h-9 border-none rounded cursor-pointer flex items-center justify-center shadow-[0_2px_6px_rgba(0,0,0,0.3)] transition-all duration-200 outline-none
            ${isDark ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-700'}
            hover:bg-orange-500 hover:text-white hover:shadow-[0_4px_8px_rgba(0,0,0,0.4)]
            active:scale-95`}
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
              className={`w-[30px] h-[30px] rounded-[50%_50%_50%_0] -rotate-45 border-2 border-white shadow-[0_2px_4px_rgba(0,0,0,0.3)] cursor-pointer
                ${point.type === 'center' ? 'bg-red-500' : 'bg-blue-500'}`}
              title={point.name}
            />
          </Marker>
        )),
      [validPoints, handleMarkerClick]
    )

    return (
      <div className="w-full h-full relative">
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
          <AttributionControl
            compact={true}
            position="bottom-left"
            style={{
              marginBottom: '10px',
              marginLeft: '10px',
            }}
          />
        </Map>
        <CustomControls mapRef={mapRef} isDark={isDark} />
      </div>
    )
  }
)

MapComponent.displayName = 'Map'

export default MapComponent
