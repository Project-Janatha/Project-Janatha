import '@expo/metro-runtime'
// import '../config/performance'
// import '../config/devtools'
import { useEffect, useState } from 'react'
import { ActivityIndicator, View, Platform } from 'react-native'
import { useFonts } from 'expo-font'
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from '@react-navigation/native'
import { SplashScreen, Slot, usePathname, useRouter } from 'expo-router'
import { useWebFonts } from '../hooks/useWebFonts'
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
  const { user, authStatus, onboardingComplete } = useUser()
  const { isDark } = useThemeContext()
  const pathname = usePathname()
  const router = useRouter()
  const isAuthenticated = authStatus === 'authenticated'
  const [navReady, setNavReady] = useState(false)
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    if (pathname) {
      setNavReady(true)
    }
  }, [pathname])

  useEffect(() => {
    if (authStatus === 'booting') return
    if (!navReady) return
    const inAuthGroup = pathname.startsWith('/auth')
    const inOnboardingGroup = pathname.startsWith('/onboarding')
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
      if (redirecting) return
      setRedirecting(true)
      router.replace(targetRoute)
      setTimeout(() => setRedirecting(false), 500)
    }
  }, [authStatus, isAuthenticated, navReady, pathname, redirecting, router, user])

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
      <Slot />
    </NavigationThemeProvider>
  )
}
