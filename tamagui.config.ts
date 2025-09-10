import { defaultConfig } from '@tamagui/config/v4'
import { createFont, createTamagui, isWeb } from 'tamagui'

const systemFont = createFont({
  family: isWeb ? 'Anek Latin, Arial, sans-serif' : 'AnekLatin',
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
  },
  letterSpacing: {
    1: 0,
    2: -1,
    // 3 will be -1
  },
  // (native only) swaps out fonts by face/style
  face: {
    100: { normal: 'AnekLatin-Thin', italic: 'AnekLatin-ThinItalic' },
    200: { normal: 'AnekLatin-ExtraLight', italic: 'AnekLatin-ExtraLightItalic' },
    300: { normal: 'AnekLatin-Light', italic: 'AnekLatin-LightItalic' },
    400: { normal: 'AnekLatin-Regular', italic: 'AnekLatin-Italic' },
    500: { normal: 'AnekLatin-Medium', italic: 'AnekLatin-MediumItalic' },
    600: { normal: 'AnekLatin-SemiBold', italic: 'AnekLatin-SemiBoldItalic' },
    700: { normal: 'AnekLatin-Bold', italic: 'AnekLatin-BoldItalic' },
    800: { normal: 'AnekLatin-ExtraBold', italic: 'AnekLatin-ExtraBoldItalic' }
  },
})

const config = createTamagui({
  ...defaultConfig,
  fonts: {
    ...defaultConfig.fonts,
    heading: systemFont,
    body: systemFont,
  },
  media: {
    ...defaultConfig.media,
    // add your own media queries here, if wanted
  },
})

type OurConfig = typeof config

declare module 'tamagui' {
  interface TamaguiCustomConfig extends OurConfig {}
}

export default config