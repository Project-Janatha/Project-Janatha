import { View, Animated } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { OnboardingProvider, useOnboarding } from 'components/contexts'
import { useEffect, useRef } from 'react'
import { Step1, Step2, Step3, Step4, Step5 } from '../components/onboarding'

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
            backgroundColor: '#f97316',
          }}
        />
      </View>
    </View>
  )
}

const OnboardingContent = () => {
  const { currentStep } = useOnboarding()

  switch (currentStep) {
    case 1:
      return <Step1 />
    case 2:
      return <Step2 />
    case 3:
      return <Step3 />
    case 4:
      return <Step4 />
    case 5:
      return <Step5 />
    default:
      return <Step1 />
  }
}

export default function Onboarding() {
  return (
    <OnboardingProvider>
      <SafeAreaView className="flex-1 bg-white dark:bg-neutral-900">
        <OnboardingHeader />
        <OnboardingContent />
      </SafeAreaView>
    </OnboardingProvider>
  )
}
