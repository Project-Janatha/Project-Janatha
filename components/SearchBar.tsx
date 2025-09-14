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
import { Input, Button, View } from 'tamagui';
import { Search } from '@tamagui/lucide-icons';

/**
 * SearchBar Component
 * @param {any} props - Props passed to the Map component.
 * @return {JSX.Element} A Map component that displays a map using mapboxgl.
 */
export default function SearchBar(props: any) {
  return (
  <View 
    position="absolute"
    height="$1">
    <Input placeholder="Type here" />
  </View>
  )
}