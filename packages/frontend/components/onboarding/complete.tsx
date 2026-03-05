import { View, Text, Pressable, SafeAreaView, Image, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useOnboarding } from '../contexts'
import { useThemeContext } from '../contexts'

export default function Complete() {
  const { completeOnboarding, isSubmitting, submitError } = useOnboarding()
  const { isDark } = useThemeContext()
  const logoSize = 160
  const [showLogo, setShowLogo] = useState(false)
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    // Staggered animation: logo first, then content
    const logoTimer = setTimeout(() => {
      setShowLogo(true)
    }, 200)

    const contentTimer = setTimeout(() => {
      setShowContent(true)
    }, 500)

    return () => {
      clearTimeout(logoTimer)
      clearTimeout(contentTimer)
    }
  }, [])

  const handleGetStarted = () => {
    completeOnboarding()
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-neutral-900">
      <View className="max-w-[720px] w-full flex-1 self-center px-6">
        <View className="flex-1 justify-center items-center">
          <View className="w-full items-center">
            {/* Logo */}
            <View
              className={`mb-12 ${
                showLogo ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
              } transition-all duration-700`}
            >
              {isDark ? (
                <Image
                  source={require('../../assets/images/chinmaya_logo_dark.svg')}
                  style={{ width: logoSize, height: logoSize }}
                />
              ) : (
                <Image
                  source={require('../../assets/images/chinmaya_logo_light.svg')}
                  style={{ width: logoSize, height: logoSize }}
                />
              )}
            </View>

            {/* Header Content */}
            <View
              className={`items-center ${
                showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              } transition-all duration-500`}
            >
              <Text className="text-4xl font-inter font-bold text-content dark:text-content-dark text-center mb-4 tracking-tight">
                Welcome to Janata!
              </Text>
              <Text className="text-lg font-inter text-stone-500 dark:text-stone-400 text-center max-w-md leading-relaxed px-4">
                Begin your spiritual journey now
              </Text>
            </View>
          </View>
        </View>

        {/* Error Message */}
        {submitError && (
          <View className="px-4 mb-4">
            <Text className="text-red-500 dark:text-red-400 font-inter text-sm text-center">
              {submitError}
            </Text>
          </View>
        )}

        {/* Button */}
        <View className="pb-6">
          <Pressable
            onPress={handleGetStarted}
            disabled={isSubmitting}
            className={`w-full max-w-md self-center items-center justify-center rounded-xl py-4 px-8 bg-primary active:bg-primary-press hover:scale-105 active:scale-95 transition-transform duration-150 shadow-lg ${
              isSubmitting ? 'opacity-70' : ''
            }`}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white font-inter font-semibold text-base">Get Started</Text>
            )}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  )
}
