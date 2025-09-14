import { config as defaultConfig } from '@tamagui/config'
import { BackHandler } from 'react-native'
import { createFont, createTamagui, createTokens, isWeb } from 'tamagui'
const tokens = createTokens({
  ...defaultConfig.tokens,
  color: {
    primary: '#9A3412', // orange-800
    primaryPress: '#C2410C', // orange-900
  }
})


const systemFont = createFont({
  family: 'AnekLatin-Regular',
  size: {
    1: 12,
    2: 14,
    3: 15,
    4: 16,
    5: 18,
    6: 20,
    7: 24,
    8: 32,
    9: 48,
    10: 64,
  },
  lineHeight: {
    1: 20,
    2: 22,
    3: 24,
    4: 26,
    5: 28,
    6: 30,
    7: 34,
    8: 40,
    9: 56,
    10: 72,
  },
  weight: {
    1: '100',
    2: '200',
    3: '300',
    4: '400',
    5: '500',
    6: '600',
    7: '700',
    8: '800',
    default: '400',
  },
  letterSpacing: {
    1: 0,
    2: -1,
    // 3 will be -1
  },
  // (native only) swaps out fonts by face/style
  face: {
    100: { normal: 'AnekLatin-Thin' },
    200: { normal: 'AnekLatin-ExtraLight' },
    300: { normal: 'AnekLatin-Light' },
    400: { normal: 'AnekLatin-Regular' },
    500: { normal: 'AnekLatin-Medium', },
    600: { normal: 'AnekLatin-SemiBold', },
    700: { normal: 'AnekLatin-Bold', },
    800: { normal: 'AnekLatin-ExtraBold', }
  },
})
const config = createTamagui({
  ...defaultConfig,
  fonts: {
    ...defaultConfig.fonts,
    heading: systemFont,
    body: systemFont,
  },
  themes: {
    light: {
      ...defaultConfig.themes.light,
      background: 'white',
      color: 'black',
      gray: '#F3F4F6'
    },
    dark: {
      ...defaultConfig.themes.dark,
      background: 'black',
      color: 'white',
      gray: '#171717'
    },
  },
  media: {
    ...defaultConfig.media,
    // add your own media queries here, if wanted
  },
  tokens,
  settings: {
    ...defaultConfig.settings,
  },
})

export type AppConfig = typeof config

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config