/**
 * Map.tsx
 * 
 * Om Sri Cinmaya Sadgurave Namaha. Om Sri Gurubyo Namaha.
 * Author: Abhiram Ramachandran
 * Date Authored: September 2, 2025
 * Last Date Modified: September 2, 2025
 * 
 * This file exports a Map component that integrates with react-native-maps to provide map functionalities for iOS and Android.
 * 
 * Dependencies:
 * - react-native-maps: For rendering maps and handling map-related
 */
import MapView from "react-native-maps";
import { StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import {getCurrentPosition} from 'frontend/location/locationServices';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});

 /**
 * Map Component
 * @param {any} props - Props passed to the Map component.
 * @return {JSX.Element} A Map component that displays a map using react-native-maps.
 */
export default function Map(props: any) {
  const [region, setRegion] = useState<any>(null);

  useEffect(() => {
    getCurrentPosition().then((position: any) => {
      // Ensure position has latitude and longitude
      setRegion({
        latitude: position.latitude,
        longitude: position.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    });
  }, []);

  return (
    <MapView
      style={styles.map}
      initialRegion={region || {
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
      showsUserLocation={true}
      showsMyLocationButton={true}
      showsCompass={true}
      scrollEnabled={true}
      zoomEnabled={true}
      pitchEnabled={true}
      rotateEnabled={true}
    />
  );
};