/**
 * PrimaryButton.tsx
 *
 * Om Sri Cinmaya Sadgurave Namaha. Om Sri Gurubyo Namaha.
 * @author Abhiram Ramachandran
 * @date October 13, 2025
 * @description A Pressable component styled for primary actions.
 * @requires module:react-native
 */
import { Pressable, Text } from 'react-native'

/**
 * Renders PrimaryButton component.
 * @param children - The content to be displayed inside the button.
 * @param props - Additional props to be passed to the Pressable component.
 * @returns TSX.Element
 */
export default function PrimaryButton({ children, ...props }) {
  return (
    <Pressable className="bg-primary px-4 py-3 rounded-lg active:bg-primary-press" {...props}>
      <Text className="text-backgroundStrong font-semibold text-base text-center">{children}</Text>
    </Pressable>
  )
}
