import React, { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import type { MapPoint } from './Map.web'

type LeafletViewProps = {
  viewState: {
    longitude: number
    latitude: number
    zoom: number
  }
  onMove: (viewState: { longitude: number; latitude: number; zoom: number }) => void
  points: MapPoint[]
  isDark: boolean
  onPointPress?: (point: MapPoint) => void
}

function LeafletEventBridge({
  onMove,
}: {
  onMove: (viewState: { longitude: number; latitude: number; zoom: number }) => void
}) {
  useMapEvents({
    moveend: (event) => {
      const map = event.target
      const center = map.getCenter()
      onMove({ longitude: center.lng, latitude: center.lat, zoom: map.getZoom() })
    },
  })
  return null
}

export default function LeafletView({
  viewState,
  onMove,
  points,
  isDark,
  onPointPress,
}: LeafletViewProps) {
  useEffect(() => {
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    })
  }, [])

  return (
    <MapContainer
      center={[viewState.latitude, viewState.longitude]}
      zoom={viewState.zoom}
      style={{ width: '100%', height: '100%' }}
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer
        url={
          isDark
            ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
            : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
        }
        attribution="&copy; OpenStreetMap contributors &copy; CARTO"
      />
      <LeafletEventBridge onMove={onMove} />
      {points.map((point) => (
        <Marker
          key={point.id}
          position={[point.latitude, point.longitude]}
          eventHandlers={{
            click: () => onPointPress?.(point),
          }}
        />
      ))}
    </MapContainer>
  )
}
