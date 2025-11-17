/**
 * AuthInput.tsx
 *
 * Om Sri Cinmaya Sadgurave Namaha. Om Sri Gurubyo Namaha.
 * @author Abhiram Ramachandran
 * @date October 13, 2025
 * @description A TextInput component styled for authentication forms.
 * @requires react-native
 *
 */
import { TextInput } from 'react-native'

/**
 * Renders AuthInput component.
 * @param props
 * @returns TSX.Element
 */
export default function AuthInput(props) {
  return (
    <TextInput
      className="text-content dark:text-content-dark w-full font-inter rounded-lg px-4 py-3 text-base min-h-[48px] bg-muted/50 dark:bg-muted-dark/10 focus:border-primary focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-400"
      placeholderTextColor="#9CA3AF"
      {...props}
    />
  )
}
