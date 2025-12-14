/**
 * AuthInput.tsx
 *
 * Om Sri Cinmaya Sadgurave Namaha. Om Sri Gurubyo Namaha.
 * @author Abhiram Ramachandran
 * @date October 13, 2025
 * @description A Pressable component styled for destructive actions.
 * @requires react-native
 *
 */
import { Pressable, Text } from 'react-native'

/**
 * Renders DestructiveButton component.
 * @param children - The content to be displayed inside the button.
 * @param props - Additional props to be passed to the Pressable component.
 * @returns TSX.Element
 */
export default function DestructiveButton({ children, ...props }) {
  return (
    <Pressable className="bg-red-600 px-4 py-3 rounded-full active:bg-red-700" {...props}>
      <Text className="text-backgroundStrong font-inter text-bold text-gray-100 text-center">
        {children}
      </Text>
    </Pressable>
  )
}
