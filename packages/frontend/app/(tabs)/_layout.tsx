import { Link, Tabs, useRouter, usePathname } from 'expo-router'
import { Platform, View, Text, Pressable } from 'react-native'
import { useState } from 'react'
import { useUser, useThemeContext } from '../../components/contexts'
import { User } from 'lucide-react-native'
import { Ionicons } from '@expo/vector-icons'
import SettingsPanel from '../../components/SettingsPanel'
import Logo from '../../components/ui/Logo'

/**
 * TabLayout Component - The main layout for the tab-based navigation.
 * @return {JSX.Element} A TabLayout component that sets up tab navigation with theming.
 */
export default function TabLayout() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useUser()
  const { isDark } = useThemeContext()
  const [settingsVisible, setSettingsVisible] = useState(false)

  const handleLogout = async () => {
    await logout()
    router.replace('/auth')
  }

  // Custom header with tabs for web
  const HeaderTitle = () => {
    if (Platform.OS !== 'web') {
      return null // Use default title on mobile
    }

    const isActive = (path: string) => pathname === path

    return (
      <View className="flex-row items-center gap-8">
        <Logo size={28} />
        <View className="flex-row gap-6">
          <Pressable
            onPress={() => router.push('/')}
            className="flex-row items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800"
          >
            {isActive('/') ? (
              <Ionicons name="compass" size={20} className=" text-primary" />
            ) : (
              <Ionicons
                name="compass-outline"
                size={20}
                className=" text-contentStrong dark:text-contentStrong-dark"
              />
            )}
            <Text
              className={`font-inter ${
                isActive('/')
                  ? 'text-primary font-inter-semibold transition-colors duration-300'
                  : 'text-contentStrong dark:text-contentStrong-dark transition-colors duration-300'
              }`}
            >
              Discover
            </Text>
          </Pressable>
        </View>
      </View>
    )
  }

  const HeaderRight = () => {
    if (!user) {
      return (
        <Link href="/auth" asChild>
          <Pressable
            className="mr-4 px-3 py-2 bg-primary rounded-full"
            onPress={() => router.push('/auth')}
          >
            <Text className="text-white text-base font-inter">Log In</Text>
          </Pressable>
        </Link>
      )
    }
    if (Platform.OS === 'web') {
      return (
        <>
          <Pressable
            className="mr-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700"
            onPress={() => setSettingsVisible(true)}
          >
            <User size={20} color={isDark ? '#fff' : '#9A3412'} />
          </Pressable>
          <SettingsPanel
            visible={settingsVisible}
            onClose={() => setSettingsVisible(false)}
            onLogout={handleLogout}
          />
        </>
      )
    }
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#9A3412',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle:
          Platform.OS === 'web'
            ? { display: 'none' }
            : {
                backgroundColor: isDark ? '#171717' : '#fff',
                borderTopColor: isDark ? '#262626' : '#E5E7EB',
              },
        headerStyle: {
          backgroundColor: isDark ? '#171717' : '#fff',
          borderBottomColor: isDark ? '#262626' : '#E5E7EB',
        },
        headerTitleStyle: {
          fontFamily: 'Inter-Bold',
        },
        headerTintColor: isDark ? '#fff' : '#000',
        tabBarLabelStyle: {
          fontFamily: 'Inter-Regular',
        },
        headerTitle: Platform.OS === 'web' ? () => <HeaderTitle /> : undefined,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color }) => <Ionicons name="compass" color={color as any} size={22} />,
          headerRight: () => <HeaderRight />,
        }}
      />
      {/* Explore tab disabled: merged into unified Discover tab (B3 design) */}
      <Tabs.Screen
        name="explore"
        options={{
          href: null, // Hide from tab bar and navigation
        }}
      />
    </Tabs>
  )
}
