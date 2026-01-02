/**
 * Map.web.tsx
 *
 * Om Sri Cinmaya Sadgurave Namaha. Om Sri Gurubyo Namaha.
 * Author: Abhiram Ramachandran
 * Date Authored: September 2, 2025
 * Last Date Modified: December 31, 2025
 *
 * Web-only map component using react-map-gl with OpenStreetMap tiles.
 * Native platforms (iOS/Android) use Map.tsx with react-native-maps.
 */
import React, { useState, useCallback, memo, Component, ErrorInfo, ReactNode, useRef } from 'react'
import Map, { Marker, MapRef } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useThemeContext } from './contexts'

// Error Boundary to prevent map crashes from breaking the app
class MapErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Map error:', error, errorInfo)
    // Don't rethrow - just log
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f3f4f6',
            color: '#6b7280',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div>Map failed to load</div>
          {this.state.error && (
            <div style={{ fontSize: '12px', opacity: 0.7 }}>{this.state.error.message}</div>
          )}
        </div>
      )
    }

    return this.props.children
  }
}

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

const CustomControls: React.FC<CustomControlsProps> = ({ mapRef, isDark }) => {
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latlng = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        mapRef.current?.flyTo({ center: [latlng.lng, latlng.lat], zoom: 16, duration: 2000 })
      },
      (error) => {
        console.error('Location error:', error)
        if (error.code === 1) {
          alert(
            'Location access denied. Please enable location permissions in your browser settings.'
          )
        } else if (error.code === 2) {
          alert('Location unavailable. Please check your device settings.')
        } else if (error.code === 3) {
          alert('Location request timed out. Please try again.')
        } else {
          alert('Cannot get your location. Please try again.')
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }, [mapRef])

  const handleLocate = useCallback(() => {
    // Check permissions first if available
    if (navigator.permissions) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((permissionStatus) => {
          if (permissionStatus.state === 'denied') {
            alert('Location access is blocked. Please enable it in your browser settings.')
            return
          }
          requestLocation()
        })
        .catch(() => {
          // Fallback if permissions API not fully supported
          requestLocation()
        })
    } else {
      requestLocation()
    }
  }, [requestLocation])

  const handleZoomIn = useCallback(() => {
    const map = mapRef.current
    if (map) {
      map.zoomIn()
    }
  }, [mapRef])

  const handleZoomOut = useCallback(() => {
    const map = mapRef.current
    if (map) {
      map.zoomOut()
    }
  }, [mapRef])

  const buttonClass = isDark ? 'map-control-dark' : 'map-control-light'

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
}

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
    const [isMounted, setIsMounted] = React.useState(false)

    // Delay mount to avoid Expo dev mode conflicts
    React.useEffect(() => {
      const timer = setTimeout(() => setIsMounted(true), 100)
      return () => clearTimeout(timer)
    }, [])

    // Calculate center from initialCenter prop or default
    const center = initialCenter
      ? { longitude: initialCenter[1], latitude: initialCenter[0] }
      : { longitude: DEFAULT_CENTER.longitude, latitude: DEFAULT_CENTER.latitude }

    const [viewState, setViewState] = useState({
      ...center,
      zoom: initialZoom,
    })

    // Handle cleanup to prevent WebGL context issues
    React.useEffect(() => {
      return () => {
        if (mapRef.current) {
          try {
            const map = mapRef.current.getMap()
            if (map) {
              map.remove()
            }
          } catch (e) {
            // Ignore cleanup errors
          }
        }
      }
    }, [])

    const handleMarkerClick = useCallback(
      (point: MapPoint) => (e: any) => {
        e.originalEvent.stopPropagation()
        if (onPointPress) {
          onPointPress(point)
        }
      },
      [onPointPress]
    )

    // Filter and validate points
    const validPoints = points.filter((point) => isValidCoordinate(point.latitude, point.longitude))

    // OpenStreetMap tile URLs - light and dark themes
    const mapStyle = isDark
      ? 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
      : 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'

    if (!isMounted) {
      return (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
          }}
        >
          <div style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>Loading map...</div>
        </div>
      )
    }

    return (
      <div
        style={{ width: '100%', height: '100%', position: 'relative', isolation: 'isolate' }}
        suppressHydrationWarning
      >
        {/* Add a key to force remount when theme changes - helps with WebGL context issues */}
        <Map
          key={`map-${isDark ? 'dark' : 'light'}`}
          ref={mapRef}
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          mapStyle={mapStyle}
          style={{ width: '100%', height: '100%' }}
          reuseMaps={false}
          preserveDrawingBuffer={false}
          antialias={false}
          failIfMajorPerformanceCaveat={false}
          trackResize={true}
          onError={(e) => {
            console.error('Map error:', e)
          }}
        >
          {validPoints.map((point) => (
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
          ))}
        </Map>
        <CustomControls mapRef={mapRef} isDark={isDark} />
      </div>
    )
  }
)

MapComponent.displayName = 'Map'

// Wrap with error boundary
const MapWithErrorBoundary: React.FC<MapProps> = (props) => {
  return (
    <MapErrorBoundary>
      <MapComponent {...props} />
    </MapErrorBoundary>
  )
}

export default MapWithErrorBoundary
