import { useEffect } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'

export default function EventDetailWeb() {
  const { id } = useLocalSearchParams()
  const router = useRouter()

  useEffect(() => {
    router.replace(`/?detail=event&id=${id}`)
  }, [id, router])

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#E8862A" />
    </View>
  )
}
