import { Button, Input, ZStack } from 'tamagui'
import { Map, SearchBar } from 'components';
import { Search } from '@tamagui/lucide-icons';

/**
 * ExploreScreen Component
 * @return {JSX.Element} A ExploreScreen component that displays a map with a search bar overlay.
 */
export default function ExploreScreen() {
  return (
    <ZStack flex={1}>
      <Map />
      <SearchBar />
    </ZStack>
  )
}
