/**
 * Map.web.tsx
 *
 * Om Sri Cinmaya Sadgurave Namaha. Om Sri Gurubyo Namaha.
 * Author: Abhiram Ramachandran
 * Date Authored: September 2, 2025
 * Last Date Modified: January 2025
 *
 * This file exports a Map component that integrates with Leaflet to provide map functionalities for Web.
 *
 * Dependencies:
 * - leaflet: For rendering maps and handling map-related functionalities.
 * - react-leaflet: React components for Leaflet integration.
 */
import React, { useEffect, forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { useRouter } from 'expo-router'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getCurrentPosition } from '../utils/locationServices'
import { useThemeContext } from './contexts'

// Fix default marker icon issue in Leaflet
// We'll use CDN URLs instead of importing PNG files
const defaultIconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png'
const defaultIconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png'
const defaultShadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: defaultIconRetinaUrl,
  iconUrl: defaultIconUrl,
  shadowUrl: defaultShadowUrl,
})

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

// Custom icons for centers and events
const createCustomIcon = (type: 'center' | 'event') => {
  const color = type === 'center' ? '#dc2626' : '#2563eb'
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background-color: ${color};
      border: 2px solid #FFFFFF;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  })
}

// Component to handle map instance and geolocation
function MapController({
  mapRef,
  onUserLocation,
}: {
  mapRef: any
  onUserLocation?: (latlng: [number, number]) => void
}) {
  const map = useMap()
  const router = useRouter()

  useEffect(() => {
    mapRef.current = map

    // Wait for map to be ready before invalidating size
    map.whenReady(() => {
      setTimeout(() => {
        try {
          map.invalidateSize()
        } catch (error) {
          console.error('Error invalidating map size:', error)
        }
      }, 100)
    })
  }, [map, mapRef])

  // Get user location on mount
  useEffect(() => {
    getCurrentPosition()
      .then((center) => {
        if (
          center &&
          Array.isArray(center) &&
          center.length === 2 &&
          typeof center[0] === 'number' &&
          typeof center[1] === 'number'
        ) {
          try {
            // getCurrentPosition returns [longitude, latitude]
            map.setView([center[1], center[0]], 10)
            if (onUserLocation) {
              onUserLocation([center[1], center[0]])
            }
          } catch (error) {
            console.error('Error setting map view:', error)
          }
        }
      })
      .catch((error) => {
        console.error('Error getting user location:', error)
        // Don't crash, just use default location
      })
  }, [map, onUserLocation])

  return null
}

// Component for geolocation control - Pure React, no Leaflet hooks needed for external button
function GeolocationControlExternal({
  isDark,
  mapRef,
}: {
  isDark: boolean
  mapRef: React.RefObject<L.Map | null>
}) {
  const handleLocationClick = () => {
    console.log('Location button clicked')
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('Got position:', position.coords)
        const latlng = { lat: position.coords.latitude, lng: position.coords.longitude }
        if (mapRef.current) {
          mapRef.current.flyTo(latlng, 16)
        }
      },
      (error) => {
        console.error('Geolocation error:', error)
        alert(`Cannot get location: ${error.message}`)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }

  const bgColor = isDark ? '#171717' : 'white'
  const iconColor = isDark ? '#e5e5e5' : '#374151'

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '10px',
        right: '10px',
        zIndex: 1000,
        pointerEvents: 'auto',
      }}
    >
      <button
        onClick={handleLocationClick}
        title="Show my location"
        style={{
          width: '30px',
          height: '30px',
          backgroundColor: bgColor,
          color: iconColor,
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 1px 5px rgba(0,0,0,0.4)',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#dc2626'
          e.currentTarget.style.color = 'white'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = bgColor
          e.currentTarget.style.color = iconColor
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="3 11 22 2 13 21 11 13 3 11" />
        </svg>
      </button>
    </div>
  )
}

