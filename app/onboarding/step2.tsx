import { View, Text, Pressable, Animated, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useOnboarding } from 'components/contexts'
import { useState, useEffect, useRef } from 'react'
import { useThemeContext } from 'components/contexts'

// --- NEW: Import the universal BirthdatePicker component ---
// React Native will automatically choose .native.js or .web.js
import BirthdatePicker from 'components/BirthdatePicker.web'
import { set } from 'react-datepicker/dist/date_utils'

export default function Step2() {
  const { goToNextStep, birthdate, setBirthdate } = useOnboarding()

  const handleContinue = () => {
    goToNextStep()
  }

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark">
      <View className="max-w-[720px] w-full flex-1 self-center px-6">
        {/* --- Main Content --- */}
        <View className="flex-1 flex flex-col items-center justify-center w-full">
          <View className="gap-4 w-full max-w-md flex flex-col items-center justify-center">
            <View className="gap-2 w-full flex flex-col items-center justify-center">
              <Text className="text-4xl font-inter font-bold text-content dark:text-content-dark text-center">
                When's your birthday?
              </Text>
              <Text className="text-lg font-inter text-content/70 dark:text-content-dark/70 text-center">
                We'll use this to personalize your experience.
              </Text>
            </View>
            <View className="mt-8 w-full flex items-center justify-center">
              <BirthdatePicker value={birthdate || new Date(2000, 0, 1)} onChange={setBirthdate} />
            </View>
          </View>
        </View>

        {/* --- Continue Button --- */}
        <View className="pb-6">
          <Pressable
            onPress={handleContinue}
            className="w-full max-w-md self-center items-center justify-center rounded-xl bg-primary active:bg-primary-press py-4 px-8"
          >
            <Text className="text-white font-inter font-semibold text-base">Continue</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  )
}
