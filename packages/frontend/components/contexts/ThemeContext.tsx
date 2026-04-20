import { useColorScheme as useNativeWindColorScheme } from 'nativewind'
import { Appearance, Platform } from 'react-native'
import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const THEME_KEY = '@theme_preference'

function getSavedPreference(): 'light' | 'dark' | 'system' | null {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const v = localStorage.getItem(THEME_KEY)
    if (v === 'light' || v === 'dark' || v === 'system') return v
  }
  return null
}

function getWebSystemTheme(): 'light' | 'dark' {
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark'
  return 'light'
}

function applyWebTheme(theme: 'light' | 'dark') {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return
  document.documentElement.classList.toggle('dark', theme === 'dark')
  document.documentElement.style.colorScheme = theme
}

function subscribeToWebSystemChanges(fn: (theme: 'light' | 'dark') => void): () => void {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {}
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  const h = (e: MediaQueryListEvent) => fn(e.matches ? 'dark' : 'light')
  mq.addEventListener('change', h)
  return () => mq.removeEventListener('change', h)
}

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { colorScheme, setColorScheme } = useNativeWindColorScheme()

  useEffect(() => {
    let cancelled = false
    const init = async () => {
      const saved = await AsyncStorage.getItem(THEME_KEY).catch(() => null)
      if (cancelled) return

      const pref = saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'system'

      if (pref === 'system') {
        if (Platform.OS !== 'web') {
          // Native: let nativewind follow system automatically
          Appearance.setColorScheme(null)
        } else {
          // Web: manually apply system theme
          const sys = getWebSystemTheme()
          setColorScheme(sys)
          applyWebTheme(sys)
        }
      } else {
        if (Platform.OS !== 'web') Appearance.setColorScheme(pref)
        setColorScheme(pref)
        applyWebTheme(pref)
      }
    }
    init()
    return () => { cancelled = true }
  }, [setColorScheme, colorScheme])

  return <>{children}</>
}

export const useThemeContext = () => {
  const { colorScheme, setColorScheme } = useNativeWindColorScheme()
  const initialPref = getSavedPreference()
  const [pref, setPref] = useState<'light' | 'dark' | 'system'>(initialPref ?? 'system')
  const [loaded, setLoaded] = useState(initialPref !== null)

  useEffect(() => {
    if (loaded) return
    let cancelled = false
    AsyncStorage.getItem(THEME_KEY)
      .then((v) => {
        if (cancelled) return
        if (v === 'light' || v === 'dark' || v === 'system') setPref(v)
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
    return () => { cancelled = true }
  }, [loaded])

  // Web only: listen to system changes when in 'system' mode
  useEffect(() => {
    if (Platform.OS !== 'web' || pref !== 'system' || !loaded) return
    return subscribeToWebSystemChanges((theme) => {
      setColorScheme(theme)
      applyWebTheme(theme)
    })
  }, [pref, loaded, setColorScheme])

  const setThemePreference = useCallback(
    async (mode: 'light' | 'dark' | 'system') => {
      setPref(mode)
      AsyncStorage.setItem(THEME_KEY, mode).catch(() => {})

      if (mode === 'system') {
        if (Platform.OS !== 'web') {
          // Native: let nativewind follow system
          Appearance.setColorScheme(null)
        } else {
          // Web: apply current system theme
          const sys = getWebSystemTheme()
          setColorScheme(sys)
          applyWebTheme(sys)
        }
      } else {
        if (Platform.OS !== 'web') Appearance.setColorScheme(mode)
        setColorScheme(mode)
        applyWebTheme(mode)
      }
    },
    [setColorScheme]
  )

  return useMemo(
    () => ({
      isDark: colorScheme === 'dark',
      themePreference: pref,
      setThemePreference,
    }),
    [colorScheme, pref, setThemePreference]
  )
}
