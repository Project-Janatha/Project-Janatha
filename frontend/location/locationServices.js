/**
 * locationServices.js
 * 
 * Om Sri Cinmaya Sadgurave Namaha. Om Sri Gurubyo Namaha.
 * Author: Sahanav Sai Ramesh
 * Date Authored: August 27, 2025
 * Last Date Modified: August 27, 2025
 * Frontend geolocation methods in Expo.
 */

import * as Location from 'expo-location'
/**
 * Gets location access.
 * @return {boolean} A boolean representing if location access is present or not.
 */
async function getLocationAccess()
{
    let {status} = await Location.requestForegroundPermissionsAsync();
    return status == 'granted';
}
/**
 * Gets the current position.
 * @return {Array[number]} If no permission is granted, returns an empty array. Else, returns the current position of the user, as an array of length 2, in the form [latitude, longitude]
 */
async function getCurrentPosition()
{
    if(getLocationAccess()){
        let loc = await Location.getCurrentPositionAsync();
        return [loc.coords.latitude, loc.coords.longitude];
    }else{
        return [];
    }
}

export {getLocationAccess, getCurrentPosition};