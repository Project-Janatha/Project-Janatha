import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { View, Text, Pressable } from 'react-native'
import { useOnboarding } from '../contexts'
import BirthdatePicker from '../BirthdatePicker'

export default function Step2() {
  const { goToNextStep, birthdate, setBirthdate } = useOnboarding()

  // Only true if birthdate is not null
  const isDateSelected = !!birthdate

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
              <Text className="text-lg font-inter text-stone-500 dark:text-stone-400 text-center">
                We'll use this to personalize your experience.
              </Text>
            </View>
            <View className="mt-8 w-full flex items-center justify-center">
              <BirthdatePicker value={birthdate ?? undefined} onChange={setBirthdate} />
            </View>
          </View>
        </View>

        {/* --- Continue Button --- */}
        <View className="pb-6">
          <Pressable
            disabled={!isDateSelected}
            onPress={goToNextStep}
            className={`w-full max-w-md self-center items-center justify-center rounded-xl py-4 px-8
              ${
                !isDateSelected
                  ? 'bg-orange-300'
                  : 'bg-primary active:bg-primary-press'
              }
            `}
          >
            <Text className="text-white font-inter font-semibold text-base">Continue</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  )
}
