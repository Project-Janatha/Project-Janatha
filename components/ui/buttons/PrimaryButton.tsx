/**
 * PrimaryButton.tsx
 *
 * Om Sri Cinmaya Sadgurave Namaha. Om Sri Gurubyo Namaha.
 * @author Abhiram Ramachandran
 * @date October 13, 2025
 * @description A Pressable component styled for primary actions.
 * @requires module:react-native
 */
import React from 'react'
import { Pressable, Text, Platform, ActivityIndicator } from 'react-native'

/**
 * Renders PrimaryButton component.
 * @param children - The content to be displayed inside the button.
 * @param props - Additional props to be passed to the Pressable component.
 * @returns TSX.Element
 */
export default function PrimaryButton({
  children,
  onPress,
  disabled,
  icon,
  size = 3,
  ...props
}: any) {
  const handlePress = (e: any) => {
    console.log('🔵 PrimaryButton handlePress called')
    if (Platform.OS === 'web' && e) {
      e.preventDefault()
      e.stopPropagation()
    }
    if (!disabled && onPress) {
      console.log('🔵 Calling onPress')
      onPress(e)
    }
  }

  if (Platform.OS === 'web') {
    return (
      <button
        type="button" // CRITICAL: prevents form submission
        onClick={handlePress}
        disabled={disabled}
        className="bg-primary px-4 py-3 rounded-full active:bg-primary-press disabled:opacity-50 cursor-pointer w-full"
        style={{ border: 'none', outline: 'none' }}
      >
        <span className="text-backgroundStrong font-inter text-base text-center block">
          {children}
        </span>
      </button>
    )
  }

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      className="bg-primary px-4 py-3 rounded-full active:bg-primary-press disabled:opacity-50"
      {...props}
    >
      <Text className="text-backgroundStrong font-inter text-base text-center">{children}</Text>
    </Pressable>
  )
}
