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
      ? 'flex-row bg-background rounded-xl p-1 shadow'
      : 'flex-row bg-background-dark rounded-xl p-1'

  return (
    <View className="flex-row p-1 font-inter">
      {options.map((option) => {
        const isActive = value === option.value
        return (
          <TouchableOpacity
            key={option.value}
            className={`flex rounded-full px-3 py-2 ${
              isActive ? 'bg-primary' : 'bg-backgroundStrong dark:bg-backgroundStrong-dark'
            }`}
            activeOpacity={0.8}
            onPress={() => onValueChange(option.value)}
          >
            <Text
              className={`text-center font-inter ${
                isActive ? 'text-background-strong' : 'text-gray-500'
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
