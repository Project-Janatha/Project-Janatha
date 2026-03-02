import React from 'react'
import { Pressable, Text } from 'react-native'

interface PrimaryButtonProps {
  children: React.ReactNode
  onPress?: () => void
  disabled?: boolean
  style?: any
}

export default function PrimaryButton({
  children,
  onPress,
  disabled,
  style,
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
      style={[
        {
          backgroundColor: '#f97316',
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderRadius: 9999,
          opacity: disabled ? 0.5 : 1,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <Text
        style={{
          color: '#171717',
          fontFamily: 'Inter',
          fontSize: 16,
          textAlign: 'center',
        }}
      >
        {children}
      </Text>
    </Pressable>
  )
}
