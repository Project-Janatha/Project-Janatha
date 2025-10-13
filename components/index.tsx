/**
 * index.ts
 *
 * Om Sri Cinmaya Sadgurave Namaha. Om Sri Gurubyo Namaha.
 * Author: Abhiram Ramachandran
 * Date Authored: September 2, 2025
 * Last Date Modified: September 2, 2025
 *
 * This file exports all components.
 *
 */
import { Pressable, Text, TextInput } from 'react-native'

export function PrimaryButton({ children, ...props }) {
  return (
    <Pressable className="bg-primary px-4 py-3 rounded-lg active:bg-primary-press" {...props}>
      <Text className="text-backgroundStrong font-semibold text-base text-center">{children}</Text>
    </Pressable>
  )
}

export function SecondaryButton({ children, ...props }) {
  return (
    <Pressable
      className="border border-borderColor bg-transparent text-color px-4 py-3 rounded-lg active:bg-gray-4"
      {...props}
    >
      <Text className="text-color text-base text-center">{children}</Text>
    </Pressable>
  )
}

export function DestructiveButton({ children, ...props }) {
  return (
    <Pressable className="bg-red-600 px-4 py-3 rounded-lg active:bg-red-700" {...props}>
      <Text className="text-backgroundStrong font-semibold text-base text-center">{children}</Text>
    </Pressable>
  )
}

export function GhostButton({ children, ...props }) {
  return (
    <Pressable
      className="bg-transparent text-color px-4 py-3 rounded-lg active:bg-gray-200"
      {...props}
    >
      <Text className="text-color text-base text-center">{children}</Text>
    </Pressable>
  )
}

export function IconButton({ children, variant = 'solid', ...props }) {
  const baseClass =
    variant === 'outlined'
      ? 'border border-borderColor bg-transparent px-2 py-2 rounded-lg active:bg-gray-200'
      : 'bg-gray-200 px-2 py-2 rounded-lg active:bg-gray-400'
  return (
    <Pressable className={baseClass} {...props}>
      {children}
    </Pressable>
  )
}

export function AuthInput(props) {
  return (
    <TextInput
      className="bg-gray text-color rounded-lg px-4 py-3 text-base min-h-[48px] focus:bg-gray-200 focus:border focus:border-primary"
      {...props}
    />
  )
}

export { default as Provider } from './contexts/Provider'
export { default as Map } from './Map'
export { default as SearchBar } from './SearchBar'
export { default as TabSegment } from './TabSegment'
export { default as UserProvider, UserContext } from './contexts/UserProvider'
export { default as Button } from './ui/PrimaryButton'
