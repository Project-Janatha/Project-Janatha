import { useColorScheme as useNativeWindColorScheme } from 'nativewind'
import { Appearance, Platform } from 'react-native'
import { useEffect, useState, useMemo, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const THEME_KEY = '@theme_preference'

function getSavedPreference(): 'light' | 'dark' | 'system' | null {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const v = localStorage.getItem(THEME_KEY)
    if (v === 'light' || v === 'dark' || v === 'system') return v
  }
  return null
}

function applyWebTheme(theme: 'light' | 'dark') {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return
  document.documentElement.classList.toggle('dark', theme === 'dark')
  document.documentElement.style.colorScheme = theme
}

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { colorScheme, setColorScheme } = useNativeWindColorScheme()

  useEffect(() => {
    let cancelled = false
    const init = async () => {
      const saved = await AsyncStorage.getItem(THEME_KEY).catch(() => null)
      if (cancelled) return

      if (saved === 'light' || saved === 'dark') {
        if (Platform.OS !== 'web') Appearance.setColorScheme(saved)
        setColorScheme(saved)
        applyWebTheme(saved)
      }
      // If 'system' or no pref, do nothing — nativewind already follows system
    }
    init()
    return () => { cancelled = true }
  }, [setColorScheme, colorScheme])

  return <>{children}</>
}

export const useThemeContext = () => {
  const { colorScheme, setColorScheme, toggleColorScheme } = useNativeWindColorScheme()
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

  const setThemePreference = useCallback(
    async (mode: 'light' | 'dark' | 'system') => {
      setPref(mode)
      AsyncStorage.setItem(THEME_KEY, mode).catch(() => {})

      if (mode === 'system') {
        if (Platform.OS !== 'web') Appearance.setColorScheme(null)
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
