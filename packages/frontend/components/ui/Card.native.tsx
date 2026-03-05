import React from 'react'
import { View, Pressable } from 'react-native'

export interface CardProps {
  children: React.ReactNode
  size?: 'md' | 'lg'
  padding?: 'sm' | 'md' | 'lg' | 'none'
  pressable?: boolean
  overflowHidden?: boolean
  hoverBorderColor?: 'primary' | 'none'
  className?: string
  onPress?: () => void
  [key: string]: any
}

export default function Card({
  children,
  size = 'md',
  padding = 'none',
  pressable = false,
  overflowHidden = false,
  className = '',
  onPress,
  ...props
}: CardProps) {
  const baseClasses = 'bg-card dark:bg-card-dark border border-borderColor dark:border-borderColor-dark'
  const sizeClasses = size === 'lg' ? 'rounded-3xl' : 'rounded-2xl'
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    none: '',
  }[padding]

  const overflowClass = overflowHidden ? 'overflow-hidden' : ''
  const activeClasses = pressable ? 'active:scale-[0.98]' : ''

  const combinedClasses = `${baseClasses} ${sizeClasses} ${paddingClasses} ${overflowClass} ${activeClasses} ${className}`.trim()

  if (pressable && onPress) {
    return (
      <Pressable
        onPress={onPress}
        className={combinedClasses}
        {...(props as any)}
      >
        {children}
      </Pressable>
    )
  }

  return (
    <View className={combinedClasses} {...(props as any)}>
      {children}
    </View>
  )
}
