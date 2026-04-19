import { useEffect } from 'react'
import { useRouter } from 'expo-router'

export default function SettingsFallback() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/settings')
  }, [])

  return null
}
