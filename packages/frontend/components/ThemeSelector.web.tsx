import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { Sun, Moon, Monitor } from 'lucide-react-native'
import { useThemeContext } from './contexts'

export default function ThemeSelector({ style, className }: { style?: any; className?: string }) {
  const { themePreference, setThemePreference, isDark } = useThemeContext()
  const themeOptions = ['light', 'dark', 'system'] as const
  const optionWidth = 70

  const handlePress = (option: 'light' | 'dark' | 'system') => {
    setThemePreference(option)
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
                color={isSelected ? '#f97316' : isDark ? '#fff' : '#000'}
              />
            )}
            {option === 'dark' && (
              <Moon
                size={14}
                color={isSelected ? '#f97316' : isDark ? '#fff' : '#000'}
              />
            )}
            {option === 'system' && (
              <Monitor
                size={14}
                color={isSelected ? '#f97316' : isDark ? '#fff' : '#000'}
              />
            )}
            <Text
              className={`text-xs font-inter ${
                isSelected
                  ? 'text-primary font-semibold'
                  : 'text-gray-700 dark:text-white'
              }`}
            >
              {option === 'system' ? 'Auto' : option.charAt(0).toUpperCase() + option.slice(1)}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}
