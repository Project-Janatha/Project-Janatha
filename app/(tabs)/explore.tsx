import React, { useState } from 'react';
import { Button, Input, XStack, YStack } from 'tamagui';
import { Map, TabSegment, IconButton } from 'components';
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

  const filterOptions = [
    { value: 'All', label: 'All' },
    { value: 'Centers', label: 'Centers' },
    { value: 'Events', label: 'Events' }
  ];

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
      id: "3",
      type: "event" as const,
      name: "Bhagavad Gita Study Circle",
      latitude: 37.2631,
      longitude: -121.8031,
    },
    {
      id: "1",
      type: "event" as const,
      name: "Hanuman Chalisa Marathon", 
      latitude: 37.8699,
      longitude: -122.4756,
    },
    {
      id: "2",
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
    } else if (point.type === 'event') {
      router.push(`/events/${point.id}`);
    }
  };

  return (
    <YStack flex={1}>
      {/* Search and Filter Controls - Fixed at top */}
      <YStack 
        padding="$4" 
        gap="$3"
        backgroundColor="$overlayBackground"
        backdropFilter="blur(10px)"
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
      >
        {/* Search Bar */}
        <XStack 
          bg="$cardBackground" 
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
          <IconButton 
            size="$3" 
            circular 
            icon={<SlidersHorizontal size={16} />}
            variant="outlined"
            marginRight="$1"
          />
        </XStack>

        {/* Filter Tabs */}
        <TabSegment
          options={filterOptions}
          value={activeFilter}
          onValueChange={setActiveFilter}
          variant="primary"
          size="$3"
        />
      </YStack>

      {/* Map - Takes remaining space */}
      <Map points={filteredPoints} onPointPress={handlePointPress} />
    </YStack>
  );
}
