import { Link, Tabs, useRouter, usePathname } from 'expo-router'
import { Platform, View, Text, Pressable } from 'react-native'
import { useContext, useState } from 'react'
import { UserContext, useThemeContext } from '../../components/contexts'
import { GhostButton, DestructiveButton } from '../../components/ui'
import { Compass, User, Settings, LogOut } from 'lucide-react-native'
import { Ionicons } from '@expo/vector-icons'
import SettingsPanel from '../../components/SettingsPanel'

/**
 * TabLayout Component - The main layout for the tab-based navigation.
 * @return {JSX.Element} A TabLayout component that sets up tab navigation with theming.
 */
export default function TabLayout() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useContext(UserContext)
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
        <Text className="text-xl font-inter-bold text-content dark:text-content-dark">
          Chinmaya Janata
        </Text>
        <View className="flex-row gap-6">
          <Pressable
            onPress={() => router.push('/')}
            className="flex-row items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800"
          >
            {isActive('/') ? (
              <Ionicons name="home" size={20} className=" text-primary" />
            ) : (
              <Ionicons
                name="home-outline"
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
              Home
            </Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/explore')}
            className="flex-row items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800"
          >
            {isActive('/explore') ? (
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
                isActive('/explore')
                  ? 'text-primary font-inter-semibold'
                  : 'text-contentStrong dark:text-contentStrong-dark'
              }`}
            >
              Explore
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
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home" color={color as any} size={20} />,
          headerRight: () => <HeaderRight />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <Ionicons name="compass" color={color as any} size={24} />,
          headerRight: () => <HeaderRight />,
        }}
      />
    </Tabs>
  )
}