// Component for custom zoom controls - Pure React, no Leaflet hooks
function ZoomControlExternal({
  isDark,
  mapRef,
}: {
  isDark: boolean
  mapRef: React.RefObject<L.Map | null>
}) {
  const bgColor = isDark ? '#171717' : 'white'
  const iconColor = isDark ? '#e5e5e5' : '#171717'
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'

  const buttonStyle = {
    width: '30px',
    height: '30px',
    backgroundColor: bgColor,
    color: iconColor,
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 1px 5px rgba(0,0,0,0.4)',
    transition: 'all 0.2s ease',
  }

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '50px',
        right: '10px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '1px',
        pointerEvents: 'auto',
      }}
    >
      <button
        onClick={() => mapRef.current?.zoomIn()}
        title="Zoom in"
        style={{
          ...buttonStyle,
          borderRadius: '4px 4px 0 0',
          borderBottom: `1px solid ${borderColor}`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#dc2626'
          e.currentTarget.style.color = 'white'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = bgColor
          e.currentTarget.style.color = iconColor
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14" />
          <path d="M12 5v14" />
        </svg>
      </button>
      <button
        onClick={() => mapRef.current?.zoomOut()}
        title="Zoom out"
        style={{
          ...buttonStyle,
          borderRadius: '0 0 4px 4px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#dc2626'
          e.currentTarget.style.color = 'white'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = bgColor
          e.currentTarget.style.color = iconColor
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14" />
        </svg>
      </button>
    </div>
  )
}

// Internal component for location events - INSIDE MapContainer
function GeolocationControl({ isDark }: { isDark: boolean }) {
  const map = useMap()

  useMapEvents({
    locationfound: (e) => {
      console.log('Location found:', e.latlng)
      map.flyTo(e.latlng, 16)
    },
    locationerror: (e) => {
      console.error('Location error:', e.message)
      alert(`Location error: ${e.message}. Please enable location permissions.`)
    },
  })

  return null
}

// Component for custom zoom controls - Pure React, no Leaflet controls
function ZoomControl({ isDark }: { isDark: boolean }) {
  const map = useMap()

  const bgColor = isDark ? '#171717' : 'white'
  const iconColor = isDark ? '#e5e5e5' : '#171717'
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'

  const buttonStyle = {
    width: '30px',
    height: '30px',
    backgroundColor: bgColor,
    color: iconColor,
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 1px 5px rgba(0,0,0,0.4)',
    transition: 'all 0.2s ease',
  }

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '50px',
        right: '10px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '1px',
        pointerEvents: 'auto',
      }}
    >
      <button
        onClick={() => map.zoomIn()}
        title="Zoom in"
        style={{
          ...buttonStyle,
          borderRadius: '4px 4px 0 0',
          borderBottom: `1px solid ${borderColor}`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#dc2626'
          e.currentTarget.style.color = 'white'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = bgColor
          e.currentTarget.style.color = iconColor
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14" />
          <path d="M12 5v14" />
        </svg>
      </button>
      <button
        onClick={() => map.zoomOut()}
        title="Zoom out"
        style={{
          ...buttonStyle,
          borderRadius: '0 0 4px 4px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#dc2626'
          e.currentTarget.style.color = 'white'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = bgColor
          e.currentTarget.style.color = iconColor
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14" />
        </svg>
      </button>
    </div>
  )
}

const Map = forwardRef<MapRef, MapProps>(
  ({ points = [], initialCenter = [37.7749, -122.4194], initialZoom = 10, onPointPress }, ref) => {
    const mapRef = useRef<L.Map | null>(null)
    const router = useRouter()
    const { isDark } = useThemeContext()
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null)

    useImperativeHandle(ref, () => ({
      centerOnUser: () => {
        if (mapRef.current && userLocation) {
          mapRef.current.setView(userLocation, 16)
        } else {
          getCurrentPosition()
            .then((center) => {
              if (
                center &&
                Array.isArray(center) &&
                center.length === 2 &&
                typeof center[0] === 'number' &&
                typeof center[1] === 'number'
              ) {
                // getCurrentPosition returns [longitude, latitude]
                const latlng: [number, number] = [center[1], center[0]]
                setUserLocation(latlng)
                if (mapRef.current) {
                  mapRef.current.setView(latlng, 16)
                }
              }
            })
            .catch((error) => {
              console.error('Error centering on user:', error)
            })
        }
      },
    }))

    // Tile layer URL based on theme
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
          whenReady={() => {
            console.log('Map is ready')
          }}
        >
          <TileLayer
            key={isDark ? 'dark' : 'light'}
            attribution={tileLayerAttribution}
            url={tileLayerUrl}
          />

          <MapController mapRef={mapRef} onUserLocation={setUserLocation} />
          <GeolocationControl isDark={isDark} />

          {points.map((point) => (
            <Marker
              key={point.id}
              position={[point.latitude, point.longitude]}
              icon={createCustomIcon(point.type)}
              eventHandlers={{
                click: () => {
                  if (onPointPress) {
                    onPointPress(point)
                  }
                },
              }}
            >
              <Popup>
                <h3>{point.name}</h3>
                <p>Type: {point.type}</p>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        <ZoomControlExternal isDark={isDark} mapRef={mapRef} />
        <GeolocationControlExternal isDark={isDark} mapRef={mapRef} />
      </div>
    )
  }
)

Map.displayName = 'Map'

export default Map
