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

export default function Map(props: any) {
  return (<MapView    
        style={styles.map} 
        initialRegion={getCurrentPosition()}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        scrollEnabled={true}
        zoomEnabled={true}
        pitchEnabled={true}
        rotateEnabled={true}>
      </MapView>)
};