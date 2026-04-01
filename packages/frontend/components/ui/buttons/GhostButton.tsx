import { Pressable, Text } from 'react-native'
import React from 'react'

interface GhostButtonProps {
  children: React.ReactNode
  onPress?: () => void
  disabled?: boolean
  style?: any
  [key: string]: any
}

export default function GhostButton({ children, onPress, disabled, style, ...props }: GhostButtonProps) {
  return (
    <Pressable
      onPress={!disabled ? onPress : undefined}
      disabled={disabled}
      className="bg-transparent px-4 py-3 rounded-full active:bg-gray-200 dark:active:bg-gray-700 disabled:opacity-50"
      style={style}
      {...props}
    >
      <Text className="text-content dark:text-content-dark text-base leading-4 text-center">{children}</Text>
    </Pressable>
  )
}
