import React from 'react'
import { View, Text } from 'react-native'
import { useRouter } from 'expo-router'

export default function LandingPage() {
  const router = useRouter()

  React.useEffect(() => {
    router.replace('/auth')
  }, [])

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Redirecting...</Text>
    </View>
  )
}
