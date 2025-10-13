/**
 * IconButton.tsx
 *
 * Om Sri Cinmaya Sadgurave Namaha. Om Sri Gurubyo Namaha.
 * @author Abhiram Ramachandran
 * @date October 13, 2025
 * @description A Pressable component styled for icon buttons.
 * @requires module:react-native
 *
 */
import { Pressable } from 'react-native'

/**
 * Renders IconButton component.
 * @param children - The content to be displayed inside the button.
 * @param variant - The variant of the button (solid or outlined).
 * @param props - Additional props to be passed to the Pressable component.
 * @returns TSX.Element
 */
export default function IconButton({ children, variant = 'solid', ...props }) {
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
