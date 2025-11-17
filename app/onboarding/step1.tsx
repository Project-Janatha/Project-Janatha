import { View, Animated, Easing, Pressable, Text } from 'react-native'
import { useState, useEffect, useRef } from 'react'
import { UserContext, useThemeContext } from 'components/contexts'
import { Sun, Moon, Monitor } from 'lucide-react-native'

export default function Step1() {
  return (
    <View className="flex-1 justify-center items-center">
      <Text className="font-inter text-2xl text-content dark:text-content-dark">
        Welcome to the Onboarding - Step 1
      </Text>
    </View>
  )
}
