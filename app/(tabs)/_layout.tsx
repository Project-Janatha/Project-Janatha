import { Link, Tabs, useRouter } from 'expo-router'
import { Adapt, Button, Paragraph, Popover, Separator, useTheme, YStack } from 'tamagui'
import { Home, Compass, User, Settings, LogOut } from '@tamagui/lucide-icons'
import { Platform } from 'react-native'
import { useContext } from 'react'
import { UserContext } from 'components'

/**
 * TabLayout Component - The main layout for the tab-based navigation.
 * @return {JSX.Element} A TabLayout component that sets up tab navigation with theming.
 */
export default function TabLayout() {
  const theme = useTheme()
  const router = useRouter()
  // Get user and logout from UserContext
  const { user, logout } = useContext(UserContext);
  
  const handleLogout= async () => {
    await logout();
    router.replace('/auth');
  }

  // Change header right button based on platform and user state
  const HeaderRight = () => {
    if (!user) {
      return (
        <Link href="/auth" asChild>
          <Button mr="$4" size="$2.5">
            Log In
          </Button>
        </Link>
      )
    }
    // TODO: Add implementation for native layout (not priority for demo)
    if (Platform.OS === 'web') {
      return (
        <Popover size='$5' allowFlip>
          <Popover.Trigger>
            {/*TODO: allow users to upload profile avatars*/}
            <Button mr="$4" size="$2.5" icon={<User size={20} color={theme.color} />} circular/>
          </Popover.Trigger>

          {/* for smaller web screens */}
          {/* <Adapt when="sm" platform={"web"}>
            <Popover.Sheet modal dismissOnSnapToBottom>
              <Popover.Sheet.Frame p="$4" >
                <Adapt.Contents />
              </Popover.Sheet.Frame>
              <Popover.Sheet.Overlay />
            </Popover.Sheet>
          </Adapt> */}

          <Popover.Content
            borderWidth={1}
            borderColor={'$borderColor'}
            enterStyle={{y: -10, opacity: 0}}
            exitStyle={{y: -10, opacity: 0}}
            animation={['quick', {opacity: { overshoot: .5 }}]}
          >
            <YStack 
              gap='$3' 
              p='$4' 
              alignItems='flex-start' 
              minWidth={200}
            >
              <Paragraph>{user.username}</Paragraph>
              <Separator />
              {/* TODO: Implement settings page */}
              <Button icon={<Settings size={16} />} onPress={() => router.push('/settings')} size="$3" >
                Settings
              </Button>
              <Button icon={<LogOut size={16} />} bg="red" onPress={handleLogout} size="$3" >
                Log Out
              </Button>
            </YStack>
            </Popover.Content>

        </Popover>
      )
    }
  }
  

  // TODO: Make UX better for web
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '$primary',
        tabBarStyle: {
          backgroundColor: theme.background.val,
          borderTopColor: theme.borderColor.val,
        },
        headerStyle: {
          backgroundColor: theme.background.val,
          borderBottomColor: theme.borderColor.val,
        },
        headerTintColor: theme.color.val,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home color={color as any} />,
          headerRight: () => <HeaderRight />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <Compass color={color as any} />,
        }}
      />
    </Tabs>
  )
}
