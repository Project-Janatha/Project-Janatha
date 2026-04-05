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
const REFRESH_TOKEN_KEY = '@refresh_token'

export const setStoredToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token)
  } catch (error) {
    if (__DEV__) console.error('Error storing token:', error)
  }
}

export const getStoredToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY)
  } catch (error) {
    if (__DEV__) console.error('Error retrieving token:', error)
    return null
  }
}

export const removeStoredToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY)
    await AsyncStorage.removeItem(REFRESH_TOKEN_KEY)
  } catch (error) {
    if (__DEV__) console.error('Error removing token:', error)
  }
}

export const hasStoredToken = async (): Promise<boolean> => {
  try {
    const token = await getStoredToken()
    return token !== null && token.length > 0
  } catch (error) {
    if (__DEV__) console.error('Error checking for token:', error)
    return false
  }
}

export const setStoredRefreshToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, token)
  } catch (error) {
    if (__DEV__) console.error('Error storing refresh token:', error)
  }
}

export const getStoredRefreshToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(REFRESH_TOKEN_KEY)
  } catch (error) {
    if (__DEV__) console.error('Error retrieving refresh token:', error)
    return null
  }
}
