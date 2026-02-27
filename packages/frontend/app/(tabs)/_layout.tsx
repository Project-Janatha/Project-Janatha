import { Link, Tabs, useRouter } from 'expo-router'
import { Platform, View, Text, Pressable, Image } from 'react-native'
import { useState } from 'react'
import { useUser, useThemeContext } from '../../components/contexts'
import { User, Settings, LogOut } from 'lucide-react-native'
import SettingsPanel from '../../components/SettingsPanel'
import Logo from '../../components/ui/Logo'

/**
 * TabLayout Component - The main layout for the tab-based navigation.
 * @return {JSX.Element} A TabLayout component that sets up tab navigation with theming.
 */
export default function TabLayout() {
  const router = useRouter()
  const { user, logout } = useUser()
  const { isDark } = useThemeContext()
  const [settingsVisible, setSettingsVisible] = useState(false)

  const handleLogout = async () => {
    await logout()
    router.replace('/auth')
  }

  // Custom header for web - just the logo
  const HeaderTitle = () => {
    if (Platform.OS !== 'web') {
      return null // Use default title on mobile
    }

    return (
      <View className="flex-row items-center">
        <Logo size={28} />
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

    // Mobile: show profile button with popover menu
    const displayName =
      user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.username || ''
    const profileImage =
      user?.profileImage || `https://i.pravatar.cc/150?u=${user?.username || 'default'}`

    return (
      <View style={{ position: 'relative' }}>
        <Pressable
          className="mr-4 p-2"
          onPress={() => setSettingsVisible(!settingsVisible)}
        >
          <User size={22} color={isDark ? '#fff' : '#9A3412'} />
        </Pressable>

        {settingsVisible && (
          <>
            {/* Backdrop to close popover */}
            <Pressable
              style={{ position: 'absolute', top: -1000, left: -1000, width: 5000, height: 5000, zIndex: 98 }}
              onPress={() => setSettingsVisible(false)}
            />

            {/* Popover */}
            <View
              style={{
                position: 'absolute',
                top: 44,
                right: 0,
                width: 220,
                zIndex: 99,
                backgroundColor: isDark ? '#171717' : '#fff',
                borderRadius: 16,
                borderWidth: 1,
                borderColor: isDark ? '#262626' : '#E5E7EB',
                shadowColor: '#000',
                shadowOpacity: 0.12,
                shadowRadius: 16,
                shadowOffset: { width: 0, height: 8 },
                elevation: 12,
                padding: 6,
              }}
            >
              {/* Profile info */}
              <View className="flex-row items-center px-2.5 py-3" style={{ borderBottomWidth: 1, borderBottomColor: isDark ? '#262626' : '#F0EDE8', marginBottom: 4 }}>
                <Image
                  source={{ uri: profileImage }}
                  className="w-10 h-10 rounded-full mr-3 bg-gray-300"
                />
                <View className="flex-1">
                  <Text className="text-[15px] font-inter-semibold text-content dark:text-content-dark">
                    {displayName}
                  </Text>
                </View>
              </View>

              {/* Profile */}
              <Pressable
                className="flex-row items-center py-2.5 px-3 rounded-[10px]"
                onPress={() => {
                  setSettingsVisible(false)
                  router.push('/settings')
                }}
              >
                <User size={18} color={isDark ? '#fff' : '#57534E'} />
                <Text className="ml-3 text-[15px] font-inter-medium text-content dark:text-content-dark">
                  Profile
                </Text>
              </Pressable>

              {/* Settings */}
              <Pressable
                className="flex-row items-center py-2.5 px-3 rounded-[10px]"
                onPress={() => {
                  setSettingsVisible(false)
                  router.push('/settings/settings')
                }}
              >
                <Settings size={18} color={isDark ? '#fff' : '#57534E'} />
                <Text className="ml-3 text-[15px] font-inter-medium text-content dark:text-content-dark">
                  Settings
                </Text>
              </Pressable>

              {/* Divider */}
              <View style={{ height: 1, backgroundColor: isDark ? '#262626' : '#F0EDE8', marginHorizontal: 10, marginVertical: 4 }} />

              {/* Log Out */}
              <Pressable
                className="flex-row items-center py-2.5 px-3 rounded-[10px]"
                onPress={() => {
                  setSettingsVisible(false)
                  handleLogout()
                }}
              >
                <LogOut size={18} color="#dc2626" />
                <Text className="ml-3 text-[15px] font-inter-medium text-red-600 dark:text-red-400">
                  Log Out
                </Text>
              </Pressable>
            </View>
          </>
        )}
      </View>
    )
  }

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: { display: 'none' },
        headerStyle: {
          backgroundColor: isDark ? '#171717' : '#fff',
          borderBottomColor: isDark ? '#262626' : '#E5E7EB',
        },
        headerTitleStyle: {
          fontFamily: 'Inter-Bold',
        },
        headerTintColor: isDark ? '#fff' : '#000',
        headerTitle: Platform.OS === 'web' ? () => <HeaderTitle /> : undefined,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '',
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
