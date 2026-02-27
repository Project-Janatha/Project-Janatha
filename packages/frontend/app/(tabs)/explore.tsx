// Disabled: Explore tab merged into unified Discover tab (B3 design)
// This file is kept in place because expo-router requires it for the tab route to exist.

import React from 'react'
import { View, Text } from 'react-native'
import { useRouter } from 'expo-router'

export default function ExploreScreen() {
  const router = useRouter()

  React.useEffect(() => {
    // Redirect to Discover tab if someone navigates here directly
    router.replace('/')
  }, [router])

  return (
    <View className="flex-1 justify-center items-center bg-background dark:bg-background-dark">
      <Text className="text-content dark:text-content-dark font-inter">Redirecting...</Text>
    </View>
  )
}
