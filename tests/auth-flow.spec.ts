import { test, expect } from './fixtures'
import { step } from './helpers/step'

const TEST_EMAIL = `e2e_test_${Date.now()}@test.janata.dev`
const TEST_PASSWORD = 'TestPassword123!'

test.describe('Authentication Flow', () => {
  test('auth page loads with email input and Continue button', async ({ page }) => {
    await step(page, 'goto /auth', async () => {
      await page.goto('/auth')
      await page.waitForLoadState('networkidle')
    })

    await step(page, 'verify email input + Continue visible', async () => {
      const emailInput = page.getByPlaceholder(/email/i)
      await expect(emailInput).toBeVisible({ timeout: 15000 })

      const continueBtn = page.getByRole('button', { name: /continue/i })
      await expect(continueBtn).toBeVisible()
    })
  })

  test('entering email and clicking Continue transitions to signup for new user', async ({
    page,
  }) => {
    await step(page, 'goto /auth', async () => {
      await page.goto('/auth')
      await page.waitForLoadState('networkidle')
    })

    await step(page, 'fill email and Continue', async () => {
      const emailInput = page.getByPlaceholder(/email/i)
      await expect(emailInput).toBeVisible({ timeout: 15000 })
      await emailInput.fill(TEST_EMAIL)
      await page.getByRole('button', { name: /continue/i }).click()
    })

    await step(page, 'verify password fields + Create Account visible', async () => {
      const passwordInput = page.locator('input[placeholder="Password"]').first()
      await expect(passwordInput).toBeVisible({ timeout: 10000 })

      const createBtn = page.getByRole('button', { name: /create account/i })
      await expect(createBtn).toBeVisible()
    })
  })

  test('register a new test user via email flow', async ({ page }) => {
    await step(page, 'goto /auth', async () => {
      await page.goto('/auth')
      await page.waitForLoadState('networkidle')
    })

    await step(page, 'fill email and Continue', async () => {
      const emailInput = page.getByPlaceholder(/email/i)
      await expect(emailInput).toBeVisible({ timeout: 15000 })
      await emailInput.fill(TEST_EMAIL)
      await page.getByRole('button', { name: /continue/i }).click()
    })

    await step(page, 'fill password + confirm', async () => {
      const passwordInput = page.locator('input[placeholder="Password"]').first()
      await expect(passwordInput).toBeVisible({ timeout: 10000 })
      await passwordInput.fill(TEST_PASSWORD)

      const confirmInput = page.locator('input[placeholder="Confirm password"]')
      if (await confirmInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await confirmInput.fill(TEST_PASSWORD)
      }
    })

    await step(page, 'submit Create Account', async () => {
      await page.getByRole('button', { name: /create account/i }).click()
      await page.waitForURL(/\/(onboarding|$|\(tabs\))/, { timeout: 15000 })
    })
  })

  test('login with registered test user', async ({ page, api }) => {
    await api.post('/api/auth/register', {
      data: {
        username: TEST_EMAIL,
        password: TEST_PASSWORD,
      },
    })

    await step(page, 'goto /auth', async () => {
      await page.goto('/auth')
      await page.waitForLoadState('networkidle')
    })

    await step(page, 'fill email and Continue', async () => {
      const emailInput = page.getByPlaceholder(/email/i)
      await expect(emailInput).toBeVisible({ timeout: 15000 })
      await emailInput.fill(TEST_EMAIL)
      await page.getByRole('button', { name: /continue/i }).click()
    })

    await step(page, 'fill password and Sign In', async () => {
      const passwordInput = page.locator('input[placeholder="Password"]')
      await expect(passwordInput).toBeVisible({ timeout: 10000 })
      await passwordInput.fill(TEST_PASSWORD)

      const signInButton = page.getByRole('button', { name: /sign in|log in/i })
      await expect(signInButton).toBeVisible({ timeout: 10000 })
      await signInButton.click()

      await page.waitForURL(/\/(onboarding|$|\(tabs\))/, { timeout: 15000 })
    })
  })

  test('invalid email shows validation error', async ({ page }) => {
    await step(page, 'goto /auth', async () => {
      await page.goto('/auth')
      await page.waitForLoadState('networkidle')
    })

    await step(page, 'enter invalid email and submit', async () => {
      const emailInput = page.getByPlaceholder(/email/i)
      await expect(emailInput).toBeVisible({ timeout: 15000 })
      await emailInput.fill('not-an-email')
      await page.getByRole('button', { name: /continue/i }).click()
    })

    await step(page, 'verify still on /auth, no password field', async () => {
      await page.waitForTimeout(2000)
      expect(page.url()).toContain('/auth')
      await expect(page.locator('input[placeholder="Password"]')).toHaveCount(0)
      await expect(page.getByPlaceholder(/email/i)).toHaveValue('not-an-email')
    })
  })

  test.afterAll('cleanup: delete test user', async ({ api }) => {
    const loginResponse = await api.post('/api/auth/authenticate', {
      data: {
        username: TEST_EMAIL,
        password: TEST_PASSWORD,
      },
    })

    if (loginResponse.ok()) {
      const loginData = await loginResponse.json()
      const token = loginData.token
      if (token) {
        await api.delete('/api/auth/delete-account', {
          headers: { Authorization: `Bearer ${token}` },
        })
      }
    }
  })
})
