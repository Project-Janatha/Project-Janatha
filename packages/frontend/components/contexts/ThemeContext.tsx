// theme.tsx
import { useColorScheme as useNativeWindColorScheme } from 'nativewind'
import { useCallback, useContext, useEffect, useMemo, useRef, useState, createContext } from 'react'
import { Platform, Appearance, View } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ThemePreference = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

interface ThemeContextValue {
  /** The resolved, effective theme ("light" | "dark") */
  theme: ResolvedTheme
  /** What the user explicitly chose */
  preference: ThemePreference
  setPreference: (pref: ThemePreference) => void
  /** Convenience boolean */
  isDark: boolean
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = '@theme'
const isWeb = Platform.OS === 'web'

// ─── Storage helpers ──────────────────────────────────────────────────────────

function storageRead(): ThemePreference {
  if (isWeb && typeof window !== 'undefined') {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === 'light' || v === 'dark' || v === 'system') return v
  }
  return 'system'
}

function storageWrite(pref: ThemePreference): void {
  if (isWeb && typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, pref)
  } else {
    AsyncStorage.setItem(STORAGE_KEY, pref).catch(() => {})
  }
}

// ─── Web DOM helper (Twitter-style: toggle class + colorScheme on <html>) ─────

function applyToDOM(theme: ResolvedTheme): void {
  if (!isWeb || typeof document === 'undefined') return
  const root = document.documentElement
  root.classList.toggle('dark', theme === 'dark')
  root.style.colorScheme = theme
}

// ─── System-theme hook ────────────────────────────────────────────────────────

function useSystemTheme(): ResolvedTheme {
  const getSystem = (): ResolvedTheme => (Appearance.getColorScheme() === 'dark' ? 'dark' : 'light')

  const [system, setSystem] = useState<ResolvedTheme>(getSystem)

  useEffect(() => {
    if (isWeb) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = (e: MediaQueryListEvent) => setSystem(e.matches ? 'dark' : 'light')
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }

    const sub = Appearance.addChangeListener(({ colorScheme }) =>
      setSystem(colorScheme === 'dark' ? 'dark' : 'light')
    )
    return () => sub.remove()
  }, [])

  return system
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextValue | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { setColorScheme } = useNativeWindColorScheme()
  const system = useSystemTheme()
  const [preference, setPreferenceState] = useState<ThemePreference>(storageRead)
  const preferenceRef = useRef(preference)

  useEffect(() => {
    preferenceRef.current = preference
  }, [preference])

  // On native: hydrate from AsyncStorage (web is sync via localStorage)
  useEffect(() => {
    if (isWeb) return
    AsyncStorage.getItem(STORAGE_KEY)
      .then((v) => {
        if (v === 'light' || v === 'dark' || v === 'system') setPreferenceState(v)
      })
      .catch(() => {})
  }, [])

  // Resolve: "system" falls back to OS preference
  const theme: ResolvedTheme = preference === 'system' ? system : preference

  // Apply to NativeWind (native) + DOM (web) on every change
  useEffect(() => {
    if (!isWeb) {
      setColorScheme(preference)
    }
    if (isWeb) {
      applyToDOM(theme)
    }
  }, [theme, preference, setColorScheme])

  // Public setter: update state + persist
  const setPreference = useCallback((pref: ThemePreference) => {
    setPreferenceState(pref)
    storageWrite(pref)
  }, [])

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, preference, setPreference, isDark: theme === 'dark' }),
    [theme, preference, setPreference]
  )

  // On web the <html> class handles everything; on native we need a root View
  // that carries the NativeWind dark-mode class so child components resolve
  // their dark: variants correctly.
  return (
    <ThemeContext.Provider value={value}>
      {isWeb ? (
        children
      ) : (
        <View className={`flex-1${theme === 'dark' ? ' dark' : ''}`} style={{ flex: 1 }}>
          {children}
        </View>
      )}
    </ThemeContext.Provider>
  )
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx
}