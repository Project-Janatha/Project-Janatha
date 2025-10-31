import { Link, Tabs, useRouter } from 'expo-router'
import { Platform, View, Text, Pressable, useColorScheme } from 'react-native'
import { useContext } from 'react'
import { UserContext } from 'components/contexts'
import { GhostButton, DestructiveButton } from 'components/ui'
import { Home, Compass, User, Settings, LogOut } from 'lucide-react-native'

/**
 * TabLayout Component - The main layout for the tab-based navigation.
 * @return {JSX.Element} A TabLayout component that sets up tab navigation with theming.
 */
export default function TabLayout() {
  const router = useRouter()
  // Get user and logout from UserContext
  const { user, logout } = useContext(UserContext)
  const colorScheme = useColorScheme()

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
            className="mr-4 px-3 py-2 bg-primary rounded-lg"
            onPress={() => router.push('/auth')}
          >
            <Text className="text-white text-base">Log In</Text>
          </Pressable>
        </Link>
      )
    }
    // TODO: Add implementation for native layout (not priority for demo)
    if (Platform.OS === 'web') {
      return (
        <View className="mr-4 flex flex-col items-start">
          <Pressable
            className="p-2 rounded-full bg-gray-200"
            onPress={() => router.push('/profile')}
          >
            <User size={20} color="#9A3412" />
          </Pressable>
          <Text className="mt-2 text-base">{user.username}</Text>
          <GhostButton
            icon={<Settings size={16} color="#9A3412" />}
            onPress={() => router.push('/profile')}
            size={3}
          >
            Settings
          </GhostButton>
          <DestructiveButton
            icon={<LogOut size={16} color="#9A3412" />}
            onPress={handleLogout}
            size={3}
          >
            Log Out
          </DestructiveButton>
        </View>
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
