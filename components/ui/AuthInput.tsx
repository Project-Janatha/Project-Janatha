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
      className="bg-gray text-color rounded-lg px-4 py-3 text-base min-h-[48px] focus:bg-gray-200 focus:border focus:border-primary"
      {...props}
    />
  )
}
