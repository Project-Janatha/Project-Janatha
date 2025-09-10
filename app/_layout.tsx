import '../tamagui-web.css'

import { useEffect, useContext } from 'react'
import { useColorScheme } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { SplashScreen, Stack, Redirect, usePathname } from 'expo-router'
import { Provider } from 'components';
import { useTheme } from 'tamagui';
import { UserProvider, UserContext } from 'components';


export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router'

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
export default function RootLayout() {
  // const [interLoaded, interError] = useFonts({
  //   Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
  //   InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  // })


  const [loaded, loadError] = useFonts({
    'AnekLatin': require('../assets/fonts/AnekLatin-Regular.ttf'),
    'AnekLatin-Medium': require('../assets/fonts/AnekLatin-Medium.ttf'),
    'AnekLatin-Bold': require('../assets/fonts/AnekLatin-Bold.ttf'),
  });

  useEffect(() => {
    if (loaded || loadError) {
      // Hide the splash screen after the fonts have loaded (or an error was returned) and the UI is ready.
      SplashScreen.hideAsync()
    }
  }, [loaded, loadError])

  if (!loaded && !loadError) {
    return null
  }

  return (
    <Providers>
      <RootLayoutNav />
    </Providers>
  )
}

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <UserProvider>
      <Provider>{children}</Provider>
    </UserProvider>
  )
}

function RootLayoutNav() {
  const colorScheme = useColorScheme()
  const theme = useTheme()
  const { user, isAuthenticated } = useContext(UserContext);

  const pathname = usePathname();
  if (!isAuthenticated && pathname !== '/auth') {
    return <Redirect href="/auth" />
  }
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
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
            title: 'Log In or Sign Up',
            presentation: 'modal',
            animation: 'slide_from_right',
            gestureEnabled: true,
            gestureDirection: 'horizontal',
            contentStyle: {
              backgroundColor: theme.background.val,
            },
          }}
        />
      </Stack>
    </ThemeProvider>
  )
}
