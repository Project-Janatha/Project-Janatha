import { Text} from 'tamagui'
import { StyleSheet, View } from 'react-native';
import MapView from 'react-native-maps'
import { getCurrentPosition } from 'frontend/location/locationServices';

export default function ExploreScreen() {
  return (
    <MapView
    style={styles.map} 
      showsUserLocation={true}
      showsMyLocationButton={true}
      followsUserLocation={true}
      showsCompass={true}
      scrollEnabled={true}
      zoomEnabled={true}
      pitchEnabled={true}
      rotateEnabled={true}>
    </MapView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});
