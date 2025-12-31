/**
 * AuthenticatedAPIExample.tsx
 *
 * Om Sri Chinmaya Sadgurave Namaha. Om Sri Gurubyo Namaha.
 * @author Abhiram Ramachandran
 * @date December 30, 2025
 * @description Example component showing how to use authenticated API calls with JWT tokens
 *
 * This file demonstrates the proper way to make authenticated API requests
 * using the UserContext's authenticatedFetch method.
 */

import React, { useContext, useState } from 'react'
import { View, Text, Pressable } from 'react-native'
import { useUser } from '../contexts'

/**
 * Example component demonstrating authenticated API calls
 */
export const AuthenticatedAPIExample = () => {
  const { authenticatedFetch, user } = useUser()
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  /**
   * Example: Fetch user profile data
   */
  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await authenticatedFetch('/api/users/profile', {
        method: 'GET',
      })

      const result = await response.json()
      setData(result)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Example: Update user profile
   */
  const updateUserProfile = async (updates: any) => {
    try {
      setLoading(true)
      setError(null)

      const response = await authenticatedFetch('/api/auth/update-profile', {
        method: 'PUT',
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      const result = await response.json()
      setData(result)
    } catch (err: any) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Example: Fetch centers list
   */
  const fetchCenters = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await authenticatedFetch('/api/centers', {
        method: 'GET',
      })

      const result = await response.json()
      setData(result)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch centers')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="p-4">
      <Text className="text-xl font-bold mb-4">Authenticated API Examples</Text>

      {user && (
        <View className="mb-4">
          <Text className="text-sm text-gray-600">Logged in as: {user.username}</Text>
        </View>
      )}

      <View className="gap-2">
        <Pressable
          onPress={fetchUserProfile}
          disabled={loading}
          className="bg-blue-500 p-3 rounded-lg"
        >
          <Text className="text-white text-center">Fetch Profile</Text>
        </Pressable>

        <Pressable
          onPress={() =>
            updateUserProfile({ firstName: 'John', lastName: 'Doe', phoneNumber: '1234567890' })
          }
          disabled={loading}
          className="bg-green-500 p-3 rounded-lg"
        >
          <Text className="text-white text-center">Update Profile</Text>
        </Pressable>

        <Pressable
          onPress={fetchCenters}
          disabled={loading}
          className="bg-purple-500 p-3 rounded-lg"
        >
          <Text className="text-white text-center">Fetch Centers</Text>
        </Pressable>
      </View>

      {loading && <Text className="mt-4 text-center">Loading...</Text>}

      {error && (
        <View className="mt-4 bg-red-100 p-3 rounded-lg">
          <Text className="text-red-700">{error}</Text>
        </View>
      )}

      {data && (
        <View className="mt-4 bg-gray-100 p-3 rounded-lg">
          <Text className="font-bold mb-2">Response:</Text>
          <Text className="text-xs">{JSON.stringify(data, null, 2)}</Text>
        </View>
      )}
    </View>
  )
}
