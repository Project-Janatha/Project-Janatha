const colors = require('tailwindcss/colors')
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#fb8c00', // orange[600]
          press: '#c25e00', // orange[800]
        },
        content: {
          DEFAULT: '#1f2937', // gray[800]
          light: '#4b5563', // gray[600]
          lighter: '#9ca3af', // gray[400]
          dark: '#f9fafb', // gray[50]
        },
        background: {
          light: '#ffffff', // white
          dark: '#111827', // custom dark
          hover: '#1f2937', // gray[800]
          press: '#374151', // gray[700]
          strong: '#ffffff', // white
          transparent: 'transparent',
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
