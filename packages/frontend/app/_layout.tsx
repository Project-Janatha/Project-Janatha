import '@expo/metro-runtime'
import { useEffect } from 'react'
import { ActivityIndicator, LogBox, Platform, View } from 'react-native'

// Suppress non-fatal WorkletsTurboModule error in Expo Go (reanimated v4 compat)
LogBox.ignoreLogs(['Exception in HostFunction: <unknown>'])
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from '@react-navigation/native'
import { SplashScreen, Stack, usePathname, useRouter } from 'expo-router'
import { PostHogProvider } from 'posthog-react-native'
import {
  UserProvider,
  useUser,
  ThemeProvider as CustomThemeProvider,
  useThemeContext,
} from '../components/contexts'
import { ErrorBoundary } from '../components/ui/ErrorBoundary'
import '../globals.css'

export const unstable_settings = {
  initialRouteName: '(tabs)',
}

SplashScreen.preventAutoHideAsync()

const posthogHost =
  process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'
const posthogKey = (process.env.EXPO_PUBLIC_POSTHOG_KEY || '').trim()
const posthogEnabled = posthogKey.length > 0

export default function RootLayout() {
  useEffect(() => {
    // Fonts are statically embedded via expo-font config plugin (app.json).
    // iOS: loaded from UIAppFonts at launch; Web: @font-face in globals.css.
    // No runtime CTFontManagerRegisterFontsForURL call needed.
    SplashScreen.hideAsync().catch(() => {})
  }, [])

  return (
    <PostHogProvider
      apiKey={posthogEnabled ? posthogKey : 'disabled'}
      options={{
        host: posthogHost,
        disabled: !posthogEnabled,
      }}
    >
      <ErrorBoundary>
        <CustomThemeProvider>
          <UserProvider>
            <RootLayoutNav />
          </UserProvider>
        </CustomThemeProvider>
      </ErrorBoundary>
    </PostHogProvider>
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
      // But allow access to legal pages and auth without redirect
      if (!inAuthGroup && !inLandingPage && !pathname.startsWith('/privacy') && !pathname.startsWith('/terms') && !pathname.startsWith('/cookies')) {
        router.replace('/landing')
      }
    } else {
      // User IS authenticated

      // Check for completion flag OR fallback to checking fields
      const isComplete =
        user.profileComplete || (!!user.firstName && !!user.lastName)

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
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="events/form"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="center/[id]"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="privacy"
          options={{ headerShown: Platform.OS !== 'web', title: 'Privacy Policy', headerBackTitle: '' }}
        />
        <Stack.Screen
          name="terms"
          options={{ headerShown: Platform.OS !== 'web', title: 'Terms of Service', headerBackTitle: '' }}
        />
        <Stack.Screen
          name="cookies"
          options={{ headerShown: Platform.OS !== 'web', title: 'Cookie Policy', headerBackTitle: '' }}
        />
        <Stack.Screen
          name="admin"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </NavigationThemeProvider>
  )
}
