import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { Sun, Moon, Monitor } from 'lucide-react-native'
import { useTheme } from './contexts'

const themeOptions = ['light', 'dark', 'system'] as const
const optionWidth = 70

export default function ThemeSelector({ style, className }: { style?: any; className?: string }) {
  const { preference: themePreference, setPreference: setThemePreference, isDark } = useTheme()

  const handlePress = (option: (typeof themeOptions)[number]) => {
    setThemePreference(option)
  }

  const getIconColor = (option: (typeof themeOptions)[number]) => {
    const isSelected = themePreference === option
    if (isSelected) return '#f97316'
    return isDark ? '#fff' : '#000'
  }

  const getTextColor = (option: (typeof themeOptions)[number]) => {
    const isSelected = themePreference === option
    if (isSelected) return '#f97316'
    return isDark ? '#fff' : '#374151'
  }

  const getLabel = (option: (typeof themeOptions)[number]) => {
    if (option === 'system') return 'Auto'
    return option.charAt(0).toUpperCase() + option.slice(1)
  }

  return (
    <View
      className={`relative flex-row bg-gray-100 dark:bg-neutral-800 rounded-lg p-1 ${
        className || ''
      }`}
      style={{
        width: optionWidth * themeOptions.length + 8,
        ...(style || {}),
      }}
    >
      {themeOptions.map((option) => {
        const isSelected = themePreference === option
        return (
          <Pressable
            key={option}
            onPress={() => handlePress(option)}
            className="flex-row items-center justify-center gap-1 py-2 px-3 rounded-md"
            style={{ 
              width: optionWidth,
              backgroundColor: isSelected 
                ? (isDark ? '#3f3f46' : '#e5e7eb') 
                : 'transparent',
            }}
          >
            {option === 'light' && (
              <Sun
                size={14}
                // @ts-ignore - lucide-react-native type mismatch
                color={getIconColor(option)}
              />
            )}
            {option === 'dark' && (
              <Moon
                size={14}
                // @ts-ignore - lucide-react-native type mismatch
                color={getIconColor(option)}
              />
            )}
            {option === 'system' && (
              <Monitor
                size={14}
                // @ts-ignore - lucide-react-native type mismatch
                color={getIconColor(option)}
              />
            )}
            <Text
              style={{
                color: getTextColor(option),
                fontSize: 12,
                fontFamily: 'Inter',
                fontWeight: isSelected ? '600' : '400',
              }}
            >
              {getLabel(option)}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}
