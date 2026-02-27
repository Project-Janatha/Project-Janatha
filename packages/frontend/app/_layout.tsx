import '@expo/metro-runtime'
// import '../config/performance'
// import '../config/devtools'
import { useEffect, useContext, useState } from 'react'
import { ActivityIndicator, View, Text } from 'react-native'
import { useFonts } from 'expo-font'
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from '@react-navigation/native'
import { SplashScreen, Stack, usePathname, useRouter } from 'expo-router'
import {
  UserProvider,
  useUser,
  ThemeProvider as CustomThemeProvider,
  useThemeContext,
} from '../components/contexts'
import { IconButton } from '../components/ui'
import { Share } from 'lucide-react-native'
import '../globals.css'

export const unstable_settings = {
  initialRouteName: '(tabs)',
}

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [fontsLoaded, fontsError] = useFonts({
    'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
    'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf'),
    'Inter-SemiBold': require('../assets/fonts/Inter-SemiBold.ttf'),
    'Inter-Medium': require('../assets/fonts/Inter-Medium.ttf'),
    'Inter-Light': require('../assets/fonts/Inter-Light.ttf'),
  })

  const [fontTimeout, setFontTimeout] = useState(false)
  const [splashHidden, setSplashHidden] = useState(false)

  // Add a timeout in case fonts don't load
  useEffect(() => {
    if (fontsLoaded || fontsError) return // Don't set timeout if already loaded/errored

    const timer = setTimeout(() => {
      if (!fontsLoaded && !fontsError) {
        setFontTimeout(true)
      }
    }, 3000) // 3 second timeout

    return () => clearTimeout(timer)
  }, [fontsLoaded, fontsError])

  useEffect(() => {
    if ((fontsLoaded || fontsError || fontTimeout) && !splashHidden) {
      setSplashHidden(true)
      SplashScreen.hideAsync().catch(() => {})
    }
  }, [fontsLoaded, fontsError, fontTimeout, splashHidden])

  if (!fontsLoaded && !fontsError && !fontTimeout) {
    return null
  }

  if (fontsError) {
    return null
  }

  return (
    <CustomThemeProvider>
      <UserProvider>
        <RootLayoutNav />
      </UserProvider>
    </CustomThemeProvider>
  )
}

function RootLayoutNav() {
  const { user, loading } = useUser()
  const { isDark } = useThemeContext()
  const pathname = usePathname()
  const router = useRouter()
  const isAuthenticated = !!user

  useEffect(() => {
    if (loading) return

    const inAuthGroup = pathname.startsWith('/auth')
    const inOnboardingGroup = pathname.startsWith('/onboarding')
    const inLandingPage = pathname === '/landing'

    if (!isAuthenticated) {
      // User is NOT authenticated — show landing page by default
      if (!inAuthGroup && !inLandingPage) {
        router.replace('/landing')
      }
    } else {
      // User IS authenticated

      // Check for completion flag OR fallback to checking fields
      const isComplete =
        user.profileComplete || user.profileComplete || (!!user.firstName && !!user.lastName)

      if (!isComplete) {
        // User needs to onboard
        if (!inOnboardingGroup) {
          router.replace('/onboarding')
        }
      } else {
        // User is fully onboarded
        if (inAuthGroup || inOnboardingGroup) {
          // Redirect away from auth/onboarding pages to Home
          router.replace('/(tabs)')
        }
      }
    }
  }, [user, loading, pathname, isAuthenticated])

  const navTheme = isDark ? DarkTheme : DefaultTheme

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#ea580c" />
      </View>
    )
  }

  return (
    <NavigationThemeProvider value={navTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="landing" options={{ headerShown: false }} />
        {/* Registering onboarding explicitly ensures stable navigation */}
        <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen
          name="settings"
          options={{ headerShown: true }} // Explicitly show for settings
        />
        <Stack.Screen
          name="events/index"
          options={{
            headerShown: true,
            title: 'My Events',
            headerBackTitle: '',
          }}
        />
        <Stack.Screen
          name="events/[id]"
          options={{
            headerShown: true,
            title: 'Event Details',
            headerBackTitle: '', // Use empty string instead of headerBackTitleVisible
            headerRight: () => (
              <IconButton
                className="text-primary bg-white rounded-full p-2 border border-primary mr-3"
                onPress={() => {}}
              >
                <Share size={20} />
              </IconButton>
            ),
          }}
        />
        <Stack.Screen
          name="center/[id]"
          options={{
            headerShown: true,
            title: 'Center Details',
            headerBackTitle: '', // Use empty string instead of headerBackTitleVisible
            headerRight: () => (
              <IconButton
                className="text-primary bg-white rounded-full p-2 border border-primary mr-3"
                onPress={() => {}}
              >
                <Share size={20} />
              </IconButton>
            ),
          }}
        />
      </Stack>
    </NavigationThemeProvider>
  )
}
