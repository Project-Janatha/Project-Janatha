import '../tamagui-web.css'

import { useEffect, useContext } from 'react'
import { useColorScheme } from 'react-native'
// Remove Tamagui web CSS import since Tamagui is not used
import { useFonts } from 'expo-font'
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { Platform } from 'react-native'
import { SplashScreen, Stack, Redirect, usePathname } from 'expo-router'
import { UserProvider, UserContext } from 'components'

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

  // Font loading - web uses CSS @font-face, native uses expo-font
  const [loaded, loadError] =
    Platform.OS === 'web'
      ? [true, null] // For web, fonts are loaded via CSS @font-face declarations
      : (() => {
          // For native platforms, we'll need to handle this differently
          // For now, just return loaded state
          return [true, null]
        })()

  useEffect(() => {
    if (loaded || loadError) {
      // Hide the splash screen after the fonts have loaded (or an error was returned) and the UI is ready.
      SplashScreen.hideAsync()
    }
  }, [loaded, loadError])

  if (!loaded && !loadError) {
    return null
  }

  return <UserProvider>{children}</UserProvider>
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
              <Button
                size="$3"
                circular
                icon={<Share size={20} />}
                variant="outlined"
                mr="$3"
                onPress={() => {
                  // TODO: Implement share functionality
                  console.log('Share event')
                }}
              />
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
              <Button
                size="$3"
                circular
                icon={<Share size={20} />}
                variant="outlined"
                mr="$3"
                onPress={() => {
                  // TODO: Implement share functionality
                  console.log('Share center')
                }}
              />
            ),
          })}
        />
      </Stack>
    </ThemeProvider>
  )
}
