import '@expo/metro-runtime'
// import '../config/performance'
// import '../config/devtools'
import { useEffect, useState } from 'react'
import { ActivityIndicator, View } from 'react-native'
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
  const { user, loading, authStatus } = useUser()
  const { isDark } = useThemeContext()
  const pathname = usePathname()
  const router = useRouter()
  const isAuthenticated = authStatus === 'authenticated'

  useEffect(() => {
    if (authStatus === 'booting') return

    const inAuthGroup = pathname.startsWith('/auth')
    const inOnboardingGroup = pathname.startsWith('/onboarding')
    const inTabsGroup = pathname.startsWith('/(tabs)')

    let targetRoute: '/auth' | '/onboarding' | '/(tabs)' | null = null

    if (!isAuthenticated) {
      if (!inAuthGroup) {
        targetRoute = '/auth'
      }
    } else {
      const hasCompletedOnboarding =
        user?.profileComplete === true || (!!user?.firstName && !!user?.lastName && !!user?.email)

      if (!hasCompletedOnboarding) {
        if (!inOnboardingGroup) {
          targetRoute = '/onboarding'
        }
      } else {
        if (inAuthGroup || inOnboardingGroup) {
          targetRoute = '/(tabs)'
        }
      }
    }

    if (targetRoute && pathname !== targetRoute) {
      router.replace(targetRoute)
    }
  }, [authStatus, isAuthenticated, pathname, router, user])

  const navTheme = isDark ? DarkTheme : DefaultTheme

  if (authStatus === 'booting') {
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
        {/* Registering onboarding explicitly ensures stable navigation */}
        <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen
          name="profile"
          options={{
            headerShown: false,
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="settings"
          options={{ headerShown: true }} // Explicitly show for settings
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
