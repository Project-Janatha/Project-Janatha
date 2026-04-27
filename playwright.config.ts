import { defineConfig, devices } from '@playwright/test'

const BASE_URL = process.env.E2E_BASE_URL || 'https://chinmaya-janata.pages.dev'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  // Workers=1 by default: each Phase 2 spec calls /api/auth/register in
  // beforeAll, and the backend rate-limits aggressive parallel signups
  // (429s). Override locally with E2E_WORKERS if you need parallelism.
  workers: Number(process.env.E2E_WORKERS) || 1,
  reporter: [
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list'],
  ],
  timeout: 30_000,
  expect: { timeout: 10_000 },
  outputDir: 'test-results/artifacts',

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'on',
    video: 'on',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
