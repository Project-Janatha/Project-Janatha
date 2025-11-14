/**
 * Map.web.tsx
 *
 * Om Sri Cinmaya Sadgurave Namaha. Om Sri Gurubyo Namaha.
 * Author: Abhiram Ramachandran
 * Date Authored: September 2, 2025
 * Last Date Modified: September 2, 2025
 *
 * This file exports a Map component that integrates with mapbox-gl to provide map functionalities for Web.
 *
 * Dependencies:
 * - mapboxgl: For rendering maps and handling map-related functionalities.
 */
import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { getCurrentPosition } from 'frontend/utilities/locationServices'
import { useThemeContext } from './contexts'

mapboxgl.accessToken =
  'pk.eyJ1IjoicHJvamVjdC1qYW5hdGhhIiwiYSI6ImNtZjNkencybzBkYmgya3E0YXM0cmx6cHYifQ.81rjpzlsaDzLcz5P-GUXQw'

interface MapPoint {
  id: string
  type: 'center' | 'event'
  name: string
  latitude: number
  longitude: number
}

interface MapProps {
  points?: MapPoint[]
  onPointPress?: (point: MapPoint) => void
}

export interface MapRef {
  centerOnUser: () => void
}

const Map = forwardRef<MapRef, MapProps>(({ points = [], onPointPress }, ref) => {
  const mapContainer = useRef(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markers = useRef<mapboxgl.Marker[]>([])
  const geolocateControl = useRef<mapboxgl.GeolocateControl | null>(null)
  const { isDark } = useThemeContext()

  // Expose centerOnUser method to parent
  useImperativeHandle(ref, () => ({
    centerOnUser: () => {
      if (geolocateControl.current) {
        geolocateControl.current.trigger()
      }
    },
  }))

  useEffect(() => {
    if (map.current) return // Initialize map only once
    if (!mapContainer.current) return // Ensure container is not null

    // Set default center to San Francisco Bay Area to show the markers
    const defaultCenter: [number, number] = [-122.4194, 37.7749] // San Francisco coordinates

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: isDark ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/streets-v11',
      center: defaultCenter,
      zoom: 10, // Starting zoom
    })

    // Create GeolocateControl but hide it
    geolocateControl.current = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
      showUserLocation: true,
      showUserHeading: true,
    })

    map.current.addControl(geolocateControl.current)

    // Hide the built-in button with CSS
    const geolocateButton = document.querySelector('.mapboxgl-ctrl-geolocate') as HTMLElement
    if (geolocateButton) {
      geolocateButton.style.display = 'none'
    }

    // Update center with user loc, but keep a reasonable zoom to see markers
    getCurrentPosition().then((center) => {
      if (
        center &&
        Array.isArray(center) &&
        center.length === 2 &&
        typeof center[0] === 'number' &&
        typeof center[1] === 'number'
      ) {
        map.current!.setCenter([center[0], center[1]] as [number, number])
        map.current!.setZoom(10) // Ensure good zoom level to see markers
      }
    })
  }, [isDark])

  // Effect to update map style when theme changes
  useEffect(() => {
    if (!map.current) return

    const newStyle = isDark
      ? 'mapbox://styles/mapbox/dark-v11'
      : 'mapbox://styles/mapbox/streets-v11'
    map.current.setStyle(newStyle)
  }, [isDark])

  // Effect to handle markers when points change
  useEffect(() => {
    if (!map.current) return

    // Wait for style to load before adding markers
    const addMarkers = () => {
      // Clear existing markers
      markers.current.forEach((marker) => marker.remove())
      markers.current = []

      // Add new markers
      points.forEach((point) => {
        // Create a custom marker element
        const markerElement = document.createElement('div')
        markerElement.style.width = '20px'
        markerElement.style.height = '20px'
        markerElement.style.borderRadius = '50%'
        markerElement.style.border = '2px solid #FFFFFF'
        markerElement.style.cursor = 'pointer'
        markerElement.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)'

        // Set color based on type
        markerElement.style.backgroundColor = point.type === 'center' ? '#dc2626' : '#2563eb'

        // Add click handler
        markerElement.addEventListener('click', () => {
          if (onPointPress) {
            onPointPress(point)
          }
        })

        // Create marker and add to map
        const marker = new mapboxgl.Marker(markerElement)
          .setLngLat([point.longitude, point.latitude])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(
              `<h3>${point.name}</h3><p>Type: ${point.type}</p>`
            )
          )
          .addTo(map.current!)

        markers.current.push(marker)
      })
    }

    // Check if style is already loaded
    if (map.current.isStyleLoaded()) {
      addMarkers()
    } else {
      // Wait for style to load
      map.current.once('style.load', addMarkers)
    }
  }, [points, onPointPress, isDark])

  return <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
})

Map.displayName = 'Map'

export default Map
