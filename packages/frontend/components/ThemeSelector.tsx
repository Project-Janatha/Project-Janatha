import React, { useEffect, useRef, useState } from 'react'
import { Animated, View, Text, Pressable } from 'react-native'
import { Sun, Moon, Monitor } from 'lucide-react-native'
import { useThemeContext } from './contexts'

export default function ThemeSelector({ style, className }) {
  const { themePreference, setThemePreference, isDark } = useThemeContext()
  const themeOptions = ['light', 'dark', 'system']
  const optionWidth = 70
  const indicatorPadding = 8
  const [selectedIndex, setSelectedIndex] = useState(themeOptions.indexOf(themePreference))
  const slideAnim = useRef(new Animated.Value(selectedIndex * optionWidth)).current

  useEffect(() => {
    const idx = themeOptions.indexOf(themePreference)
    setSelectedIndex(idx)
    Animated.timing(slideAnim, {
      toValue: idx * optionWidth,
      duration: 100,
      useNativeDriver: true,
    }).start()
  }, [themePreference])

  return (
    <View
      className={`relative flex-row bg-gray-100 dark:bg-neutral-800 rounded-lg p-1 ${
        className || ''
      }`}
      style={{
        width: optionWidth * themeOptions.length + indicatorPadding,
        ...(style || {}),
      }}
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
  )
}
