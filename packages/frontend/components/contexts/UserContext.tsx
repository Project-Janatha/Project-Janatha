/**
 * SearchBar.tsx
 *
 * Om Sri Cinmaya Sadgurave Namaha. Om Sri Gurubyo Namaha.
 * @author Abhiram Ramachandran
 * @date September 5, 2025
 * @description
 *
 * This file exports a UserContext and UserProvider for managing user authentication state.
 *
 * Dependencies:
 * - @rnmapbox/maps: For rendering maps and handling map-related functionalities.
 */

// TODO: Improve upon this file and interface with backend auth system
// TODO: Enable post calls from android and ios to backend server
// TODO: Enable persistent login sessions using cookies or tokens
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Platform } from 'react-native'
import { getStoredToken, setStoredToken, removeStoredToken } from '../utils/tokenStorage'

export interface User {
  username: string
  firstName?: string
  lastName?: string
  email?: string
  centerID?: string
  profileComplete?: boolean
  profileImage?: string
}

interface UserContextType {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>
  signup: (username: string, password: string) => Promise<{ success: boolean; message?: string }>
  logout: () => Promise<void>
  checkUserExists: (username: string) => Promise<boolean>
  setUser: (user: User | null) => void
  getToken: () => Promise<string | null>
  authenticatedFetch: (endpoint: string, options?: RequestInit) => Promise<Response>
  deleteAccount: () => Promise<{ success: boolean; message?: string }>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Base URL for your API - smart detection for all environments
  const getApiUrl = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost'

      // Only use localhost backend if actually on localhost
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:8008'
      }

      // For any remote access (EC2 DNS, IP, or other), use EC2 IP
      return 'http://3.236.142.145'
    }

    // For native mobile apps, always use EC2
    return 'http://3.236.142.145'
  }

  const API_URL = getApiUrl()

  // Check for token on app load
  useEffect(() => {
    let isMounted = true

    const loadUser = async () => {
      try {
        const token = await getStoredToken()
        if (!isMounted) return

        if (token) {
          // Verify token validity with backend
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

          try {
            const response = await fetch(`${API_URL}/api/auth/verify`, {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${token}`,
              },
              signal: controller.signal,
            })

            clearTimeout(timeoutId)

            if (!isMounted) return

            if (response.ok) {
              const data = await response.json()
              setUser(data.user)
            } else {
              // Token invalid, clear it
              await removeStoredToken()
            }
          } catch (verifyError: any) {
            clearTimeout(timeoutId)
            if (!isMounted) return

            console.error('Token verification failed:', verifyError)
            // If timeout or network error, clear token
            if (verifyError.name === 'AbortError') {
              console.error('Token verification timeout - clearing token')
            }
            await removeStoredToken()
          }
        }
      } catch (error) {
        if (!isMounted) return
        console.error('Failed to load user session', error)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }
    loadUser()

    return () => {
      isMounted = false
    }
  }, [])

  const login = async (username: string, password: string) => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    try {
      const response = await fetch(`${API_URL}/api/auth/authenticate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      const data = await response.json()

      if (response.ok && data.token) {
        await setStoredToken(data.token)
        setUser(data.user)
        return { success: true }
      } else {
        return { success: false, message: data.message || 'Invalid credentials' }
      }
    } catch (error: any) {
      clearTimeout(timeoutId)
      console.error('Login error:', error)

      if (error.name === 'AbortError') {
        return { success: false, message: 'Request timeout. Please check your connection.' }
      }
      return { success: false, message: 'Network error. Please try again.' }
    }
  }

  const signup = async (username: string, password: string) => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      const data = await response.json()

      if (response.ok) {
        // Auto-login after signup
        const loginResult = await login(username, password)
        if (!loginResult.success) {
          throw new Error('Signup succeeded but login failed. Please try logging in.')
        }
        return { success: true }
      } else {
        return { success: false, message: data.message || 'Signup failed. Please try again.' }
      }
    } catch (error: any) {
      clearTimeout(timeoutId)
      console.error('Signup error:', error)

      if (error.name === 'AbortError') {
        return { success: false, message: 'Request timeout. Please check your connection.' }
      }
      return { success: false, message: error.message || 'Network error. Please try again.' }
    }
  }

  const logout = async () => {
    try {
      // Optional: Call backend to blacklist token
      const token = await getStoredToken()
      if (token) {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout for logout

        try {
          await fetch(`${API_URL}/api/auth/deauthenticate`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          })
          clearTimeout(timeoutId)
        } catch (fetchError) {
          clearTimeout(timeoutId)
          // Ignore logout errors, still clear local state
          console.error('Logout API error (ignored):', fetchError)
        }
      }
    } catch (error) {
      console.error('Logout error', error)
    } finally {
      // Always clear local state
      await removeStoredToken()
      setUser(null)
    }
  }

  const checkUserExists = async (username: string) => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    try {
      const response = await fetch(`${API_URL}/api/userExistence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error('Failed to check user existence')
      }

      const data = await response.json()
      return data.existence
    } catch (error: any) {
      clearTimeout(timeoutId)
      console.error('Check user existence error:', error)

      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please check your connection.')
      }
      throw new Error('Failed to connect to server. Please try again.')
    }
  }

  /**
   * Make an authenticated API request with JWT token
   * @param endpoint - API endpoint (e.g., '/api/users/profile')
   * @param options - Fetch options (method, body, etc.)
   * @returns Response from the API
   */
  const authenticatedFetch = async (endpoint: string, options: RequestInit = {}) => {
    const token = await getStoredToken()
    if (!token) {
      throw new Error('No authentication token found')
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout for API calls

    try {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      }

      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // Handle token expiration
      if (response.status === 401 || response.status === 403) {
        await removeStoredToken()
        setUser(null)
        throw new Error('Session expired. Please login again.')
      }

      return response
    } catch (error: any) {
      clearTimeout(timeoutId)

      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please check your connection.')
      }
      throw error
    }
  }

  const deleteAccount = async () => {
    try {
      const response = await authenticatedFetch('/api/auth/delete-account', {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        // Clear local state
        await removeStoredToken()
        setUser(null)
        return { success: true, message: 'Account deleted successfully' }
      } else {
        return { success: false, message: data.message || 'Failed to delete account' }
      }
    } catch (error: any) {
      console.error('Delete account error:', error)
      return { success: false, message: error.message || 'Network error. Please try again.' }
    }
  }

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        checkUserExists,
        setUser,
        getToken: getStoredToken,
        authenticatedFetch,
        deleteAccount,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export default UserContext
