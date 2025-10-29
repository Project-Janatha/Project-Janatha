/**
 * TabSegment.tsx
 *
 * A reusable tab segment component for consistent tab styling across the app
 *
 * Author: Generated for Project Janatha
 * Date: September 21, 2025
 */

import React from 'react'
import { TouchableOpacity, Text, View } from 'react-native'

export interface TabOption {
  value: string
  label: string
}

export interface TabSegmentProps {
  options: TabOption[]
  value: string
  onValueChange: (value: string) => void
  size?: '$2' | '$3' | '$4'
  variant?: 'primary' | 'subtle'
}

export function TabSegment({
  options,
  value,
  onValueChange,
  variant = 'primary',
}: TabSegmentProps) {
  // Tailwind classes for variants
  const containerClass =
    variant === 'primary'
      ? 'flex-row bg-background-light rounded-xl p-1 shadow'
      : 'flex-row bg-background-dark rounded-xl p-1'

  return (
    <View className={containerClass}>
      {options.map((option) => {
        const isActive = value === option.value
        return (
          <TouchableOpacity
            key={option.value}
            className={`flex-1 rounded-lg px-3 py-2 mx-0.5 ${
              isActive ? 'bg-primary' : 'bg-transparent border border-gray-300'
            }`}
            activeOpacity={0.8}
            onPress={() => onValueChange(option.value)}
          >
            <Text
              className={`text-center ${
                isActive ? 'text-background-strong font-semibold' : 'text-gray-500 font-normal'
              }`}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

export default TabSegment
