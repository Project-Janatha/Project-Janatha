import React from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { MapPin } from 'lucide-react-native'

type MapPreviewProps = {
  onPress?: () => void
  pointCount?: number
}

/**
 * Lightweight static map preview - no Leaflet, just a visual placeholder
 * This prevents multiple heavy map instances from rendering simultaneously
 */
export const MapPreview: React.FC<MapPreviewProps> = ({ onPress, pointCount = 0 }) => {
  return (
    <Pressable onPress={onPress} style={styles.container} className="bg-card dark:bg-card-dark">
      <View style={styles.content}>
        <MapPin size={48} color="#0ea5e9" />
        <Text className="text-content dark:text-content-dark font-inter text-lg font-semibold mt-4">
          Explore Map
        </Text>
        <Text className="text-content-secondary dark:text-content-secondary-dark font-inter text-sm mt-2">
          {pointCount > 0 ? `${pointCount} locations nearby` : 'Tap to view interactive map'}
        </Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  content: {
    alignItems: 'center',
    padding: 20,
  },
})
