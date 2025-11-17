import { Stack } from 'expo-router'
import { useContext, useEffect, useState, useRef } from 'react'
import { UserContext, useThemeContext } from 'components/contexts'
import { OnboardingProvider } from 'components/contexts'
import StepOne from '../onboarding/step1'
import StepTwo from '../onboarding/step2'
import StepThree from '../onboarding/step3'
import { Animated, View, Dimensions, Text, Pressable, useColorScheme } from 'react-native'
import { Sun, Moon, Monitor } from 'lucide-react-native'
const width = Dimensions.get('window').width

export default function OnboardingLayout() {
  const steps = [<StepOne />, <StepTwo />, <StepThree />]
  const { themePreference, setThemePreference, isDark } = useThemeContext()
  const themeOptions = ['light', 'dark', 'system']
  const optionWidth = 70
  const indicatorPadding = 8
  const [currentStep, setCurrentStep] = useState(0)
  const slideAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: -currentStep * width,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }, [currentStep])

  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <OnboardingProvider>
      <View className="items-center flex-1 overflow-hidden p-6 bg-white dark:bg-neutral-900">
        <View
          className="fixed left-1/2 -translate-x-1/2 top-6 z-10 w-[226px]"
          style={{
            position: 'fixed',
            left: '50%',
            transform: [{ translateX: -113 }], // half of 226px
            top: 24,
            zIndex: 10,
            width: 226,
          }}
        >
          <View
            className="relative flex-row bg-gray-100 dark:bg-neutral-800 rounded-lg p-1"
            style={{ width: optionWidth * themeOptions.length + indicatorPadding }}
          >
            {/* Sliding indicator */}
            <Animated.View
              style={{
                position: 'absolute',
                top: 4,
                left: 4,
                width: optionWidth - 8 + indicatorPadding,
                height: 32,
                borderRadius: 6,
                backgroundColor: isDark ? '#3f3f46' : '#e5e7eb',
                transform: [{ translateX: slideAnim }],
              }}
            />
            {/* Theme options */}
            {themeOptions.map((option, idx) => (
              <Pressable
                key={option}
                onPress={() => setThemePreference(option)}
                className="flex-row items-center justify-center gap-1 py-2 px-3 rounded-md z-10"
                style={{ width: optionWidth }}
              >
                {option === 'light' && (
                  <Sun
                    size={14}
                    color={themePreference === option ? '#f97316' : isDark ? '#fff' : '#000'}
                  />
                )}
                {option === 'dark' && (
                  <Moon
                    size={14}
                    color={themePreference === option ? '#f97316' : isDark ? '#fff' : '#000'}
                  />
                )}
                {option === 'system' && (
                  <Monitor
                    size={14}
                    color={themePreference === option ? '#f97316' : isDark ? '#fff' : '#000'}
                  />
                )}
                <Text
                  className={`text-xs font-inter ${
                    themePreference === option
                      ? 'text-primary font-inter-semibold'
                      : 'text-gray-700 dark:text-white'
                  }`}
                >
                  {option === 'system' ? 'Auto' : option.charAt(0).toUpperCase() + option.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
        {/* Progress Bar */}
        <View
          className={`max-w-[480px] h-1 w-full rounded bg-gray-200 dark:bg-neutral-800 self-center justify-center`}
        >
          <Animated.View
            style={{
              height: 4,
              borderRadius: 2,
              backgroundColor: '#f97316', // primary color
              width: `${progress}%`,
            }}
            className="bg-primary"
          />
        </View>

        <Animated.View
          style={{
            flexDirection: 'row',
            width: width * steps.length,
            transform: [{ translateX: slideAnim }],
          }}
        >
          {steps.map((Step, idx) => (
            <View key={idx} style={{ width }}>
              {Step}
            </View>
          ))}
        </Animated.View>
        {/* Navigation buttons to change currentStep */}
      </View>
    </OnboardingProvider>
  )
}
