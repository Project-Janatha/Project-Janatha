import { useEffect, useContext } from 'react'
import { useColorScheme, ActivityIndicator } from 'react-native'
import { useFonts } from 'expo-font'
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { Platform } from 'react-native'
import { SplashScreen, Stack, Redirect, usePathname } from 'expo-router'
import { UserProvider, UserContext } from 'components/contexts'
import { IconButton } from 'components/ui'
import { Share } from 'lucide-react-native'
import '../globals.css'

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
}

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

/**
 * RootLayout Component
 * @return {JSX.Element} A Map component that displays a map using mapboxgl.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [fontsLoaded, fontsError] = useFonts({
    'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
    'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf'),
    'Inter-SemiBold': require('../assets/fonts/Inter-SemiBold.ttf'),
    'Inter-Medium': require('../assets/fonts/Inter-Medium.ttf'),
    'Inter-Light': require('../assets/fonts/Inter-Light.ttf'),
  })

  useEffect(() => {
    if (fontsLoaded || fontsError) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded, fontsError])

  if (!fontsLoaded && !fontsError) {
    return <ActivityIndicator className="text-primary text-lg" /> // Use your primary color
  }

  return (
    <UserProvider>
      <RootLayoutNav />
    </UserProvider>
  )
}

function RootLayoutNav() {
  const colorScheme = useColorScheme()
  const { isAuthenticated } = useContext(UserContext)

  const pathname = usePathname()
  if (!isAuthenticated && pathname !== '/auth') {
    return <Redirect href="/auth" />
  }
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
            //title: 'Log In or Sign Up',
            //presentation: 'modal',
            //animation: 'slide_from_right',
            //gestureEnabled: true,
            //gestureDirection: 'horizontal',
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
                  // TODO: Implement share functionality
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
                  // TODO: Implement share functionality
                  console.log('Share event')
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
