import { Stack } from 'expo-router'
import { OnboardingProvider, useOnboarding } from 'components/contexts'
import { View, Animated } from 'react-native'
import { useEffect, useRef } from 'react'

const OnboardingHeader = () => {
  const { currentStep, totalSteps } = useOnboarding()
  const progress = ((currentStep - 1) / totalSteps) * 100

  const animatedWidth = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start()
  }, [progress])

  return (
    <View className="p-6 bg-white dark:bg-neutral-900">
      <View className="max-w-[720px] w-full h-1 rounded bg-gray-200 dark:bg-neutral-800 self-center overflow-hidden">
        <Animated.View
          style={{
            width: animatedWidth.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
            height: '100%',
            backgroundColor: '#f97316', // Your primary color
          }}
        />
      </View>
    </View>
  )
}

export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <Stack
        screenOptions={{
          animation: 'slide_from_right',
          gestureEnabled: false,
          header: () => <OnboardingHeader />,
        }}
      />
    </OnboardingProvider>
  )
}
