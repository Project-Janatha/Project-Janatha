// theme.tsx
import { useColorScheme as useNativeWindColorScheme } from 'nativewind'
import { useCallback, useContext, useEffect, useMemo, useRef, useState, createContext } from 'react'
import { Appearance, Platform, View } from 'react-native'
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
//
// Twitter writes `color-scheme` on <html> and toggles a "dark" class so both
// Tailwind/NativeWind and native CSS `prefers-color-scheme` media queries stay
// in sync without a flash of unstyled content.

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
      // On web, mirror the OS via a media-query listener (most reliable)
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = (e: MediaQueryListEvent) => setSystem(e.matches ? 'dark' : 'light')
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }

    // On native, re-read on mount in case Appearance was uninitialized
    // when the useState initializer ran (iOS cold start sometimes returns
    // null briefly). Then subscribe to OS changes via Appearance.
    setSystem(Appearance.getColorScheme() === 'dark' ? 'dark' : 'light')
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

  // Keep ref current so async callbacks always see the latest value
  useEffect(() => {
    preferenceRef.current = preference
  }, [preference])

  // ── On native: hydrate from AsyncStorage (web is sync via localStorage) ───
  useEffect(() => {
    if (isWeb) return
    AsyncStorage.getItem(STORAGE_KEY)
      .then((v) => {
        if (v === 'light' || v === 'dark' || v === 'system') setPreferenceState(v)
      })
      .catch(() => {})
  }, [])

  // ── Resolve: "system" falls back to OS preference ─────────────────────────
  const theme: ResolvedTheme = preference === 'system' ? system : preference

  // ── Apply to NativeWind + DOM on every change ──────────────────────────────
  //
  // Platform split is deliberate:
  //
  //   Web: pass the *preference* ('system' | 'light' | 'dark'). Browsers
  //   resolve `system` natively via `prefers-color-scheme` CSS, NativeWind
  //   reads `<html>`'s `color-scheme`, and the listener in `useSystemTheme`
  //   keeps `theme` in sync for any code that reads it directly. This is
  //   what shipped after PR #173 was reverted.
  //
  //   Native: pass the *resolved* theme ('light' | 'dark'). NativeWind v4
  //   on native does NOT resubscribe to `Appearance` when given the literal
  //   string `'system'` — it reads OS once and caches. So when the user
  //   flips iOS dark mode mid-session, NativeWind's `dark:` variants stay
  //   on the old value even though our `theme` state has flipped.
  //   Forcing a resolved value sidesteps NativeWind's system-tracking
  //   entirely; our `useSystemTheme` hook already subscribes to
  //   `Appearance.addChangeListener` and updates `system` (and therefore
  //   `theme`) on its own, so this effect re-runs on every OS flip.
  useEffect(() => {
    if (isWeb) {
      setColorScheme(preference)
      document.documentElement.classList.toggle('dark', theme === 'dark')
      document.documentElement.style.colorScheme = theme
    } else {
      setColorScheme(theme)
    }
  }, [theme, preference, setColorScheme])

  // ── Public setter: update state + persist ─────────────────────────────────
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
  //
  // The `key={theme}` on the native wrapper is a defensive belt-and-suspenders
  // remount: if NativeWind ever caches a `dark:` resolution at component level
  // and skips the re-render on a class change, keying forces React to throw
  // away the subtree and rebuild it with the new theme.
  return (
    <ThemeContext.Provider value={value}>
      {isWeb ? (
        children
      ) : (
        <View
          key={theme}
          className={`flex-1${theme === 'dark' ? ' dark' : ''}`}
          style={{ flex: 1 }}
        >
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
