import { test, expect } from './fixtures'
import { step } from './helpers/step'

const TEST_EMAIL = `e2e_live_${Date.now()}@test.janata.dev`
const TEST_PASSWORD = 'TestPassword123!'

test.describe('Live App Walkthrough', () => {
  test.describe.configure({ mode: 'serial' })
  test.setTimeout(60_000)

  test('1. Landing page loads', async ({ page }) => {
    await step(page, 'goto /landing', async () => {
      await page.goto('/landing')
    })
    await step(page, 'verify hero text visible', async () => {
      await expect(page.getByText('Find your center')).toBeVisible({ timeout: 15000 })
      await expect(page.getByText('Grow together')).toBeVisible()
    })
  })

  test('2. Create account', async ({ page }) => {
    await step(page, 'goto /auth', async () => {
      await page.goto('/auth')
      await page.waitForLoadState('networkidle')
    })

    await step(page, 'enter email and Continue', async () => {
      const emailInput = page.getByPlaceholder(/email/i)
      await expect(emailInput).toBeVisible({ timeout: 15000 })
      await emailInput.fill(TEST_EMAIL)
      await page.getByRole('button', { name: /continue/i }).click()
    })

    await step(page, 'enter password and confirm', async () => {
      const passwordInput = page.locator('input[placeholder="Password"]').first()
      await expect(passwordInput).toBeVisible({ timeout: 10000 })
      await passwordInput.fill(TEST_PASSWORD)

      const confirmInput = page.locator('input[placeholder="Confirm password"]')
      await expect(confirmInput).toBeVisible({ timeout: 5000 })
      await confirmInput.fill(TEST_PASSWORD)
    })

    await step(page, 'submit Create Account', async () => {
      await page.getByRole('button', { name: /create account/i }).click()
      await page.waitForURL(/\/onboarding/, { timeout: 15000 })
      await expect(page.getByText('Step 1 of 5')).toBeVisible({ timeout: 10000 })
    })
  })

  test('3. Complete onboarding (all 5 steps + submit)', async ({ page }) => {
    await step(page, 'login (post-signup)', async () => {
      await page.goto('/auth')
      const emailInput = page.getByPlaceholder(/email/i)
      await expect(emailInput).toBeVisible({ timeout: 15000 })
      await emailInput.fill(TEST_EMAIL)
      await page.getByRole('button', { name: /continue/i }).click()
      const passwordInput = page.locator('input[placeholder="Password"]')
      await expect(passwordInput).toBeVisible({ timeout: 10000 })
      await passwordInput.fill(TEST_PASSWORD)
      await page.getByRole('button', { name: /sign in/i }).click()
      await page.waitForURL(/\/(onboarding|\(tabs\))/, { timeout: 15000 })
    })

    if (!page.url().includes('/onboarding')) {
      console.log('✅ Already past onboarding')
      return
    }

    await step(page, 'onboarding step 1: name', async () => {
      await expect(page.getByText('Step 1 of 5')).toBeVisible({ timeout: 5000 })
      await page.getByPlaceholder(/first name/i).fill('E2E')
      await page.getByPlaceholder(/last name/i).fill('TestUser')
      await page.getByText('Continue').click()
      await page.waitForTimeout(800)
    })

    await step(page, 'onboarding step 2: birthday', async () => {
      await expect(page.getByText('Step 2 of 5')).toBeVisible({ timeout: 5000 })
      await page.getByRole('button', { name: 'Month' }).click()
      await page.getByRole('option', { name: 'January' }).click()
      await page.getByRole('button', { name: 'Day' }).click()
      await page.getByRole('option', { name: '15' }).click()
      await page.getByRole('button', { name: 'Year' }).click()
      await page.getByRole('option', { name: '2000' }).click()
      await page.getByText('Continue').click()
      await page.waitForTimeout(800)
    })

    await step(page, 'onboarding step 3: center', async () => {
      await expect(page.getByText('Step 3 of 5')).toBeVisible({ timeout: 5000 })
      const zipInput = page.getByPlaceholder(/zip code|city/i)
      await zipInput.fill('95127')
      await page.waitForTimeout(2500)

      const knownCenter = page.getByText(/chinmaya mission san jose/i)
      const suggestedCenter = page.locator('[role="option"]:visible').first()
      const fallbackCenter = page.locator('text=/chinmaya/i >> visible=true').first()

      if (await knownCenter.isVisible({ timeout: 2000 }).catch(() => false)) {
        await knownCenter.click()
      } else if (await suggestedCenter.isVisible({ timeout: 2000 }).catch(() => false)) {
        await suggestedCenter.click()
      } else {
        await expect(fallbackCenter).toBeVisible({ timeout: 5000 })
        await fallbackCenter.click()
      }

      await page.waitForTimeout(500)
      await page.getByText('Continue').click()
      await page.waitForTimeout(800)
    })

    await step(page, 'onboarding step 4: interests', async () => {
      await expect(page.getByText('Step 4 of 5')).toBeVisible({ timeout: 5000 })
      await page.getByText('Satsangs').click()
      await page.waitForTimeout(300)
      await page.getByText('Continue').click()
      await page.waitForTimeout(800)
    })

    await step(page, 'onboarding step 5: member type', async () => {
      await expect(page.getByText('Step 5 of 5')).toBeVisible({ timeout: 5000 })
      await page.getByText('CHYK').first().click()
      await page.waitForTimeout(300)
      await page.getByText('Continue').click()
      await page.waitForTimeout(1000)
    })

    await step(page, 'submit Get Started', async () => {
      const getStartedBtn = page.locator('text=Get Started >> visible=true').first()
      await expect(getStartedBtn).toBeVisible({ timeout: 5000 })

      const completeOnboardingResponse = page
        .waitForResponse(
          (response) =>
            response.url().includes('/api/auth/complete-onboarding') &&
            response.request().method() === 'POST',
          { timeout: 15000 }
        )
        .catch(() => null)

      await getStartedBtn.click()

      const completeResponse = await completeOnboardingResponse
      expect(completeResponse).not.toBeNull()
      expect(completeResponse?.ok()).toBe(true)

      await page.waitForTimeout(2000)
      const finalUrl = page.url()
      expect(finalUrl).not.toContain('/auth')
    })
  })

  test('4. View home page with centers', async ({ page }) => {
    await step(page, 'login', async () => {
      await page.goto('/auth')
      const emailInput = page.getByPlaceholder(/email/i)
      await expect(emailInput).toBeVisible({ timeout: 15000 })
      await emailInput.fill(TEST_EMAIL)
      await page.getByRole('button', { name: /continue/i }).click()
      const passwordInput = page.locator('input[placeholder="Password"]')
      await expect(passwordInput).toBeVisible({ timeout: 10000 })
      await passwordInput.fill(TEST_PASSWORD)
      await page.getByRole('button', { name: /sign in/i }).click()
      await page.waitForTimeout(5000)
    })

    await step(page, 'verify landed past auth/onboarding/landing', async () => {
      const url = page.url()
      expect(url).not.toContain('/onboarding')
      expect(url).not.toContain('/auth')
      expect(url).not.toContain('/landing')

      const bodyText = await page.textContent('body')
      expect(bodyText!.length).toBeGreaterThan(100)
    })
  })

  test('5. Verify profile is persisted via API', async ({ api }) => {
    const loginRes = await api.post('/api/auth/authenticate', {
      data: { username: TEST_EMAIL, password: TEST_PASSWORD },
    })
    expect(loginRes.ok()).toBeTruthy()
    const loginData = await loginRes.json()
    const token = loginData.token

    const verifyRes = await api.get('/api/auth/verify', {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(verifyRes.ok()).toBeTruthy()
    const { user } = await verifyRes.json()

    expect(user.firstName).toBe('E2E')
    expect(user.lastName).toBe('TestUser')
    expect(user.profileComplete).toBe(true)

    const centersRes = await api.get('/api/centers')
    expect(centersRes.ok()).toBeTruthy()
    const centersData = await centersRes.json()
    console.log(`✅ GET /api/centers returned ${centersData.centers.length} centers`)
  })

  test('6. Logout via API', async ({ api }) => {
    const loginRes = await api.post('/api/auth/authenticate', {
      data: { username: TEST_EMAIL, password: TEST_PASSWORD },
    })
    const loginData = await loginRes.json()

    const logoutRes = await api.post('/api/auth/deauthenticate', {
      headers: { Authorization: `Bearer ${loginData.token}` },
    })
    expect(logoutRes.ok()).toBeTruthy()
  })

  test.afterAll('cleanup: delete test user', async ({ api }) => {
    const loginRes = await api.post('/api/auth/authenticate', {
      data: { username: TEST_EMAIL, password: TEST_PASSWORD },
    })

    if (loginRes.ok()) {
      const data = await loginRes.json()
      if (data.token) {
        const deleteRes = await api.delete('/api/auth/delete-account', {
          headers: { Authorization: `Bearer ${data.token}` },
        })
        console.log(`Cleanup: delete account ${deleteRes.ok() ? 'succeeded' : 'failed'}`)
      }
    }
  })
})
