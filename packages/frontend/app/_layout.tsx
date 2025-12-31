import '@expo/metro-runtime'
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
      SplashScreen.hideAsync()
        .then(() => {
          setSplashHidden(true)
        })
        .catch(() => {
          setSplashHidden(true)
        })
    }
  }, [fontsLoaded, fontsError, fontTimeout, splashHidden])

  if (!fontsLoaded && !fontsError && !fontTimeout) {
    return (
      <View
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}
      >
        <ActivityIndicator size="large" color="#ea580c" />
        <Text style={{ marginTop: 10 }}>Loading fonts...</Text>
      </View>
    )
  }
  // If fonts failed to load, show error
  if (fontsError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 18, color: 'red' }}>Font loading failed</Text>
        <Text style={{ marginTop: 10 }}>Continuing anyway...</Text>
      </View>
    )
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
  const [isRedirecting, setIsRedirecting] = useState(false)

  // Handle authentication redirects - only once when loading completes
  useEffect(() => {
    if (loading || isRedirecting) return

    // Skip redirect logic if already on the correct page
    if (pathname === '/auth' && !isAuthenticated) return
    if (pathname !== '/auth' && isAuthenticated) return

    // Perform redirect
    setIsRedirecting(true)
    if (!isAuthenticated && pathname !== '/auth') {
      router.replace('/auth')
    } else if (isAuthenticated && pathname === '/auth') {
      router.replace('/(tabs)')
    }

    // Reset redirecting flag after a short delay
    const timer = setTimeout(() => setIsRedirecting(false), 500)
    return () => clearTimeout(timer)
  }, [isAuthenticated, loading, pathname, router, isRedirecting])

  const navTheme = isDark ? DarkTheme : DefaultTheme

  // Show loading screen while checking authentication - moved after all hooks
  if (loading && pathname !== '/auth') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#ea580c" />
        <Text style={{ marginTop: 10 }}>Loading...</Text>
      </View>
    )
  }

  return (
    <NavigationThemeProvider value={navTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
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
