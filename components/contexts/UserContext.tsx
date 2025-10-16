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
import React, { createContext, useContext, useState, useEffect } from 'react'
import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'

const storage = {
  getItemAsync: (key: string) => {
    if (Platform.OS === 'web') {
      return Promise.resolve(localStorage.getItem(key))
    }
    return SecureStore.getItemAsync(key)
  },
  setItemAsync: (key: string, value: string) => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value)
      return Promise.resolve()
    }
    return SecureStore.setItemAsync(key, value)
  },
  deleteItemAsync: (key: string) => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key)
      return Promise.resolve()
    }
    return SecureStore.deleteItemAsync(key)
  },
}
const SESSION_KEY = 'user_session'

type User = {
  username: string
  center: number
  points: number
  isVerified: boolean
  verificationLevel: number
  exists: boolean
  isActive: boolean
  id: string
  events: any[]
}

const url = 'http://localhost:8008'

const UserContext = createContext<{
  user: User | null
  setUser: (user: User | null) => void
  isAuthenticated: boolean
  loading: boolean
  error: string | null
  checkUserExists: (username: string) => Promise<boolean>
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  signup: (username: string, password: string) => Promise<void>
}>({
  user: null,
  setUser: () => {},
  isAuthenticated: false,
  loading: false,
  error: null,
  checkUserExists: async () => false,
  login: async () => {},
  logout: async () => {},
  signup: async () => {},
})

export default UserContext

export function UserProvider({ children }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    const loadSession = async () => {
      try {
        const session = await storage.getItemAsync(SESSION_KEY)
        if (session) {
          setUser(JSON.parse(session))
        }
      } catch (error) {
        console.error('Failed to load session:', error)
      } finally {
        setLoading(false)
      }
    }
    loadSession()
  }, [])

  const checkUserExists = async (username: string) => {
    setLoading(true)
    console.log('Checking existence for username:', username)
    const endpoint = `${url}/userExistence`
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: username }),
      })
      const data = await response.json()
      if (response.ok) {
        console.log('User existence response data:', data)
        return data.existence
      } else {
        const errorMessage = data.message || `Request failed with status ${response.status}`
        console.log('Error checking user existence: ', errorMessage)
        setError(errorMessage)
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error("Couldn't fetch from server: ", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const login = async (username: string, password: string) => {
    setLoading(true)
    setError(null)
    const endpoint = `${url}/authenticate`
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      })
      const data = await response.json()
      if (response.ok) {
        const user = data.user
        console.log('Login response data:', data)
        setUser(user)
        await storage.setItemAsync(SESSION_KEY, JSON.stringify(user))
      } else {
        const errorMessage = data.message || `Request failed with status ${response.status}`
        setError(errorMessage) // Set the error state in the context
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error('Login error:', error)
      if (!error.message.includes('Request failed')) {
        setError(error.message)
      }
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Deauths user from backend and clears session.
  const logout = async () => {
    setLoading(true)
    const endpoint = `${url}/deauthenticate`
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
      })
      if (response.ok) {
        setUser(null)
        await storage.deleteItemAsync(SESSION_KEY) // Clears stored session
        setError(null)
      }
      throw new Error('Logout failed')
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }
  // TODO: Implement signup function with onboarding flow
  const signup = async (username: string, password: string) => {
    setLoading(true)
    try {
      const endpoint = `${url}/register`
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username, password: password }),
      })
      const data = await response.json()
      if (response.ok) {
        await login(username, password)
      }
      throw new Error('Signup failed:', data.message)
    } catch (error) {
      console.error('Signup error:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated: !!user,
        loading,
        error,
        checkUserExists,
        login,
        logout,
        signup,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}
