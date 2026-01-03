/**
 * tokenStorage.ts
 *
 * Om Sri Chinmaya Sadgurave Namaha. Om Sri Gurubyo Namaha.
 * @author Abhiram Ramachandran
 * @date December 30, 2025
 * @description Utility functions for storing and retrieving JWT tokens
 */

import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'

const TOKEN_KEY = '@auth_token'

// Helper to set cookie
const setCookie = (name: string, value: string, days: number) => {
  if (typeof document === 'undefined') return
  let expires = ''
  if (days) {
    const date = new Date()
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
    expires = '; expires=' + date.toUTCString()
  }
  document.cookie = name + '=' + (value || '') + expires + '; path=/'
}

// Helper to get cookie
const getCookie = (name: string) => {
  if (typeof document === 'undefined') return null
  const nameEQ = name + '='
  const ca = document.cookie.split(';')
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ') c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
  }
  return null
}

// Helper to erase cookie
const eraseCookie = (name: string) => {
  if (typeof document === 'undefined') return
  document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
}

/**
 * Store JWT token in AsyncStorage (Native) or localStorage/Cookies (Web)
 * @param token - JWT token string
 */
export const setStoredToken = async (token: string): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        // Try localStorage first
        try {
          localStorage.setItem(TOKEN_KEY, token)
        } catch (e) {
          // Ignore localStorage errors
        }
        // Also set cookie as backup for ITP
        setCookie(TOKEN_KEY, token, 7)
      }
    } else {
      await AsyncStorage.setItem(TOKEN_KEY, token)
    }
  } catch (error) {
    console.error('Error storing token:', error)
  }
}

/**
 * Retrieve JWT token from AsyncStorage (Native) or localStorage/Cookies (Web)
 * @returns JWT token string or null if not found
 */
export const getStoredToken = async (): Promise<string | null> => {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        // Try localStorage
        try {
          const localToken = localStorage.getItem(TOKEN_KEY)
          if (localToken) return localToken
        } catch (e) {
          // Ignore localStorage errors
        }

        // Fallback to cookie
        return getCookie(TOKEN_KEY)
      }
      return null
    } else {
      return await AsyncStorage.getItem(TOKEN_KEY)
    }
  } catch (error) {
    console.error('Error retrieving token:', error)
    return null
  }
}

/**
 * Remove JWT token from AsyncStorage (Native) or localStorage/Cookies (Web)
 */
export const removeStoredToken = async (): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem(TOKEN_KEY)
        } catch (e) {}
        eraseCookie(TOKEN_KEY)
      }
    } else {
      await AsyncStorage.removeItem(TOKEN_KEY)
    }
  } catch (error) {
    console.error('Error removing token:', error)
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
    console.error('Error checking for token:', error)
    return false
  }
}
