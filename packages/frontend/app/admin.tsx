// Fallback for native platforms — admin dashboard is web-only
import { Redirect } from 'expo-router'

export default function AdminFallback() {
  return <Redirect href="/(tabs)" />
}
