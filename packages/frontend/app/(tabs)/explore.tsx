import React, { useState, useMemo } from 'react'
import { View, TextInput, Pressable, Text } from 'react-native'
import {
  Search,
  MapPin,
  Calendar,
  LayoutGrid,
} from 'lucide-react-native'
import { useRouter } from 'expo-router'
import { useThemeContext } from '../../components/contexts'
import Map from '../../components/Map.web'
import { useMapPoints } from '../../hooks/useApiData'
import { MapPoint } from '../../utils/api'

export default function ExploreScreen() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()
  const { isDark } = useThemeContext()
  const { points: mapPoints } = useMapPoints()

  // Filter points based on active filter and search query
  const filteredPoints = useMemo(() => {
    let filtered = mapPoints

    // Filter by type
    if (activeFilter === 'Centers') {
      filtered = filtered.filter((p) => p.type === 'center')
    } else if (activeFilter === 'Events') {
      filtered = filtered.filter((p) => p.type === 'event')
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(query))
    }

    return filtered
  }, [mapPoints, activeFilter, searchQuery])

  const handlePointPress = (point: MapPoint) => {
    if (point.type === 'center') {
      router.push(`/center/${point.id}`)
    } else if (point.type === 'event') {
      router.push(`/events/${point.id}`)
    }
  }

  const getFilterIcon = (filter: string) => {
    const color = activeFilter === filter ? '#ffffff' : (isDark ? '#d4d4d8' : '#3f3f46')
    switch (filter) {
      case 'All':
        return <LayoutGrid size={14} color={color} />
      case 'Centers':
        return <MapPin size={14} color={color} />
      case 'Events':
        return <Calendar size={14} color={color} />
      default:
        return null
    }
  }

  return (
    <View className="flex-1">
      {/* Map - Full screen */}
      <Map points={filteredPoints} onPointPress={handlePointPress} />

      {/* Search and Filter Controls - Overlay on top */}
      <View className="absolute top-4 left-4 right-4 z-10 flex-row gap-2 items-center">
        {/* Search Bar */}
        <View className="flex-[6] flex-row items-center px-3 py-2 mr-4 rounded-full shadow-lg bg-white dark:bg-neutral-900 border border-borderColor dark:border-borderColor-dark">
          <Search size={18} color="#9CA3AF" />
          <TextInput
            className="flex-1 bg-transparent text-sm px-2 font-inter outline-none focus:outline-none text-content dark:text-content-dark"
            placeholder="Search centers and events..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter Chips */}
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
