import { View, Text, Pressable, TextInput, ActivityIndicator, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useOnboarding } from 'components/contexts'
import { useState, useEffect, useRef } from 'react'
import { findNearestLocation, calculateDistance } from 'frontend/utilities/distance'
import { Check } from 'lucide-react-native'

const CENTERS = [
  {
    id: '1',
    name: 'Chinmaya Mission San Jose',
    latitude: 37.2431,
    longitude: -121.7831,
  },
  {
    id: '2',
    name: 'Chinmaya Mission West',
    latitude: 37.8599,
    longitude: -122.4856,
  },
  {
    id: '3',
    name: 'Chinmaya Mission San Francisco',
    latitude: 37.7749,
    longitude: -122.4194,
  },
  {
    id: '4',
    name: 'Chinmaya Vrindavan',
    latitude: 40.3086,
    longitude: -74.5603,
  },
]

export default function Step3() {
  const { goToNextStep, location, setLocation } = useOnboarding()
  const [searchInput, setSearchInput] = useState('')
  const [focusedField, setFocusedField] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedCenter, setSelectedCenter] = useState<any>(null)
  const [nearbyCenters, setNearbyCenters] = useState<any[]>([])
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null)
  const [error, setError] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  // Geocode and find nearby centers
  const geocodeLocation = async (input: string) => {
    if (!input.trim()) {
      setNearbyCenters([])
      setShowSuggestions(false)
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          input
        )}&format=json&limit=1&countrycodes=us`
      )

      if (!response.ok) {
        throw new Error('Failed to find location')
      }

      const data = await response.json()

      if (data.length === 0) {
        setError('Location not found')
        setNearbyCenters([])
        setShowSuggestions(false)
        setLoading(false)
        return
      }

      const userLat = parseFloat(data[0].lat)
      const userLon = parseFloat(data[0].lon)

      setUserCoords([userLat, userLon])
      setLocation([userLat, userLon])

      // Calculate distances for all centers and sort by distance
      const centersWithDistance = CENTERS.map((center) => ({
        ...center,
        distance: calculateDistance(userLat, userLon, center.latitude, center.longitude),
      })).sort((a, b) => a.distance - b.distance)

      setNearbyCenters(centersWithDistance)
      setShowSuggestions(true)
      setError('')

      // Auto-select nearest center
      if (centersWithDistance.length > 0) {
        setSelectedCenter(centersWithDistance[0])
      }
    } catch (err) {
      setError('Unable to find location')
      console.error(err)
      setNearbyCenters([])
      setShowSuggestions(false)
    } finally {
      setLoading(false)
    }
  }

  // Debounced search as user types
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    if (searchInput.length >= 3) {
      debounceTimer.current = setTimeout(() => {
        geocodeLocation(searchInput)
      }, 500)
    } else {
      setNearbyCenters([])
      setShowSuggestions(false)
    }

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [searchInput])

  const handleSelectCenter = (center: any) => {
    setSelectedCenter(center)
    // Keep suggestions visible after selection
  }

  const handleContinue = () => {
    if (!selectedCenter) {
      setError('Please search and select a center')
      return
    }
    goToNextStep()
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-neutral-900">
      <View className="max-w-[720px] w-full flex-1 self-center px-6">
        <View className="flex-1 justify-center items-center">
          <View className="gap-4 w-full">
            <View className="gap-2">
              <Text className="text-4xl font-inter font-bold text-content dark:text-content-dark text-center">
                Find your nearest center
              </Text>
              <Text className="text-lg font-inter text-content/70 dark:text-content-dark/70 text-center">
                Enter your zip code or city to see nearby centers.
              </Text>
            </View>

            <View className="gap-3 mt-8 w-full items-center">
              {/* Search Input */}
              <View className="w-full max-w-md relative">
                <View className="flex-row gap-2">
                  <View className="flex-1 relative">
                    <TextInput
                      className={`w-full text-content dark:text-content-dark font-inter rounded-xl px-4 py-4 text-base bg-muted/50 dark:bg-muted-dark/10 border-2 outline-none ${
                        focusedField ? 'border-primary' : 'border-transparent'
                      } placeholder:text-gray-400 dark:placeholder:text-gray-500`}
                      placeholder="Zip code or city name"
                      value={searchInput}
                      onChangeText={setSearchInput}
                      onFocus={() => {
                        setFocusedField(true)
                        // Show suggestions if we have nearby centers
                        if (nearbyCenters.length > 0) {
                          setShowSuggestions(true)
                        }
                      }}
                      onBlur={() => {
                        setFocusedField(false)
                      }}
                      placeholderTextColor="#9ca3af"
                      autoCapitalize="words"
                      returnKeyType="search"
                    />
                    {loading && (
                      <View className="absolute right-4 top-0 bottom-0 justify-center">
                        <ActivityIndicator size="small" color="#f97316" />
                      </View>
                    )}
                  </View>
                </View>

                {/* Suggestions Dropdown */}
                {showSuggestions && nearbyCenters.length > 0 && (
                  <View className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-neutral-800 rounded-xl border-2 border-muted/50 dark:border-muted-dark/10 overflow-hidden z-10">
                    <ScrollView style={{ maxHeight: 300 }}>
                      {nearbyCenters.map((center, index) => (
                        <Pressable
                          key={center.id}
                          onPress={() => handleSelectCenter(center)}
                          className={`px-4 py-4 ${
                            index !== nearbyCenters.length - 1
                              ? 'border-b border-muted/20 dark:border-muted-dark/20'
                              : ''
                          } ${
                            selectedCenter?.id === center.id
                              ? 'bg-primary/10 dark:bg-primary/20'
                              : ''
                          }`}
                        >
                          <View className="flex-row justify-between items-center">
                            <View className="flex-1">
                              <View className="flex-row items-center gap-2">
                                <Text
                                  className={`text-base font-inter font-semibold ${
                                    selectedCenter?.id === center.id
                                      ? 'text-primary'
                                      : 'text-content dark:text-content-dark'
                                  }`}
                                >
                                  {center.name}
                                </Text>
                                {index === 0 && (
                                  <View className="bg-primary rounded-full px-2 py-0.5">
                                    <Text className="text-white text-xs font-inter font-bold">
                                      NEAREST
                                    </Text>
                                  </View>
                                )}
                              </View>
                              <Text className="text-sm font-inter text-content/60 dark:text-content-dark/60 mt-1">
                                {center.distance.toFixed(1)} miles away
                              </Text>
                            </View>
                            {selectedCenter?.id === center.id && (
                              <Check className="text-primary" size={24} />
                            )}
                          </View>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              {/* Error Message */}
              {error && (
                <View className="w-full max-w-md bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
                  <Text className="text-red-600 dark:text-red-400 font-inter text-center">
                    {error}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View className="pb-6">
          <Pressable
            onPress={handleContinue}
            disabled={!selectedCenter}
            className={`w-full max-w-md self-center items-center justify-center rounded-xl py-4 px-8 ${
              selectedCenter ? 'bg-primary active:bg-primary-press' : 'bg-gray-300 dark:bg-gray-700'
            }`}
          >
            <Text className="text-white font-inter font-semibold text-base">Continue</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  )
}
