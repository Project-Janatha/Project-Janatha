import React from 'react'
import { View, Pressable, ViewProps, PressableProps } from 'react-native'

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
  const borderRadius = size === 'lg' ? 24 : 16
  const paddingValue = {
    sm: 16,
    md: 24,
    lg: 32,
    none: 0,
  }[padding]

  const containerStyle: any = {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius,
    overflow: overflowHidden ? 'hidden' : 'visible',
  }
  
  if (paddingValue > 0) {
    containerStyle.padding = paddingValue
  }

  if (pressable && onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }: any) => [
          containerStyle,
          pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
        ]}
        {...props}
      >
        {children}
      </Pressable>
    )
  }

  return (
    <View style={containerStyle} {...props}>
      {children}
    </View>
  )
}
