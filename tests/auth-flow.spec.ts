import { test, expect } from '@playwright/test'

const TEST_EMAIL = `e2e_test_${Date.now()}@test.janata.dev`
const TEST_PASSWORD = 'TestPassword123!'

test.describe('Authentication Flow', () => {
  test('auth page loads with email input and Continue button', async ({ page }) => {
    await page.goto('/auth')
    await page.waitForLoadState('networkidle')

    const emailInput = page.getByPlaceholder(/email/i)
    await expect(emailInput).toBeVisible({ timeout: 15000 })

    const continueBtn = page.getByRole('button', { name: /continue/i })
    await expect(continueBtn).toBeVisible()
  })

  test('entering email and clicking Continue transitions to signup for new user', async ({ page }) => {
    await page.goto('/auth')
    await page.waitForLoadState('networkidle')

    const emailInput = page.getByPlaceholder(/email/i)
    await expect(emailInput).toBeVisible({ timeout: 15000 })
    await emailInput.fill(TEST_EMAIL)

    await page.getByRole('button', { name: /continue/i }).click()

    // Should transition to signup step (new user) - shows password fields
    // Use CSS selector since placeholder 'Password' matches both fields
    const passwordInput = page.locator('input[placeholder="Password"]').first()
    await expect(passwordInput).toBeVisible({ timeout: 10000 })

    // Should show "Create Account" button for new user
    const createBtn = page.getByRole('button', { name: /create account/i })
    await expect(createBtn).toBeVisible()
  })

  test('register a new test user via email flow', async ({ page }) => {
    await page.goto('/auth')
    await page.waitForLoadState('networkidle')

    // Step 1: Enter email
    const emailInput = page.getByPlaceholder(/email/i)
    await expect(emailInput).toBeVisible({ timeout: 15000 })
    await emailInput.fill(TEST_EMAIL)

    await page.getByRole('button', { name: /continue/i }).click()

    // Step 2: Fill password and confirm
    const passwordInput = page.locator('input[placeholder="Password"]').first()
    await expect(passwordInput).toBeVisible({ timeout: 10000 })
    await passwordInput.fill(TEST_PASSWORD)

    const confirmInput = page.locator('input[placeholder="Confirm password"]')
    if (await confirmInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await confirmInput.fill(TEST_PASSWORD)
    }

    // Submit
    await page.getByRole('button', { name: /create account/i }).click()

    // Should navigate to onboarding or home
    await page.waitForURL(/\/(onboarding|$|\(tabs\))/, { timeout: 15000 })
  })

  test('login with registered test user', async ({ page }) => {
    await page.goto('/auth')
    await page.waitForLoadState('networkidle')

    // Step 1: Enter email
    const emailInput = page.getByPlaceholder(/email/i)
    await expect(emailInput).toBeVisible({ timeout: 15000 })
    await emailInput.fill(TEST_EMAIL)

    await page.getByRole('button', { name: /continue/i }).click()

    // Step 2: Should show login form (existing user) - only one password field
    const passwordInput = page.locator('input[placeholder="Password"]')
    await expect(passwordInput).toBeVisible({ timeout: 10000 })
    await passwordInput.fill(TEST_PASSWORD)

    await page.getByRole('button', { name: /sign in/i }).click()

    // Should navigate away from auth
    await page.waitForURL(/\/(onboarding|$|\(tabs\))/, { timeout: 15000 })
  })

  test('invalid email shows validation error', async ({ page }) => {
    await page.goto('/auth')
    await page.waitForLoadState('networkidle')

    const emailInput = page.getByPlaceholder(/email/i)
    await expect(emailInput).toBeVisible({ timeout: 15000 })
    await emailInput.fill('not-an-email')

    await page.getByRole('button', { name: /continue/i }).click()

    // Should show error and stay on auth
    await page.waitForTimeout(2000)
    expect(page.url()).toContain('/auth')

    // Error text: "You must enter a valid email address."
    const errorText = page.getByText(/valid email address/i)
    await expect(errorText).toBeVisible({ timeout: 5000 })
  })

  test.afterAll('cleanup: delete test user', async ({ request }) => {
    const loginResponse = await request.post('/api/auth/authenticate', {
      data: {
        username: TEST_EMAIL,
        password: TEST_PASSWORD,
      },
    })

    if (loginResponse.ok()) {
      const loginData = await loginResponse.json()
      const token = loginData.token
      if (token) {
        await request.delete('/api/auth/delete-account', {
          headers: { Authorization: `Bearer ${token}` },
        })
      }
    }
  })
})
