/**
 * SecondaryButton.tsx
 *
 * Om Sri Cinmaya Sadgurave Namaha. Om Sri Gurubyo Namaha.
 * @author Abhiram Ramachandran
 * @date October 13, 2025
 * @description A Pressable component styled for secondary actions.
 * @requires module:react-native
 */
import { Pressable, Text } from 'react-native'

/**
 * Renders a secondary button.
 * @param children - The content to be displayed inside the button.
 * @param props - Additional props to be passed to the Pressable component.
 * @returns TSX.Element
 */
export default function SecondaryButton({ children, ...props }) {
  return (
    <Pressable
      className="border border-borderColor bg-transparent text-color px-4 py-3 rounded-lg active:bg-gray-4"
      {...props}
    >
      <Text className="font-inter text-color text-base text-center">{children}</Text>
    </Pressable>
  )
}
