/**
 * locationServices.js
 * 
 * Om Sri Cinmaya Sadgurave Namaha. Om Sri Gurubyo Namaha.
 * Authors: Sahanav Sai Ramesh, Abhiram Ramachandran
 * Date Authored: August 27, 2025
 * Last Date Modified: September 3, 2025
 * Frontend geolocation methods in Expo.
 */

import { Platform } from 'react-native';

const defaultLocation: [number, number] = [32.17654435811957, 76.3594513732331]; // Default loc - Saandeepany

/**
 * Gets location access.
 * @return {boolean} A boolean representing if location access is present or not.
 */
async function getLocationAccess()
{
    if (Platform.OS === 'web') {
        // For web, we'll assume permission is granted since we use browser geolocation
        return true;
    }
    
    // Only import expo-location on native platforms
    const Location = await import('expo-location');
    let {status} = await Location.requestForegroundPermissionsAsync();
    return status == 'granted';
}
/**w
 * Gets the current position.
 * @return {Array[number]} If no permission is granted, returns an empty array. Else, returns the current position of the user, as an array of length 2, in the form [latitude, longitude]
 */
async function getCurrentPosition()
{
    // TODO: figure out location services for web
    if (Platform.OS === 'web') {
      // Use browser's Geolocation API
      return new Promise((resolve) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => resolve([position.coords.longitude, position.coords.latitude]),
                    () => resolve(defaultLocation)
                );
            } else {
                resolve(defaultLocation);
            }
        });
    } else {
        if(await getLocationAccess()){
            // Only import expo-location on native platforms
            const Location = await import('expo-location');
            let loc = await Location.getCurrentPositionAsync();
            return [loc.coords.latitude, loc.coords.longitude];
        }else{
            return [];
        }
    }
}

export {getLocationAccess, getCurrentPosition};