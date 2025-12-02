/**
 * SearchBar.tsx
 *
 * Om Sri Cinmaya Sadgurave Namaha. Om Sri Gurubyo Namaha.
 * Author: Abhiram Ramachandran
 * Date Authored: September 2, 2025
 * Last Date Modified: September 2, 2025
 *
 * This file exports a SearchBar component that provides a search input field with an icon.
 *
 * Dependencies:
 * - @rnmapbox/maps: For rendering maps and handling map-related functionalities.
 */
import { PrimaryButton } from 'components/ui'
import { Search } from 'lucide-react-native'
import { TextInput, View } from 'react-native'

/**
 * SearchBar Component
 * @param {any} props - Props passed to the Map component.
 * @return {JSX.Element} A Map component that displays a map using mapboxgl.
 */
export default function SearchBar(props: any) {
  return (
    <View className="bg-background w-11/12 mx-auto mt-3 flex-row items-center shadow-lg">
      <TextInput placeholder="Type here" />
    </View>
  )
}
