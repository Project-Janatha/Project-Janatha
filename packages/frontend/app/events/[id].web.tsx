import { useEffect } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'

export default function EventDetailWeb() {
  const { id: rawId } = useLocalSearchParams()
  const id = Array.isArray(rawId) ? rawId[0] : rawId
  const router = useRouter()

  useEffect(() => {
    if (id) {
      router.replace(`/?detail=event&id=${id}`)
    } else {
      router.replace('/')
    }
  }, [id, router])

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#E8862A" />
    </View>
  )
}
