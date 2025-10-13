import { Stack } from 'expo-router'
import { useContext } from 'react'
import { UserContext } from 'components'
import { OnboardingProvider } from 'components/contexts/OnboardingProvider'

export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </OnboardingProvider>
  )
}
