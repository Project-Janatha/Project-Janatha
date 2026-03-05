import React from 'react'
import { Pressable, Text } from 'react-native'

interface PrimaryButtonProps {
  children: React.ReactNode
  onPress?: () => void
  disabled?: boolean
  style?: any
  className?: string
}

export default function PrimaryButton({
  children,
  onPress,
  disabled,
  style,
  ...props
}: PrimaryButtonProps) {
  const handlePress = () => {
    if (!disabled && onPress) {
      onPress()
    }
  }

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      className="bg-primary px-4 py-3 rounded-full active:bg-primary-press disabled:opacity-50"
      style={style}
      {...props}
    >
      <Text className="text-backgroundStrong font-inter text-base text-center">{children}</Text>
    </Pressable>
  )
}
