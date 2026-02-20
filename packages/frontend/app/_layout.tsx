import '@expo/metro-runtime'
// import '../config/performance'
// import '../config/devtools'
import '../src/webBoot'
import { useEffect, useState } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { Platform } from 'react-native'
import { useFonts } from 'expo-font'
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from '@react-navigation/native'
import { SplashScreen, Slot, usePathname, useRouter } from 'expo-router'
import { useWebFonts } from '../hooks/useWebFonts'
import { Text } from 'react-native'
import {
  UserProvider,
  useUser,
  ThemeProvider as CustomThemeProvider,
  useThemeContext,
} from '../components/contexts'
import '../globals.css'

export const unstable_settings = {
  initialRouteName: '(tabs)',
}

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const isWeb = Platform.OS === 'web'
  const [fontsLoaded, fontsError] = useFonts(
    isWeb
      ? {}
      : {
          'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
          'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf'),
          'Inter-SemiBold': require('../assets/fonts/Inter-SemiBold.ttf'),
          'Inter-Medium': require('../assets/fonts/Inter-Medium.ttf'),
          'Inter-Light': require('../assets/fonts/Inter-Light.ttf'),
        }
  )
  const [webFontsLoaded] = useWebFonts()

  const [fontTimeout, setFontTimeout] = useState(false)
  const [splashHidden, setSplashHidden] = useState(false)

  useEffect(() => {
    if (isWeb && typeof window !== 'undefined') {
      window.__jn_markReady?.()
    }
  }, [isWeb])

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
    if (isWeb) return
    if ((fontsLoaded || fontsError || fontTimeout) && !splashHidden) {
      setSplashHidden(true)
      SplashScreen.hideAsync().catch(() => {})
    }
  }, [fontsLoaded, fontsError, fontTimeout, splashHidden, isWeb])

  if (!isWeb) {
    if (!fontsLoaded && !fontsError && !fontTimeout) {
      return null
    }
    if (fontsError) {
      return null
    }
  } else if (!webFontsLoaded) {
    // Avoid blocking web render on font loading
    // Web fonts will hydrate after first paint
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
  const { user, loading, authStatus, onboardingComplete, safeMode } = useUser()
  const { isDark } = useThemeContext()
  const pathname = usePathname()
  const router = useRouter()
  const isAuthenticated = authStatus === 'authenticated'
  const [debugEnabled, setDebugEnabled] = useState(false)
  const [noStack, setNoStack] = useState(false)
  const [isSafariWeb, setIsSafariWeb] = useState(false)

  useEffect(() => {
    if (Platform.OS !== 'web') return
    try {
      const ua = navigator.userAgent || ''
      setIsSafariWeb(/safari/i.test(ua) && !/chrome|crios|fxios|edg/i.test(ua))
      const params = new URLSearchParams(window.location.search)
      setDebugEnabled(params.get('debug') === '1')
      setNoStack(params.get('nostack') === '1')
    } catch {
      setDebugEnabled(false)
      setNoStack(false)
    }
  }, [])

  useEffect(() => {
    if (authStatus === 'booting') return
    if (safeMode || noStack) return

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
        onboardingComplete ||
        user?.profileComplete === true ||
        (!!user?.firstName && !!user?.lastName && !!user?.email)

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

  if (safeMode || noStack) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 16, marginBottom: 8 }}>
          {safeMode ? 'Safe mode enabled' : 'Navigation disabled'}
        </Text>
        <Text style={{ fontSize: 12, opacity: 0.7 }}>
          path: {pathname} | auth: {authStatus} | onboard: {String(onboardingComplete)}
        </Text>
      </View>
    )
  }

  return (
    <NavigationThemeProvider value={navTheme}>
      {debugEnabled && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(0,0,0,0.8)',
            paddingVertical: 6,
            paddingHorizontal: 10,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 12 }}>
            debug | path: {pathname} | auth: {authStatus} | onboard: {String(onboardingComplete)} |
            user: {user ? 'yes' : 'no'}
          </Text>
        </View>
      )}
      <Slot />
    </NavigationThemeProvider>
  )
}
