import React, { useState } from 'react';
import { View, TextInput } from 'react-native';
import { Map, TabSegment, IconButton } from 'components';
import { Search, SlidersHorizontal } from 'lucide-react-native';
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
    <View className="flex-1">
      {/* Search and Filter Controls - Fixed at top */}
      <View className="p-4 gap-3 bg-white/95 border-b border-gray-200">
        {/* Search Bar */}
        <View className="flex-row items-center bg-white rounded-lg p-2 shadow-md">
          <Search size={20} color="#9CA3AF" style={{ marginLeft: 8 }} />
          <TextInput
            className="flex-1 bg-transparent text-base px-2"
            placeholder="Search for centers or events..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <IconButton>
            <SlidersHorizontal size={16} color="#9CA3AF" />
          </IconButton>
        </View>

        {/* Filter Tabs */}
        <TabSegment
          options={filterOptions}
          value={activeFilter}
          onValueChange={setActiveFilter}
          variant="primary"
          size={3}
        />
      </View>

      {/* Map - Takes remaining space */}
      <Map points={filteredPoints} onPointPress={handlePointPress} />
    </View>
  );
}
