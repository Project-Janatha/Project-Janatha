const colors = require('tailwindcss/colors')

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Keep class for manual toggling
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: colors.orange[600],
          press: colors.orange[700],
        },
        background: {
          DEFAULT: colors.white,
          light: colors.neutral[300],
          dark: colors.neutral[900],
        },
        backgroundStrong: {
          DEFAULT: colors.gray[900],
          light: colors.gray[100],
          dark: colors.gray[800],
        },
        content: {
          DEFAULT: colors.gray[900],
          light: colors.gray[700],
          dark: colors.gray[100],
        },
        contentStrong: {
          DEFAULT: colors.gray[600],
          light: colors.gray[500],
          dark: colors.gray[400],
        },
        muted: {
          DEFAULT: colors.gray[500],
          light: colors.gray[400],
          dark: colors.gray[600],
        },
      },
      fontFamily: {
        inter: ['Inter-Regular'],
        'inter-bold': ['Inter-Bold'],
        'inter-semibold': ['Inter-SemiBold'],
        'inter-medium': ['Inter-Medium'],
        'inter-light': ['Inter-Light'],
      },
    },
  },
  plugins: [],
}
