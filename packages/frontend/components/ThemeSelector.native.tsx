import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { Sun, Moon, Monitor } from 'lucide-react-native'
import { useThemeContext } from './contexts'

export default function ThemeSelector({ style, className }: { style?: any; className?: string }) {
  const { themePreference, setThemePreference, isDark } = useThemeContext()
  const themeOptions: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system']
  const optionWidth = 70

  const handlePress = (option: 'light' | 'dark' | 'system') => {
    setThemePreference(option)
  }

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: isDark ? '#262626' : '#f3f4f6',
        borderRadius: 8,
        padding: 4,
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
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 6,
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
              style={{
                fontSize: 12,
                fontFamily: 'Inter',
                color: isSelected
                  ? '#f97316'
                  : isDark ? '#fff' : '#374151',
                fontWeight: isSelected ? '600' : '400',
              }}
            >
              {option === 'system' ? 'Auto' : option.charAt(0).toUpperCase() + option.slice(1)}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}
