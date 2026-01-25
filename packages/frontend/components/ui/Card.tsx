/**
 * Card.tsx
 *
 * Om Sri Cinmaya Sadgurave Namaha. Om Sri Gurubyo Namaha.
 * @description A reusable Card component with consistent styling using borders
 */

import React from 'react'
import { View, Pressable, ViewProps, PressableProps, Platform } from 'react-native'

export interface CardProps {
  children: React.ReactNode
  /** Size variant - 'md' (rounded-2xl) or 'lg' (rounded-3xl) */
  size?: 'md' | 'lg'
  /** Padding variant - 'sm' (p-4), 'md' (p-6), 'lg' (p-8), or 'none' */
  padding?: 'sm' | 'md' | 'lg' | 'none'
  /** Whether the card is pressable */
  pressable?: boolean
  /** Whether to clip content overflow */
  overflowHidden?: boolean
  /** Hover border color on web (e.g., 'primary') */
  hoverBorderColor?: 'primary' | 'none'
  /** Additional className for custom styling */
  className?: string
  /** Press handler (required if pressable is true) */
  onPress?: () => void
  /** Additional props for View or Pressable */
  [key: string]: any
}

/**
 * Card component with consistent border styling
 * Supports both static View and interactive Pressable variants
 */
export default function Card({
  children,
  size = 'md',
  padding = 'none',
  pressable = false,
  overflowHidden = false,
  hoverBorderColor,
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
  
  // Hover classes for web
  const hoverClasses = Platform.OS === 'web' && hoverBorderColor === 'primary'
    ? 'hover:border-primary hover:scale-[1.02] transition-transform'
    : ''
  
  // Active/press classes
  const activeClasses = pressable ? 'active:scale-[0.98]' : ''
  
  const combinedClasses = `${baseClasses} ${sizeClasses} ${paddingClasses} ${overflowClass} ${hoverClasses} ${activeClasses} ${className}`.trim()

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
