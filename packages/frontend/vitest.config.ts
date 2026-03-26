import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/__tests__/**/*.test.ts', 'app/__test__/**/*.test.tsx'],
    setupFiles: ['app/__test__/setup.ts'],
  },
  resolve: {
    alias: {
      'react-native': 'react-native-web',
    },
  },
})
