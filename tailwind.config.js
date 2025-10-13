const colors = require('tailwindcss/colors')
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: colors.orange[600],
          press: colors.orange[800],
        },
        background: {
          light: colors.white,
          dark: colors.gray[900],
          hover: colors.gray[800],
          press: colors.gray[700],
          strong: colors.white,
          transparent: colors.transparent,
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
    },
    plugins: [],
  },
}
