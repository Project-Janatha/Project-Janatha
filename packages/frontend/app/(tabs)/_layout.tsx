import { Link, Tabs, useRouter } from 'expo-router'
import { Platform, View, Text, Pressable, Image } from 'react-native'
import { useState } from 'react'
import { useUser, useThemeContext } from '../../components/contexts'
import { User, Settings, LogOut, Plus } from 'lucide-react-native'
import SettingsPanel from '../../components/SettingsPanel'
import Logo from '../../components/ui/Logo'
import { Avatar, PrimaryButton, SecondaryButton } from '../../components/ui'
import { usePostHog } from 'posthog-react-native'
import { isSuperAdmin } from '../../utils/admin'

/**
 * TabLayout Component - The main layout for the tab-based navigation.
 * @return {JSX.Element} A TabLayout component that sets up tab navigation with theming.
 */

export default function TabLayout() {
  const router = useRouter()
  const { user, logout } = useUser()
  const { isDark } = useThemeContext()
  const [settingsVisible, setSettingsVisible] = useState(false)
  const canCreate = isSuperAdmin(user)
  const posthog = usePostHog()

  const handleLogout = async () => {
    posthog?.capture('nav_logout')
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
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginRight: 16 }}>
          <SecondaryButton onPress={() => router.push('/auth?mode=login')}>
            Log In
          </SecondaryButton>
          <PrimaryButton onPress={() => router.push('/auth?mode=signup')}>
            Sign Up
          </PrimaryButton>
        </View>
      )
    }
if (Platform.OS === 'web') {
    const webProfileImage = user?.profileImage
    const getInitials = () => {
      if (user?.firstName && user?.lastName) return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
      if (user?.firstName) return user.firstName[0].toUpperCase()
      if (user?.username) return user.username[0].toUpperCase()
      return '?'
    }

    return (
        <View className="flex-row items-center" style={{ gap: 8 }}>
          {canCreate && (
            <Pressable
              className="px-3 py-2 rounded-full flex-row items-center"
              style={{ borderWidth: 1.5, borderColor: '#E8862A', backgroundColor: 'transparent', gap: 6 }}
              onPress={() => {
                posthog?.capture('nav_create_event')
                if (typeof window !== 'undefined') {
                  const isMobile = window.innerWidth < 768
                  if (isMobile) {
                    router.push('/events/form')
                  } else {
                    window.dispatchEvent(new CustomEvent('open-event-form'))
                  }
                }
              }}
            >
              <Plus size={16} color="#E8862A" />
              <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 13, color: '#E8862A' }}>
                Create Event
              </Text>
            </Pressable>
          )}
<Pressable
            className="mr-4 rounded-full overflow-hidden"
            style={{ width: 36, height: 36 }}
            onPress={() => {
              posthog?.capture('nav_menu_opened')
              setSettingsVisible(true)
            }}
          >
            {webProfileImage ? (
              <Image
                source={{ uri: webProfileImage }}
                style={{ width: 36, height: 36 }}
              />
            ) : (
              <View style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: '#C2410C',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>
                  {getInitials()}
                </Text>
              </View>
            )}
          </Pressable>
          <SettingsPanel
            visible={settingsVisible}
            onClose={() => setSettingsVisible(false)}
            onLogout={handleLogout}
          />
        </View>
      )
    }

// Mobile: show profile button with popover menu
    const displayName =
      user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.username || ''
    const profileImage = user?.profileImage

    return (
      <View style={{ position: 'relative' }}>
        <Pressable
          className="mr-4 p-2"
          onPress={() => {
            if (!settingsVisible) {
              posthog?.capture('nav_menu_opened')
            }
            setSettingsVisible(!settingsVisible)
          }}
        >
          <Avatar
            image={profileImage || undefined}
            name={displayName}
            size={26}
          />
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
                <Avatar
                  image={profileImage || undefined}
                  name={displayName}
                  size={40}
                  style={{ marginRight: 12 }}
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
                  posthog?.capture('nav_profile_opened')
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
                  posthog?.capture('nav_settings_opened')
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
