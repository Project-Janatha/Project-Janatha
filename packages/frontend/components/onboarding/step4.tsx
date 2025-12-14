import { View, Text, Pressable, SafeAreaView } from 'react-native'
import React, { useState } from 'react'
import { useOnboarding } from '../contexts'

export default function Step4() {
  const { goToNextStep, interests, setInterests } = useOnboarding()
  const [error, setError] = useState<string | null>(null)
  const interestOptions = [
    'Satsangs',
    'Bhiksha',
    'Global Events',
    'Local Events',
    'Casual',
    'Formal',
  ]

  const handleSelectInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter((i) => i !== interest))
    } else {
      setInterests([...interests, interest])
    }
  }

  const handleContinue = () => {
    if (interests.length === 0) {
      setError('Please select at least one interest')
      return
    }
    goToNextStep()
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-neutral-900">
      <View className="max-w-[720px] w-full flex-1 self-center px-6">
        <View className="flex-1 justify-center">
          <View className="w-full">
            {/* Header */}
            <View className="mb-8">
              <Text className="text-4xl font-inter font-bold text-content dark:text-content-dark text-center mb-3">
                What are your interests?
              </Text>
              <Text className="text-lg font-inter text-content/70 dark:text-content-dark/70 text-center">
                Select topics that interest you to personalize your experience.
              </Text>
            </View>

            {/* Interest Options */}
            <View className="flex-row flex-wrap justify-center gap-3">
              {interestOptions.map((option) => {
                const isSelected = interests.includes(option)
                return (
                  <Pressable
                    key={option}
                    onPress={() => handleSelectInterest(option)}
                    className={`px-6 py-3.5 rounded-full border-2 ${
                      isSelected
                        ? 'bg-primary border-primary shadow-lg'
                        : 'bg-muted/50 dark:bg-muted-dark/10 border-transparent shadow-sm'
                    } hover:scale-105 active:scale-95 transition-all duration-150`}
                  >
                    <Text
                      className={`font-inter font-semibold text-base ${
                        isSelected ? 'text-white' : 'text-content/80 dark:text-content-dark/80'
                      }`}
                    >
                      {option}
                    </Text>
                  </Pressable>
                )
              })}
            </View>

            {/* Error Message */}
            {error && (
              <View className="w-full max-w-md self-center mt-4 bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
                <Text className="text-red-600 dark:text-red-400 font-inter text-center">
                  {error}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Button */}
        <View className="pb-6">
          <Pressable
            onPress={handleContinue}
            disabled={interests.length === 0}
            className={`w-full max-w-md self-center items-center justify-center rounded-xl py-4 px-8 transition-transform duration-150 ${
              interests.length > 0
                ? 'bg-primary active:bg-primary-press hover:scale-105 active:scale-95'
                : 'bg-primary/50'
            }`}
          >
            <Text className="text-white font-inter font-semibold text-base">Continue</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  )
}
