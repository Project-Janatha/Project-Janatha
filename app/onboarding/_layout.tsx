import { Stack } from 'expo-router'
import { OnboardingProvider, useOnboarding } from 'components/contexts' // Assuming useOnboarding is exported here
import { View, Animated } from 'react-native'
import ThemeSelector from 'components/ThemeSelector'

const OnboardingHeader = () => {
  // Get state from the context
  const { currentStep, totalSteps } = useOnboarding()
  const progress = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0

  return (
    <View className="p-6 bg-white dark:bg-neutral-900">
      {/* Progress Bar */}
      <View className="max-w-[720px] w-full h-1 rounded bg-gray-200 dark:bg-neutral-800 self-center justify-center mt-6">
        <Animated.View
          style={{
            height: 4,
            borderRadius: 2,
            backgroundColor: '#f97316',
            width: `${progress}%`, // Use the calculated progress
          }}
          className="bg-primary"
        />
      </View>
    </View>
  )
}

// 2. Wrap the Stack in the Provider so the header can access the context
export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <View className="flex-1 bg-white dark:bg-neutral-900">
        <Stack
          screenOptions={{
            animation: 'slide_from_right',
            gestureEnabled: false,
            header: () => <OnboardingHeader />,
          }}
        />
      </View>
    </OnboardingProvider>
  )
}
