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
import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { StyleSheet } from "react-native";
import {getCurrentPosition} from 'frontend/utilities/locationServices';

mapboxgl.accessToken = "pk.eyJ1IjoicHJvamVjdC1qYW5hdGhhIiwiYSI6ImNtZjNkencybzBkYmgya3E0YXM0cmx6cHYifQ.81rjpzlsaDzLcz5P-GUXQw";

interface MapPoint {
  id: string;
  type: 'center' | 'event';
  name: string;
  latitude: number;
  longitude: number;
}

interface MapProps {
  points?: MapPoint[];
  onPointPress?: (point: MapPoint) => void;
}

/**
 * Map Component
 * @param {MapProps} props - Props passed to the Map component including points and onPointPress handler.
 * @return {JSX.Element} A Map component that displays a map using mapboxgl with markers.
 */
export default function Map({ points = [], onPointPress }: MapProps) {
  const mapContainer = useRef(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (map.current) return; // Initialize map only once

      // Set default center to San Francisco Bay Area to show the markers
      const defaultCenter: [number, number] = [-122.4194, 37.7749]; // San Francisco coordinates

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: defaultCenter,
        zoom: 10 // Starting zoom
      });

      map.current.addControl(
        new mapboxgl.GeolocateControl(
          {
            trackUserLocation: true,
            showUserHeading: true
          }
        ));

      // Update center with user loc, but keep a reasonable zoom to see markers
      getCurrentPosition().then((center) => {
        if (center && Array.isArray(center) && center.length === 2) {
          map.current!.setCenter(center);
          map.current!.setZoom(10); // Ensure good zoom level to see markers
        }
      });
}, []);

  // Effect to handle markers when points change
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add new markers
    points.forEach((point) => {
      // Create a custom marker element
      const markerElement = document.createElement('div');
      markerElement.style.width = '20px';
      markerElement.style.height = '20px';
      markerElement.style.borderRadius = '50%';
      markerElement.style.border = '2px solid #FFFFFF';
      markerElement.style.cursor = 'pointer';
      markerElement.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
      
      // Set color based on type
      markerElement.style.backgroundColor = point.type === 'center' ? '#dc2626' : '#2563eb';
      
      // Add click handler
      markerElement.addEventListener('click', () => {
        if (onPointPress) {
          onPointPress(point);
        }
      });

      // Create marker and add to map
      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat([point.longitude, point.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`<h3>${point.name}</h3><p>Type: ${point.type}</p>`)
        )
        .addTo(map.current!);

      markers.current.push(marker);
    });
  }, [points, onPointPress]);

  return <div ref={mapContainer} style={{ width: '100vw', height: '100vh' }} />
};