import { View, Text, Pressable, TextInput } from 'react-native'
import { useOnboarding } from 'components/contexts'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function StepOne() {
  const { goToNextStep } = useOnboarding()

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-neutral-900">
      {/* Main Content: 
        Takes up all space, pushing the button to the bottom.
        Text styles match app/auth.tsx
      */}
      <View className="max-w-[720px] w-full flex-1 self-center">
        <View className="flex-1 justify-center items-center p-8">
          <Text className="text-3xl font-inter font-bold text-content dark:text-content-dark text-center">
            Welcome to Janata!
          </Text>
          <Text className="text-base font-inter text-content dark:text-content-dark opacity-70 text-center mt-3">
            Enter your name to get started with your journey.
          </Text>
          <View className="w-full mt-6">
            <TextInput
              className="bg-gray text-content dark:text-content-dark font-inter rounded-lg px-4 py-3 text-base min-h-[48px] bg-muted/50 dark:bg-muted-dark/10 focus:border-primary focus:outline-none"
              placeholder="Your Name"
            />
            )
          </View>
        </View>

        {/* Button Area: 
        Anchored to the bottom.
      */}
        <View className="p-6 max-w-[720px] w-full self-center">
          {/* This Pressable component and its Text child have classNames
          copied directly from your app/auth.tsx file for consistency.
        */}
          <Pressable
            onPress={goToNextStep}
            className="items-center justify-center mt-2 rounded-2xl bg-primary active:bg-primary-press py-4 px-8"
          >
            <Text className="text-white font-inter font-bold text-md">Get Started</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  )
}
