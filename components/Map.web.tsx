/**
 * Map.web.tsx
 * 
 * Om Sri Cinmaya Sadgurave Namaha. Om Sri Gurubyo Namaha.
 * Author: Abhiram Ramachandran
 * Date Authored: September 2, 2025
 * Last Date Modified: September 2, 2025
 * 
 * This file exports a Map component that integrates with react-native-maps to provide map functionalities for Web.
 * 
 * Dependencies:
 * - mapboxgl: For rendering maps and handling map-related functionalities.
 */
import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { StyleSheet } from "react-native";
import {getCurrentPosition} from 'frontend/location/locationServices';

mapboxgl.accessToken = "pk.eyJ1IjoicHJvamVjdC1qYW5hdGhhIiwiYSI6ImNtZjNkencybzBkYmgya3E0YXM0cmx6cHYifQ.81rjpzlsaDzLcz5P-GUXQw";

// const styles = StyleSheet.create({
//   page: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#F5FCFF"
//   },
//   container: {
//     height: 300,
//     width: 300,
//     backgroundColor: "tomato"
//   },
//   map: {
//     flex: 1
//   }
// });

/**
 * Map Component
 * @param {any} props - Props passed to the Map component.
 * @return {JSX.Element} A Map component that displays a map using mapboxgl.
 */
export default function Map(props: any) {
  const mapContainer = useRef(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (map.current) return; // Initialize map only once

      const defaultCenter: [number, number] = [76.3594513732331, 32.17654435811957]; // Default loc - Saandeepany

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v11", // Or your custom style
        center: defaultCenter, // TODO: replace with getCurrentPosition()
        zoom: 9 // Starting zoom
      });

      map.current.addControl(
        new mapboxgl.GeolocateControl(
          {
            trackUserLocation: true,
            showUserHeading: true
          }
        ));

      //Update center with user loc
      getCurrentPosition().then((center) => {
        if (center && Array.isArray(center) && center.length === 2) {
        map.current!.setCenter(center);
        }
      });
}, []);

  return <div ref={mapContainer} style={{ width: '100vw', height: '100vh' }} />
};