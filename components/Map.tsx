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
import MapView, { Marker } from "react-native-maps";
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
 * @return {JSX.Element} A Map component that displays a map using react-native-maps with markers.
 */
export default function Map({ points = [], onPointPress }: MapProps) {
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

  const getMarkerColor = (type: string) => {
    return type === 'center' ? '#dc2626' : '#2563eb'; // Red for centers, blue for events
  };

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
    >
      {points.map((point) => (
        <Marker
          key={point.id}
          coordinate={{
            latitude: point.latitude,
            longitude: point.longitude,
          }}
          title={point.name}
          pinColor={getMarkerColor(point.type)}
          onPress={() => onPointPress && onPointPress(point)}
        />
      ))}
    </MapView>
  );
};