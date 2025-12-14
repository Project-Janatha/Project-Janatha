import { View, Text, Pressable, SafeAreaView } from 'react-native'
import React, { useState } from 'react'
import { useOnboarding } from '../contexts'

export default function Step4() {
  const { goToNextStep } = useOnboarding()
  const [memberType, setMemberType] = useState<string>('')
  // TODO: set user member type in context + implement verifcation for Sevak and Bramacharya/Acharya
  const [error, setError] = useState<string | null>(null)

  const memberTypes = [
    { memberType: 'CHYK', description: 'Students and young adults (18-35)' },
    { memberType: 'Sevak', description: 'Adult volunteer at your mission center (Invite only)' },
    { memberType: 'Bramacharya/Acharya', description: 'Saandeepany graduates (Invite only)' },
  ]

  const handleContinue = () => {
    if (!memberType) {
      setError('Please select a member type')
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
                Just one last thing
              </Text>
              <Text className="text-lg font-inter text-content/70 dark:text-content-dark/70 text-center">
                Choose what kind of member you are
              </Text>
            </View>

            {/* Member Type Options */}
            <View className="flex-col gap-3 items-center w-full max-w-md self-center">
              {memberTypes.map((option) => {
                const isSelected = memberType === option.memberType
                return (
                  <Pressable
                    key={option.memberType}
                    onPress={() => setMemberType(option.memberType)}
                    className={`w-full px-5 py-5 rounded-2xl border-2 ${
                      isSelected
                        ? 'bg-primary border-primary shadow-lg'
                        : 'bg-muted/50 dark:bg-muted-dark/10 border-transparent shadow-sm'
                    } hover:scale-[1.02] active:scale-95 transition-all duration-150`}
                  >
                    <Text
                      className={`font-inter font-bold text-lg mb-1.5 ${
                        isSelected ? 'text-white' : 'text-content dark:text-content-dark'
                      }`}
                    >
                      {option.memberType}
                    </Text>
                    <Text
                      className={`font-inter text-sm leading-relaxed ${
                        isSelected ? 'text-white/90' : 'text-content/60 dark:text-content-dark/60'
                      }`}
                    >
                      {option.description}
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
            disabled={!memberType}
            className={`w-full max-w-md self-center items-center justify-center rounded-xl py-4 px-8 transition-transform duration-150 ${
              memberType
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
