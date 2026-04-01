import { View, Text } from 'react-native'
import { useRouter } from 'expo-router'
import { useEffect } from 'react'

export default function AdminFallback() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/(tabs)')
  }, [router])

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Admin is only available on web.</Text>
    </View>
  )
}
