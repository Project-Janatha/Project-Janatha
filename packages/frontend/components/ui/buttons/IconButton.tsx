import { Pressable } from 'react-native'
import React from 'react'

interface IconButtonProps {
  children: React.ReactNode
  variant?: 'solid' | 'outlined'
  onPress?: () => void
  disabled?: boolean
  style?: any
  [key: string]: any
}

export default function IconButton({ children, variant = 'solid', onPress, disabled, style, ...props }: IconButtonProps) {
  const baseClass =
    variant === 'outlined'
      ? 'border border-borderColor bg-transparent px-2 py-2 rounded-full active:bg-gray-200 disabled:opacity-50'
      : 'bg-gray-200 px-2 py-2 rounded-full active:bg-gray-400 disabled:opacity-50'
  return (
    <Pressable
      onPress={!disabled ? onPress : undefined}
      disabled={disabled}
      className={baseClass}
      style={style}
      {...props}
    >
      {children}
    </Pressable>
  )
}
