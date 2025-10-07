import { Stack } from 'expo-router';
import { useContext } from 'react';
import { UserContext } from 'components';
import { OnboardingProvider } from 'components/providers/OnboardingProvider';

export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </OnboardingProvider>
  );
}