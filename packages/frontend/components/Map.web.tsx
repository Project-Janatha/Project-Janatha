/**
 * Map.web.tsx
 *
 * Om Sri Cinmaya Sadgurave Namaha. Om Sri Gurubyo Namaha.
 * Author: Abhiram Ramachandran
 * Date Authored: September 2, 2025
 * Last Date Modified: December 2025
 *
 * Industry-standard Leaflet + React implementation
 * - No DOM manipulation in component code
 * - CSS-only styling via globals.css
 * - Standard Leaflet markers from CDN
 * - Pure React custom controls
 */
import React, {
  useEffect,
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useCallback,
} from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { getCurrentPosition } from '../utils/locationServices'
import { useThemeContext } from './contexts'

export interface MapPoint {
  id: string
  name: string
  latitude: number
  longitude: number
  type: 'center' | 'event'
}

interface MapProps {
  points?: MapPoint[]
  initialCenter?: [number, number]
  initialZoom?: number
  onPointPress?: (point: MapPoint) => void
}

export interface MapRef {
  centerOnUser: () => void
}

// Standard Leaflet icons from CDN
const centerIcon = new L.Icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const eventIcon = new L.Icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

// Map initialization - standard react-leaflet pattern
function MapInitializer({
  mapRef,
  onUserLocation,
}: {
  mapRef: React.MutableRefObject<L.Map | null>
  onUserLocation: (latlng: [number, number]) => void
}) {
  const map = useMap()

  useEffect(() => {
    mapRef.current = map

    map.whenReady(() => {
      map.invalidateSize()

      // Request user location on initial load
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            if (position?.coords) {
              const latlng: [number, number] = [position.coords.latitude, position.coords.longitude]
              onUserLocation(latlng)
              map.setView(latlng, 12)
            }
          },
          (error) => {
            console.warn('Initial location request failed:', error.message)
            // Don't alert on initial load, just log
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        )
      }
    })
  }, [map, mapRef, onUserLocation])

  return null
}

// Custom controls using pure React (no Leaflet Control API)
function CustomControls({
  mapRef,
  isDark,
}: {
  mapRef: React.MutableRefObject<L.Map | null>
  isDark: boolean
}) {
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
        mapRef.current?.flyTo(latlng, 16)
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
    mapRef.current?.zoomIn()
  }, [mapRef])

  const handleZoomOut = useCallback(() => {
    mapRef.current?.zoomOut()
  }, [mapRef])

  const buttonClass = isDark ? 'map-control-dark' : 'map-control-light'

  return (
    <>
      {/* Location button */}
      <div className="map-control-container" style={{ bottom: '10px', right: '10px' }}>
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

      {/* Zoom controls */}
      <div className="map-control-container" style={{ bottom: '50px', right: '10px' }}>
        <div className="map-zoom-group">
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
    </>
  )
}

const Map = forwardRef<MapRef, MapProps>(
  ({ points = [], initialCenter = [37.7749, -122.4194], initialZoom = 10, onPointPress }, ref) => {
    const mapRef = useRef<L.Map | null>(null)
    const { isDark } = useThemeContext()
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null)

    useImperativeHandle(ref, () => ({
      centerOnUser: () => {
        if (mapRef.current && userLocation) {
          mapRef.current.setView(userLocation, 16)
        } else {
          getCurrentPosition()
            .then((coords) => {
              if (coords && Array.isArray(coords) && coords.length === 2) {
                const latlng: [number, number] = [coords[1], coords[0]]
                setUserLocation(latlng)
                mapRef.current?.setView(latlng, 16)
              }
            })
            .catch(() => {})
        }
      },
    }))

    const tileLayerUrl = isDark
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

    const tileLayerAttribution = isDark
      ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

    return (
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <MapContainer
          center={initialCenter}
          zoom={initialZoom}
          style={{ width: '100%', height: '100%', zIndex: 0 }}
          zoomControl={false}
          preferCanvas={true}
        >
          <TileLayer
            key={isDark ? 'dark' : 'light'}
            attribution={tileLayerAttribution}
            url={tileLayerUrl}
          />

          <MapInitializer mapRef={mapRef} onUserLocation={setUserLocation} />

          {points.map((point) => (
            <Marker
              key={point.id}
              position={[point.latitude, point.longitude]}
              icon={point.type === 'center' ? centerIcon : eventIcon}
              eventHandlers={{
                click: () => onPointPress?.(point),
              }}
            >
              <Popup>
                <strong>{point.name}</strong>
                <br />
                <span style={{ fontSize: '0.9em', color: '#666' }}>
                  {point.type === 'center' ? 'Center' : 'Event'}
                </span>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        <CustomControls mapRef={mapRef} isDark={isDark} />
      </div>
    )
  }
)

Map.displayName = 'Map'

export default Map
