import { Stack } from 'expo-router'
import { useContext } from 'react'
import { UserContext } from 'components/contexts'
import { OnboardingProvider } from 'components/contexts'

export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </OnboardingProvider>
  )
}
