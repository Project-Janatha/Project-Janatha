import { useMemo } from 'react'
import { useThemeContext } from '../components/contexts'

export type DetailColors = {
  panelBg: string
  text: string
  textSecondary: string
  textMuted: string
  border: string
  iconBoxBg: string
  cardBg: string
  avatarBorder: string
  attendedBg: string
  iconHeader: string
}

export function useDetailColors(): DetailColors {
  const { isDark } = useThemeContext()

  return useMemo(
    () =>
      isDark
        ? {
            panelBg: '#171717',      // neutral-900 — matches app shell
            text: '#F3F4F6',
            textSecondary: '#9CA3AF',
            textMuted: '#6B7280',
            border: '#404040',       // neutral-700
            iconBoxBg: '#262626',    // neutral-800
            cardBg: '#262626',       // neutral-800
            avatarBorder: '#171717',
            attendedBg: 'rgba(6,95,70,0.2)',
            iconHeader: '#9CA3AF',
          }
        : {
            panelBg: '#FFFFFF',
            text: '#1C1917',
            textSecondary: '#78716C',
            textMuted: '#A8A29E',
            border: '#E7E5E4',
            iconBoxBg: '#F5F5F4',
            cardBg: '#F5F5F4',
            avatarBorder: '#FFFFFF',
            attendedBg: '#ECFDF5',
            iconHeader: '#78716C',
          },
    [isDark]
  )
}
