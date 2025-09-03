import { Button, Input, ZStack } from 'tamagui'
import { Map, SearchBar } from 'components';
import { Search } from '@tamagui/lucide-icons';

export default function ExploreScreen() {
  return (
    <ZStack flex={1}>
      <Map />
      <SearchBar />
    </ZStack>
  )
}
