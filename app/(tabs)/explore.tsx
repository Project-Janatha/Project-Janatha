import React, { useState, useRef } from 'react'
import { View, TextInput, Pressable, Text } from 'react-native'
import { IconButton } from 'components/ui'
import {
  Search,
  SlidersHorizontal,
  Locate,
  MapPin,
  Calendar,
  LayoutGrid,
} from 'lucide-react-native'
import { useRouter } from 'expo-router'
import { useThemeContext } from 'components/contexts'
import Map, { MapRef } from 'components/Map.web'

/**
 * ExploreScreen Component
 * @return {JSX.Element} A ExploreScreen component that displays a map with a search bar overlay and filter options.
 */
export default function ExploreScreen() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()
  const { isDark } = useThemeContext()
  const mapRef = useRef<MapRef>(null)

  // Map points data - centers and events
  const mapPoints = [
    {
      id: '1',
      type: 'center' as const,
      name: 'Chinmaya Mission San Jose',
      latitude: 37.2431,
      longitude: -121.7831,
    },
    {
      id: '2',
      type: 'center' as const,
      name: 'Chinmaya Mission West',
      latitude: 37.8599,
      longitude: -122.4856,
    },
    {
      id: '3',
      type: 'center' as const,
      name: 'Chinmaya Mission San Francisco',
      latitude: 37.7749,
      longitude: -122.4194,
    },
    {
      id: '4',
      type: 'event' as const,
      name: 'Bhagavad Gita Study Circle',
      latitude: 37.2631,
      longitude: -121.8031,
    },
    {
      id: '5',
      type: 'event' as const,
      name: 'Hanuman Chalisa Marathon',
      latitude: 37.8699,
      longitude: -122.4756,
    },
    {
      id: '6',
      type: 'event' as const,
      name: 'Yoga Session',
      latitude: 37.7849,
      longitude: -122.4094,
    },
  ]

  // Filter points based on active filter
  const filteredPoints = mapPoints.filter((point) => {
    if (activeFilter === 'All') return true
    if (activeFilter === 'Centers') return point.type === 'center'
    if (activeFilter === 'Events') return point.type === 'event'
    return true
  })

  const handlePointPress = (point: any) => {
    if (point.type === 'center') {
      router.push(`/center/${point.id}`)
    } else if (point.type === 'event') {
      router.push(`/events/${point.id}`)
    }
  }

  const handleLocateUser = () => {
    // This will be handled by the Map component
    if (mapRef.current?.centerOnUser) {
      mapRef.current.centerOnUser()
    }
  }

  const getFilterIcon = (filter: string) => {
    switch (filter) {
      case 'All':
        return (
          <LayoutGrid
            size={14}
            className={`${
              activeFilter === filter ? 'text-background' : 'text-content dark:text-content-dark'
            }`}
          />
        )
      case 'Centers':
        return (
          <MapPin
            size={14}
            className={`${
              activeFilter === filter ? 'text-background' : 'text-content dark:text-content-dark'
            }`}
          />
        )
      case 'Events':
        return (
          <Calendar
            size={14}
            className={`${
              activeFilter === filter ? 'text-background' : 'text-content dark:text-content-dark'
            }`}
          />
        )
      default:
        return null
    }
  }

  return (
    <View className="flex-1">
      {/* Map - Full screen */}
      <Map ref={mapRef} points={filteredPoints} onPointPress={handlePointPress} />

      {/* Search and Filter Controls - Overlay on top */}
      <View className="absolute top-4 left-4 right-4 z-10 flex-row gap-2 items-center">
        {/* Search Bar - 60% of available width */}
        <View className="flex-[6] flex-row items-center px-3 py-2 mr-4 rounded-full shadow-lg bg-white dark:bg-neutral-900 border border-borderColor dark:border-borderColor-dark">
          <Search size={18} color="#9CA3AF" />
          <TextInput
            className="flex-1 bg-transparent text-sm px-2 font-inter outline-none focus:outline-none text-content dark:text-content-dark"
            placeholder="Search..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {/* <IconButton>
            <SlidersHorizontal size={16} color="#9CA3AF" />
          </IconButton> */}
        </View>

        {/* Filter Chips - 40% of available width */}
        <View className="flex-[4] flex-row gap-2">
          {['All', 'Centers', 'Events'].map((filter) => (
            <Pressable
              key={filter}
              onPress={() => setActiveFilter(filter)}
              className={`flex-row items-center gap-1 px-2.5 py-2 rounded-full shadow active:opacity-70 ${
                activeFilter === filter
                  ? 'bg-primary border-primary'
                  : 'bg-background dark:bg-background-dark border-borderColor dark:border-borderColor-dark'
              } border`}
            >
              {getFilterIcon(filter)}
              <Text
                style={{ fontFamily: activeFilter === filter ? 'Inter-SemiBold' : 'Inter-Regular' }}
                className={`text-xs ${
                  activeFilter === filter
                    ? 'text-background'
                    : 'text-content dark:text-content-dark'
                }`}
              >
                {filter}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  )
}
