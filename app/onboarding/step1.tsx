import { View, Text, Pressable, TextInput } from 'react-native'
import { useOnboarding } from 'components/contexts'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState } from 'react'

export default function StepOne() {
  const { goToNextStep, firstName, setFirstName, lastName, setLastName } = useOnboarding()
  const [focusedField, setFocusedField] = useState<'first' | 'last' | null>(null)

  const handleContinue = () => {
    setFirstName(firstName.trim())
    setLastName(lastName.trim())
    goToNextStep()
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-neutral-900">
      <View className="max-w-[720px] w-full flex-1 self-center px-6">
        {/* Content Area */}
        <View className="flex-1 justify-center items-center">
          <View className="gap-4 w-full">
            <View className="gap-2">
              <Text className="text-4xl font-inter font-bold text-content dark:text-content-dark text-center">
                Welcome to Janata!
              </Text>
              <Text className="text-lg font-inter text-content/70 dark:text-content-dark/70 text-center">
                Enter your name to get started with your journey.
              </Text>
            </View>

            {/* Input Fields */}
            <View className="gap-3 mt-8 w-full items-center">
              <TextInput
                className={`text-content dark:text-content-dark w-full max-w-md font-inter rounded-xl px-4 py-4 text-base bg-muted/50 dark:bg-muted-dark/10 border-2 outline-none ${
                  focusedField === 'first' ? 'border-primary' : 'border-transparent'
                } placeholder:text-gray-400 dark:placeholder:text-gray-500`}
                placeholder="First Name"
                value={firstName}
                onChangeText={setFirstName}
                onFocus={() => setFocusedField('first')}
                onBlur={() => setFocusedField(null)}
                placeholderTextColor="#9ca3af"
                autoCapitalize="words"
                autoComplete="given-name"
                autoCorrect={false}
              />
              <TextInput
                className={`text-content dark:text-content-dark w-full max-w-md font-inter rounded-xl px-4 py-4 text-base bg-muted/50 dark:bg-muted-dark/10 border-2 outline-none ${
                  focusedField === 'last' ? 'border-primary' : 'border-transparent'
                } placeholder:text-gray-400 dark:placeholder:text-gray-500`}
                placeholder="Last Name"
                value={lastName}
                onChangeText={setLastName}
                onFocus={() => setFocusedField('last')}
                onBlur={() => setFocusedField(null)}
                placeholderTextColor="#9ca3af"
                autoCapitalize="words"
                autoComplete="family-name"
                autoCorrect={false}
              />
            </View>
          </View>
        </View>

        {/* Button Area */}
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
