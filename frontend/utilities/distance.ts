/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in miles
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 3959 // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Find the nearest location from a user's coordinates
 * @param userLat User's latitude
 * @param userLon User's longitude
 * @param locations Array of locations with latitude and longitude
 * @returns Object containing the nearest location and distance
 */
export const findNearestLocation = <T extends { latitude: number; longitude: number }>(
  userLat: number,
  userLon: number,
  locations: T[]
): { location: T; distance: number } | null => {
  if (locations.length === 0) return null

  let nearest = locations[0]
  let minDistance = calculateDistance(
    userLat,
    userLon,
    locations[0].latitude,
    locations[0].longitude
  )

  locations.forEach((location) => {
    const distance = calculateDistance(userLat, userLon, location.latitude, location.longitude)
    if (distance < minDistance) {
      minDistance = distance
      nearest = location
    }
  })

  return { location: nearest, distance: minDistance }
}

/**
 * Convert distance from miles to kilometers
 * @param miles Distance in miles
 * @returns Distance in kilometers
 */
export const milesToKilometers = (miles: number): number => {
  return miles * 1.60934
}

/**
 * Convert distance from kilometers to miles
 * @param kilometers Distance in kilometers
 * @returns Distance in miles
 */
export const kilometersToMiles = (kilometers: number): number => {
  return kilometers * 0.621371
}
