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
  UserContext,
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

  // Add a timeout in case fonts don't load
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!fontsLoaded && !fontsError) {
        console.log('Font loading timeout - continuing anyway')
        setFontTimeout(true)
      }
    }, 3000) // 3 second timeout

    return () => clearTimeout(timer)
  }, [fontsLoaded, fontsError])

  console.log('Fonts loaded:', fontsLoaded, 'Fonts error:', fontsError)

  useEffect(() => {
    if (fontsLoaded || fontsError || fontTimeout) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded, fontsError, fontTimeout])

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
  const { user, loading } = useContext(UserContext)
  const { isDark } = useThemeContext()
  const pathname = usePathname()
  const router = useRouter()
  const isAuthenticated = !!user

  console.log(
    'RootLayoutNav - isAuthenticated:',
    isAuthenticated,
    'pathname:',
    pathname,
    'loading:',
    loading,
    'isDark:',
    isDark
  )

  useEffect(() => {
    if (pathname === '/auth') {
      console.log('On auth page, skipping redirect logic')
      return
    }

    if (!loading) {
      if (!isAuthenticated) {
        console.log('Not authenticated, redirecting to /auth')
        router.replace('/auth')
      } else if (pathname === '/auth') {
        console.log('Authenticated on auth page, redirecting to /(tabs)')
        router.replace('/(tabs)')
      }
    }
  }, [isAuthenticated, loading, pathname])

  if (loading && pathname !== '/auth') {
    console.log('SHOWING LOADING SCREEN')
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    )
  }

  const navTheme = isDark ? DarkTheme : DefaultTheme

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
                onPress={() => console.log('Share event')}
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
                onPress={() => console.log('Share center')}
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
