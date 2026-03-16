/**
 * tokenStorage.ts
 *
 * Om Sri Chinmaya Sadgurave Namaha. Om Sri Gurubyo Namaha.
 * @author Abhiram Ramachandran
 * @date December 30, 2025
 * @description Native-only token storage using AsyncStorage.
 * Web uses tokenStorage.web.ts (resolved automatically by Metro/webpack).
 */

import AsyncStorage from '@react-native-async-storage/async-storage'

const TOKEN_KEY = '@auth_token'

/**
 * Store JWT token in AsyncStorage
 * @param token - JWT token string
 */
export const setStoredToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token)
  } catch (error) {
    if (__DEV__) console.error('Error storing token:', error)
  }
}

/**
 * Retrieve JWT token from AsyncStorage
 * @returns JWT token string or null if not found
 */
export const getStoredToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY)
  } catch (error) {
    if (__DEV__) console.error('Error retrieving token:', error)
    return null
  }
}

/**
 * Remove JWT token from AsyncStorage
 */
export const removeStoredToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY)
  } catch (error) {
    if (__DEV__) console.error('Error removing token:', error)
  }
}

/**
 * Check if a valid token exists in storage
 * @returns boolean indicating if token exists
 */
export const hasStoredToken = async (): Promise<boolean> => {
  try {
    const token = await getStoredToken()
    return token !== null && token.length > 0
  } catch (error) {
    if (__DEV__) console.error('Error checking for token:', error)
    return false
  }
}
