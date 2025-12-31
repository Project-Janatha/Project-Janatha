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
import React, { useState, useCallback, memo, Component, ErrorInfo, ReactNode } from 'react'
import Map, { Marker, NavigationControl } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useThemeContext } from './contexts'

// Error Boundary to prevent map crashes from breaking the app
class MapErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Map error:', error, errorInfo)
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
          }}
        >
          Map failed to load
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

    // Calculate center from initialCenter prop or default
    const center = initialCenter
      ? { longitude: initialCenter[1], latitude: initialCenter[0] }
      : { longitude: DEFAULT_CENTER.longitude, latitude: DEFAULT_CENTER.latitude }

    const [viewState, setViewState] = useState({
      ...center,
      zoom: initialZoom,
    })

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

    return (
      <div
        style={{ width: '100%', height: '100%', position: 'relative' }}
        data-inspector-safe="true"
        suppressHydrationWarning
        onMouseEnter={(e) => {
          // Prevent DevTools from trying to inspect WebGL context
          e.stopPropagation()
        }}
        onMouseDown={(e) => {
          // Block inspector mouse events on map
          if ((e as any).button === 2) {
            // right-click
            e.stopPropagation()
          }
        }}
        onContextMenu={(e) => {
          // Allow context menu but prevent inspector attachment
          e.stopPropagation()
        }}
      >
        <Map
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          mapStyle={mapStyle}
          style={{ width: '100%', height: '100%' }}
          reuseMaps={true}
        >
          <NavigationControl position="top-right" />

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
