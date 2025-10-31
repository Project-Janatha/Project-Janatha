import '@expo/metro-runtime'
import { useEffect, useContext, useState } from 'react'
import { useColorScheme, ActivityIndicator, View, Text } from 'react-native'
import { useFonts } from 'expo-font'
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { SplashScreen, Stack, Redirect, usePathname } from 'expo-router'
import { UserProvider, UserContext } from 'components/contexts'
import { IconButton } from 'components/ui'
import { Share } from 'lucide-react-native'
import '../globals.css'

export const unstable_settings = {
  initialRouteName: '(tabs)',
}

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  console.log('=== RootLayout Rendering ===')

  const [fontsLoaded, fontsError] = useFonts({
    'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
    'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf'),
    'Inter-SemiBold': require('../assets/fonts/Inter-SemiBold.ttf'),
    'Inter-Medium': require('../assets/fonts/Inter-Medium.ttf'),
    'Inter-Light': require('../assets/fonts/Inter-Light.ttf'),
  })

  const [fontTimeout, setFontTimeout] = useState(false)
  const colorScheme = useColorScheme()

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
        <Text className="font-inter dark:text-content-dark" style={{ marginTop: 10 }}>
          Loading fonts...
        </Text>
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
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <UserProvider>
        <RootLayoutNav />
      </UserProvider>
    </ThemeProvider>
  )
}

function RootLayoutNav() {
  const colorScheme = useColorScheme()
  const { isAuthenticated, loading } = useContext(UserContext)
  const pathname = usePathname()

  console.log(
    'RootLayoutNav - isAuthenticated:',
    isAuthenticated,
    'pathname:',
    pathname,
    'loading:',
    loading
  )

  // Show loading screen while checking auth
  if (loading) {
    console.log('SHOWING LOADING SCREEN')
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#ea580c" />
        <Text style={{ marginTop: 10 }}>Loading...</Text>
      </View>
    )
  }
  if (!isAuthenticated && pathname !== '/auth') {
    console.log('REDIRECTING TO AUTH')
    return <Redirect href="/auth" />
  }

  console.log('RENDERING STACK')
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="auth"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="profile"
          options={{
            headerShown: false,
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="events/[id]"
          options={({ route }) => ({
            headerShown: true,
            title: 'Event Details',
            headerBackTitleVisible: false,
            headerRight: () => (
              <IconButton
                className="text-primary bg-white rounded-full p-2 border border-primary mr-3"
                onPress={() => {
                  console.log('Share event')
                }}
              >
                <Share size={20} />
              </IconButton>
            ),
          })}
        />
        <Stack.Screen
          name="center/[id]"
          options={({ route }) => ({
            headerShown: true,
            title: 'Center Details',
            headerBackTitleVisible: false,
            headerRight: () => (
              <IconButton
                className="text-primary bg-white rounded-full p-2 border border-primary mr-3"
                onPress={() => {
                  console.log('Share center')
                }}
              >
                <Share size={20} />
              </IconButton>
            ),
          })}
        />
      </Stack>
    </ThemeProvider>
  )
}
