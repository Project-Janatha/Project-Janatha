import { Link, Tabs, useRouter } from 'expo-router'
import { Platform, View, Text, Pressable, useColorScheme } from 'react-native'
import { useContext, useState } from 'react'
import { UserContext } from 'components/contexts'
import { GhostButton, DestructiveButton } from 'components/ui'
import { Home, Compass, User, Settings, LogOut } from 'lucide-react-native'
import SettingsPanel from 'components/SettingsPanel'

/**
 * TabLayout Component - The main layout for the tab-based navigation.
 * @return {JSX.Element} A TabLayout component that sets up tab navigation with theming.
 */
export default function TabLayout() {
  const router = useRouter()
  // Get user and logout from UserContext
  const { user, logout } = useContext(UserContext)
  const colorScheme = useColorScheme()
  const [settingsVisible, setSettingsVisible] = useState(false)

  const handleLogout = async () => {
    await logout()
    router.replace('/auth')
  }

  // Change header right button based on platform and user state
  const HeaderRight = () => {
    if (!user) {
      return (
        <Link href="/auth" asChild>
          <Pressable
            className="mr-4 px-3 py-2 bg-primary rounded-full"
            onPress={() => router.push('/auth')}
          >
            <Text className="text-white text-base">Log In</Text>
          </Pressable>
        </Link>
      )
    }
    if (Platform.OS === 'web') {
      return (
        <>
          <Pressable
            className="mr-4 p-2 rounded-full bg-gray-200"
            onPress={() => setSettingsVisible(true)}
          >
            <User size={20} color="#9A3412" />
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

  // TODO: Make UX better for web
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#9A3412', // primary color - orange-800
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: colorScheme === 'dark' ? '#111827' : '#fff', // dark:bg-background-dark
          borderTopColor: colorScheme === 'dark' ? '#1f2937' : '#E5E7EB',
        },
        headerStyle: {
          backgroundColor: colorScheme === 'dark' ? '#111827' : '#fff', // dark mode
          borderBottomColor: colorScheme === 'dark' ? '#1f2937' : '#E5E7EB',
        },
        headerTintColor: colorScheme === 'dark' ? '#fff' : '#000',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home color={color as any} size={20} />,
          headerRight: () => <HeaderRight />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <Compass color={color as any} size={20} />,
        }}
      />
    </Tabs>
  )
}
