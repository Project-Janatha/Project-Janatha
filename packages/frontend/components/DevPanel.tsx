import React, { useContext } from 'react'
import { View, Text, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { UserContext, useUser } from './contexts'

export default function DevPanel({ visible, onClose }) {
  const router = useRouter()
  const { setUser } = useUser()

  if (!visible) return null

  const handleGoToHome = () => {
    setUser({
      id: 'dev',
      username: 'devuser@example.com',
      center: -1,
      points: 0,
      isVerified: false,
      verificationLevel: 0,
      exists: true,
      isActive: true,
      events: [],
      // add any other fields your app expects
    })
    router.push('/')
  }

  const handleGoToOnboarding = () => {
    setUser({
      id: 'dev',
      username: 'devuser@example.com',
      center: -1,
      points: 0,
      isVerified: false,
      verificationLevel: 0,
      exists: true,
      isActive: true,
      events: [],
      // add any other fields your app expects
    })
    router.push('/onboarding')
  }

  return (
    <View
      className="absolute left-1/2 -translate-x-1/2 mt-2 z-50 bg-white dark:bg-neutral-900 rounded-xl shadow-lg p-6 flex flex-col gap-4"
      style={{ minWidth: 220 }}
    >
      <View className="flex-row justify-between items-center mb-2">
        <Text className="font-inter font-bold text-lg text-content dark:text-content-dark">
          Dev Panel
        </Text>
        <Pressable
          className="ml-2 px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-neutral-800"
          onPress={onClose}
        >
          <Text className="text-lg font-bold text-gray-500 dark:text-gray-300">×</Text>
        </Pressable>
      </View>
      <Pressable
        className="bg-primary rounded-lg px-4 py-2 active:opacity-80"
        onPress={handleGoToHome}
      >
        <Text className="text-white font-inter font-medium">Go to Home</Text>
      </Pressable>
      <Pressable
        className="bg-primary rounded-lg px-4 py-2 active:opacity-80"
        onPress={handleGoToOnboarding}
      >
        <Text className="text-white font-inter font-medium">Go to Onboarding</Text>
      </Pressable>
    </View>
  )
}
