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

// Hide Leaflet attribution or move it to avoid search bar overlap
const style = document.createElement('style')
style.textContent = `
  .leaflet-top.leaflet-left {
    display: none !important;
  }
  .leaflet-control-zoom {
    border: none !important;
    box-shadow: none !important;
  }
  .leaflet-control-zoom a {
    border: none !important;
    border-radius: 4px !important;
  }
  .leaflet-bar {
    border: none !important;
    box-shadow: none !important;
  }
`
document.head.appendChild(style)

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
      })
  }, [map, onUserLocation])

  return null
}

// Component for geolocation control
function GeolocationControl({ isDark }: { isDark: boolean }) {
  const map = useMap()
  const controlRef = useRef<L.Control | null>(null)
  const buttonRef = useRef<HTMLElement | null>(null)

  const handleLocate = () => {
    map.locate({ setView: true, maxZoom: 16 })
  }

  useMapEvents({
    locationfound: (e) => {
      map.flyTo(e.latlng, 16)
    },
  })

  useEffect(() => {
    if (!controlRef.current) {
      // Create custom control for geolocation
      const GeolocationButton = L.Control.extend({
        onAdd: function (mapInstance: L.Map) {
          const button = L.DomUtil.create(
            'button',
            'leaflet-bar leaflet-control geolocation-control-button'
          )
          buttonRef.current = button

          // Lucide Navigation icon as inline SVG
          button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
          `
          button.style.width = '30px'
          button.style.height = '30px'
          button.style.cursor = 'pointer'
          button.style.display = 'flex'
          button.style.alignItems = 'center'
          button.style.justifyContent = 'center'
          button.style.border = 'none'
          button.style.borderRadius = '4px'
          button.style.transition = 'all 0.2s ease'
          button.title = 'Show my location'

          // Add hover handlers
          button.onmouseenter = function () {
            button.style.backgroundColor = '#dc2626'
            button.style.color = 'white'
          }
          button.onmouseleave = function () {
            const bgColor = button.getAttribute('data-bg-color') || 'white'
            const iconColor = button.getAttribute('data-icon-color') || '#374151'
            button.style.backgroundColor = bgColor
            button.style.color = iconColor
          }

          button.onclick = function () {
            handleLocate()
          }

          return button
        },
        onRemove: function () {
          buttonRef.current = null
        },
      })

      const control = new GeolocationButton({ position: 'bottomright' })
      map.addControl(control)
      controlRef.current = control
    }
  }, [map])

  // Update button styles when theme changes
  useEffect(() => {
    if (buttonRef.current) {
      const bgColor = isDark ? '#171717' : 'white'
      const iconColor = isDark ? '#e5e5e5' : '#374151'

      buttonRef.current.style.backgroundColor = bgColor
      buttonRef.current.style.color = iconColor
      buttonRef.current.setAttribute('data-bg-color', bgColor)
      buttonRef.current.setAttribute('data-icon-color', iconColor)
    }
  }, [isDark])

  return null
}

// Component for custom zoom controls positioned above geolocation
function ZoomControl({ isDark }: { isDark: boolean }) {
  const map = useMap()
  const zoomControlRef = useRef<L.Control | null>(null)
  const zoomInButtonRef = useRef<HTMLElement | null>(null)
  const zoomOutButtonRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!zoomControlRef.current) {
      const ZoomButtons = L.Control.extend({
        onAdd: function (mapInstance: L.Map) {
          const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control')
          container.style.display = 'flex'
          container.style.flexDirection = 'column'
          container.style.gap = '1px'

          // Zoom In Button with Lucide Plus icon
          const zoomInBtn = L.DomUtil.create('button', 'zoom-in-button', container)
          zoomInButtonRef.current = zoomInBtn

          zoomInBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          `
          zoomInBtn.style.width = '30px'
          zoomInBtn.style.height = '30px'
          zoomInBtn.style.cursor = 'pointer'
          zoomInBtn.style.display = 'flex'
          zoomInBtn.style.alignItems = 'center'
          zoomInBtn.style.justifyContent = 'center'
          zoomInBtn.style.border = 'none'
          zoomInBtn.style.borderRadius = '4px 4px 0 0'
          zoomInBtn.style.transition = 'all 0.2s ease'
          zoomInBtn.title = 'Zoom in'

          // Zoom Out Button with Lucide Minus icon
          const zoomOutBtn = L.DomUtil.create('button', 'zoom-out-button', container)
          zoomOutButtonRef.current = zoomOutBtn

          zoomOutBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>
          `
          zoomOutBtn.style.width = '30px'
          zoomOutBtn.style.height = '30px'
          zoomOutBtn.style.cursor = 'pointer'
          zoomOutBtn.style.display = 'flex'
          zoomOutBtn.style.alignItems = 'center'
          zoomOutBtn.style.justifyContent = 'center'
          zoomOutBtn.style.border = 'none'
          zoomOutBtn.style.borderRadius = '0 0 4px 4px'
          zoomOutBtn.style.transition = 'all 0.2s ease'
          zoomOutBtn.title = 'Zoom out'

          // Add hover handlers for both buttons
          ;[zoomInBtn, zoomOutBtn].forEach((button) => {
            button.onmouseenter = function () {
              button.style.backgroundColor = '#dc2626'
              button.style.color = 'white'
            }
            button.onmouseleave = function () {
              const bgColor = button.getAttribute('data-bg-color') || 'white'
              const iconColor = button.getAttribute('data-icon-color') || '#171717'
              button.style.backgroundColor = bgColor
              button.style.color = iconColor
            }
          })

          zoomInBtn.onclick = () => mapInstance.zoomIn()
          zoomOutBtn.onclick = () => mapInstance.zoomOut()

          return container
        },
        onRemove: function () {
          zoomInButtonRef.current = null
          zoomOutButtonRef.current = null
        },
      })

      const control = new ZoomButtons({ position: 'bottomright' })
      map.addControl(control)
      zoomControlRef.current = control
    }
  }, [map])

  // Update button styles when theme changes
  useEffect(() => {
    const bgColor = isDark ? '#171717' : 'white'
    const iconColor = isDark ? '#e5e5e5' : '#171717'
    const borderColor = isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)'

    if (zoomInButtonRef.current) {
      zoomInButtonRef.current.style.backgroundColor = bgColor
      zoomInButtonRef.current.style.color = iconColor
      zoomInButtonRef.current.style.borderBottom = borderColor
      zoomInButtonRef.current.setAttribute('data-bg-color', bgColor)
      zoomInButtonRef.current.setAttribute('data-icon-color', iconColor)
    }

    if (zoomOutButtonRef.current) {
      zoomOutButtonRef.current.style.backgroundColor = bgColor
      zoomOutButtonRef.current.style.color = iconColor
      zoomOutButtonRef.current.setAttribute('data-bg-color', bgColor)
      zoomOutButtonRef.current.setAttribute('data-icon-color', iconColor)
    }
  }, [isDark])

  return null
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
          getCurrentPosition().then((center) => {
            if (
              center &&
              Array.isArray(center) &&
              center.length === 2 &&
              typeof center[0] === 'number' &&
              typeof center[1] === 'number'
            ) {
              const latlng: [number, number] = [center[1], center[0]]
              setUserLocation(latlng)
              if (mapRef.current) {
                mapRef.current.setView(latlng, 16)
              }
            }
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
        <ZoomControl isDark={isDark} />
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
    )
  }
)

Map.displayName = 'Map'

export default Map
