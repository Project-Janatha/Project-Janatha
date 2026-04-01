/**
 * locationServices.js
 *
 * Om Sri Cinmaya Sadgurave Namaha. Om Sri Gurubyo Namaha.
 * Authors: Sahanav Sai Ramesh, Abhiram Ramachandran
 * Date Authored: August 27, 2025
 * Last Date Modified: September 3, 2025
 * Frontend geolocation methods in Expo.
 */

import { Platform } from 'react-native'

/**
 * Gets location access.
 * @return {boolean} A boolean representing if location access is present or not.
 */
async function getLocationAccess() {
  if (Platform.OS === 'web') {
    // For web, we'll assume permission is granted since we use browser geolocation
    return true
  }

  // Only import expo-location on native platforms
  const Location = await import('expo-location')
  let { status } = await Location.requestForegroundPermissionsAsync()
  return status == 'granted'
}
/**w
 * Gets the current position.
 * @return {Array[number]} If no permission is granted, returns an empty array. Else, returns the current position of the user, as an array of length 2, in the form [latitude, longitude]
 */
async function getCurrentPosition() {
  if (Platform.OS === 'web') {
    // Use browser's Geolocation API
    return new Promise<[number, number] | []>((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            // Return [longitude, latitude] for consistency with maps
            resolve([position.coords.longitude, position.coords.latitude])
          },
          () => {
            // Return empty array so callers can apply their own fallback
            resolve([])
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000,
          }
        )
      } else {
        resolve([])
      }
    })
  } else {
    if (await getLocationAccess()) {
      // Only import expo-location on native platforms
      const Location = await import('expo-location')
      let loc = await Location.getCurrentPositionAsync()
      // Return [longitude, latitude] for consistency
      return [loc.coords.longitude, loc.coords.latitude]
    } else {
      return []
    }
  }
}

export { getLocationAccess, getCurrentPosition }
