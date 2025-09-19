import React, { useState } from 'react';
import { Button, Input, XStack, YStack, ZStack } from 'tamagui';
import { Map } from 'components';
import { Search, SlidersHorizontal } from '@tamagui/lucide-icons';
import { useRouter } from 'expo-router';

/**
 * ExploreScreen Component
 * @return {JSX.Element} A ExploreScreen component that displays a map with a search bar overlay and filter options.
 */
export default function ExploreScreen() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const filters = ['All', 'Centers', 'Events'];

  // Map points data - centers and events
  const mapPoints = [
    {
      id: "1",
      type: "center" as const,
      name: "Chinmaya Mission San Jose",
      latitude: 37.2431,
      longitude: -121.7831,
    },
    {
      id: "2", 
      type: "center" as const,
      name: "Chinmaya Mission West",
      latitude: 37.8599,
      longitude: -122.4856,
    },
    {
      id: "3",
      type: "center" as const, 
      name: "Chinmaya Mission San Francisco",
      latitude: 37.7749,
      longitude: -122.4194,
    },
    {
      id: "4",
      type: "event" as const,
      name: "Bhagavad Gita Study Circle",
      latitude: 37.2631,
      longitude: -121.8031,
    },
    {
      id: "5",
      type: "event" as const,
      name: "Hanuman Chalisa Marathon", 
      latitude: 37.8699,
      longitude: -122.4756,
    },
    {
      id: "6",
      type: "event" as const,
      name: "Yoga Session",
      latitude: 37.7849,
      longitude: -122.4094,
    },
  ];

  // Filter points based on active filter
  const filteredPoints = mapPoints.filter(point => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Centers') return point.type === 'center';
    if (activeFilter === 'Events') return point.type === 'event';
    return true;
  });

  const handlePointPress = (point: any) => {
    if (point.type === 'center') {
      router.push(`/center/${point.id}`);
    }
    // For events, we could navigate to an event detail page
    // router.push(`/event/${point.id}`);
  };

  return (
    <ZStack flex={1}>
      {/* Enhanced Map with markers */}
      <Map points={filteredPoints} onPointPress={handlePointPress} />
      
      {/* Search and Filter Overlay */}
      <YStack 
        position="absolute" 
        top="$4" 
        left="$4" 
        right="$4"
        gap="$3"
        zIndex={10}
      >
        {/* Search Bar */}
        <XStack 
          bg="white" 
          borderRadius="$4" 
          padding="$2"
          alignItems="center"
          shadowColor="$shadowColor"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.1}
          shadowRadius={8}
          elevation={3}
        >
          <Search size={20} color="$gray8" marginLeft="$2" />
          <Input 
            flex={1}
            placeholder="Search for centers or events..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            borderWidth={0}
            backgroundColor="transparent"
            fontSize="$4"
          />
          <Button 
            size="$3" 
            circular 
            icon={<SlidersHorizontal size={16} />}
            variant="outlined"
            marginRight="$1"
          />
        </XStack>

        {/* Filter Buttons */}
        <XStack 
          bg="white" 
          borderRadius="$4" 
          padding="$1"
          gap="$1"
          shadowColor="$shadowColor"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.1}
          shadowRadius={8}
          elevation={3}
        >
          {filters.map((filter) => (
            <Button
              key={filter}
              size="$3"
              flex={1}
              onPress={() => setActiveFilter(filter)}
              bg={activeFilter === filter ? "$primary" : "transparent"}
              color={activeFilter === filter ? "white" : "$gray10"}
              fontWeight={activeFilter === filter ? "600" : "400"}
              borderRadius="$3"
              pressStyle={{ 
                bg: activeFilter === filter ? "$primaryPress" : "$gray4" 
              }}
            >
              {filter}
            </Button>
          ))}
        </XStack>
      </YStack>
    </ZStack>
  );
}
