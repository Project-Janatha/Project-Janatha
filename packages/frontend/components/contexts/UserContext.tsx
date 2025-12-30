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
import * as SecureStore from 'expo-secure-store'

// Define the shape of the User object based on your backend response
interface User {
  username: string
  isAdmin?: boolean
  // Add other user properties here
}

interface UserContextType {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<boolean>
  signup: (username: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  checkUserExists: (username: string) => Promise<boolean>
  setUser: (user: User | null) => void
  getToken: () => Promise<string | null> // Helper to get token for other components
}

export const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  login: async () => false,
  signup: async () => false,
  logout: async () => {},
  checkUserExists: async () => false,
  setUser: () => {},
  getToken: async () => null,
})

// Helper for storage abstraction (Web vs Native)
const TOKEN_KEY = 'user_jwt'

const setStoredToken = async (token: string) => {
  if (Platform.OS === 'web') {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    await SecureStore.setItemAsync(TOKEN_KEY, token)
  }
}

const getStoredToken = async () => {
  if (Platform.OS === 'web') {
    return localStorage.getItem(TOKEN_KEY)
  } else {
    return await SecureStore.getItemAsync(TOKEN_KEY)
  }
}

const removeStoredToken = async () => {
  if (Platform.OS === 'web') {
    localStorage.removeItem(TOKEN_KEY)
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY)
  }
}

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Base URL for your API
  // Replace with your actual EC2 IP or localhost for dev
  const API_URL = 'http://ec2-3-236-142-145.compute-1.amazonaws.com'

  // Check for token on app load
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await getStoredToken()
        if (token) {
          // Optional: Verify token validity with backend here
          // For now, we assume if token exists, we try to fetch user profile
          // You might need a specific endpoint like /api/auth/me
          // If you don't have a /me endpoint yet, you might rely on stored user data
          // or just let the first API call fail with 401 to trigger logout
        }
      } catch (error) {
        console.error('Failed to load user session', error)
      } finally {
        setLoading(false)
      }
    }
    loadUser()
  }, [])

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/authenticate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok && data.token) {
        await setStoredToken(data.token)
        setUser(data.user)
        return true
      } else {
        console.error('Login failed:', data.message)
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const signup = async (username: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok) {
        // Auto-login after signup
        const loginSuccess = await login(username, password)
        if (!loginSuccess) {
          throw new Error('Signup succeeded but login failed. Please try logging in.')
        }
        return true
      } else {
        throw new Error(data.message || 'Signup failed. Please try again.')
      }
    } catch (error: any) {
      console.error('Signup error:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      // Optional: Call backend to blacklist token
      const token = await getStoredToken()
      if (token) {
        await fetch(`${API_URL}/api/auth/deauthenticate`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
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
    try {
      const response = await fetch(`${API_URL}/api/userExistence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      })
      const data = await response.json()
      return data.existence
    } catch (error) {
      console.error('Check user existence error:', error)
      return false
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
      }}
    >
      {children}
    </UserContext.Provider>
  )
}
