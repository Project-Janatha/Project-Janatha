import { test, expect } from '@playwright/test'

const TEST_EMAIL = `e2e_live_${Date.now()}@test.janata.dev`
const TEST_PASSWORD = 'TestPassword123!'

test.describe('Live App Walkthrough', () => {
  test.describe.configure({ mode: 'serial' })
  test.setTimeout(60_000)

  test('1. Landing page loads', async ({ page }) => {
    await page.goto('/landing')
    await expect(page.getByText('Find your center')).toBeVisible({ timeout: 15000 })
    await expect(page.getByText('Grow together')).toBeVisible()
    console.log('✅ Landing page loads correctly')
  })

  test('2. Create account', async ({ page }) => {
    await page.goto('/auth')
    await page.waitForLoadState('networkidle')

    const emailInput = page.getByPlaceholder(/email/i)
    await expect(emailInput).toBeVisible({ timeout: 15000 })
    await emailInput.fill(TEST_EMAIL)
    await page.getByRole('button', { name: /continue/i }).click()

    const passwordInput = page.locator('input[placeholder="Password"]').first()
    await expect(passwordInput).toBeVisible({ timeout: 10000 })
    await passwordInput.fill(TEST_PASSWORD)

    const confirmInput = page.locator('input[placeholder="Confirm password"]')
    await expect(confirmInput).toBeVisible({ timeout: 5000 })
    await confirmInput.fill(TEST_PASSWORD)

    await page.getByRole('button', { name: /create account/i }).click()

    await page.waitForURL(/\/onboarding/, { timeout: 15000 })
    await expect(page.getByText('Step 1 of 5')).toBeVisible({ timeout: 10000 })
    console.log('✅ Account created, redirected to onboarding')
  })

  test('3. Complete onboarding (all 5 steps + submit)', async ({ page }) => {
    // Login
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

    if (!page.url().includes('/onboarding')) {
      console.log('✅ Already past onboarding')
      return
    }

    // --- Step 1: Name ---
    await expect(page.getByText('Step 1 of 5')).toBeVisible({ timeout: 5000 })
    await page.getByPlaceholder(/first name/i).fill('E2E')
    await page.getByPlaceholder(/last name/i).fill('TestUser')
    await page.getByText('Continue').click()
    await page.waitForTimeout(800)
    console.log('   Step 1 (Name): done')

    // --- Step 2: Birthday ---
    await expect(page.getByText('Step 2 of 5')).toBeVisible({ timeout: 5000 })
    await page.getByRole('button', { name: 'Month' }).click()
    await page.getByRole('option', { name: 'January' }).click()
    await page.getByRole('button', { name: 'Day' }).click()
    await page.getByRole('option', { name: '15' }).click()
    await page.getByRole('button', { name: 'Year' }).click()
    await page.getByRole('option', { name: '2000' }).click()
    await page.getByText('Continue').click()
    await page.waitForTimeout(800)
    console.log('   Step 2 (Birthday): done')

    // --- Step 3: Center ---
    await expect(page.getByText('Step 3 of 5')).toBeVisible({ timeout: 5000 })
    const zipInput = page.getByPlaceholder(/zip code|city/i)
    await zipInput.fill('95127')
    await page.waitForTimeout(2500)
    const centerOption = page.getByText('Chinmaya Mission San Jose')
    if (await centerOption.isVisible({ timeout: 5000 }).catch(() => false)) {
      await centerOption.click()
      await page.waitForTimeout(500)
    }
    await page.getByText('Continue').click()
    await page.waitForTimeout(800)
    console.log('   Step 3 (Center): done')

    // --- Step 4: Interests (must select at least 1) ---
    await expect(page.getByText('Step 4 of 5')).toBeVisible({ timeout: 5000 })
    await page.getByText('Satsangs').click()
    await page.waitForTimeout(300)
    await page.getByText('Continue').click()
    await page.waitForTimeout(800)
    console.log('   Step 4 (Interests): done')

    // --- Step 5: Member type (must select one) ---
    await expect(page.getByText('Step 5 of 5')).toBeVisible({ timeout: 5000 })
    await page.getByText('CHYK').first().click()
    await page.waitForTimeout(300)
    await page.getByText('Continue').click()
    await page.waitForTimeout(1000)
    console.log('   Step 5 (Member type): done')

    // --- Step 6: Complete screen — click "Get Started" to submit ---
    const getStartedBtn = page.getByText('Get Started')
    await expect(getStartedBtn).toBeVisible({ timeout: 5000 })
    await getStartedBtn.click()

    // Should navigate away from onboarding to home
    await page.waitForURL(/(?!.*onboarding)/, { timeout: 15000 })
    const finalUrl = page.url()
    console.log(`✅ Onboarding complete! Navigated to: ${finalUrl}`)
    expect(finalUrl).not.toContain('/onboarding')
    expect(finalUrl).not.toContain('/auth')
  })

  test('4. View home page with centers', async ({ page }) => {
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
    const url = page.url()
    console.log(`✅ After login, at: ${url}`)

    expect(url).not.toContain('/onboarding')
    expect(url).not.toContain('/auth')
    expect(url).not.toContain('/landing')

    const bodyText = await page.textContent('body')
    console.log(`   Body text length: ${bodyText!.length} chars`)
    expect(bodyText!.length).toBeGreaterThan(100)
  })

  test('5. Verify profile is persisted via API', async ({ request }) => {
    const loginRes = await request.post('/api/auth/authenticate', {
      data: { username: TEST_EMAIL, password: TEST_PASSWORD },
    })
    expect(loginRes.ok()).toBeTruthy()
    const loginData = await loginRes.json()
    const token = loginData.token

    const verifyRes = await request.get('/api/auth/verify', {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(verifyRes.ok()).toBeTruthy()
    const { user } = await verifyRes.json()

    expect(user.firstName).toBe('E2E')
    expect(user.lastName).toBe('TestUser')
    expect(user.profileComplete).toBe(true)
    console.log(`✅ Profile persisted: ${user.firstName} ${user.lastName}, complete=${user.profileComplete}`)

    const centersRes = await request.get('/api/centers')
    expect(centersRes.ok()).toBeTruthy()
    const centersData = await centersRes.json()
    console.log(`✅ GET /api/centers returned ${centersData.centers.length} centers`)
  })

  test('6. Logout via API', async ({ request }) => {
    const loginRes = await request.post('/api/auth/authenticate', {
      data: { username: TEST_EMAIL, password: TEST_PASSWORD },
    })
    const loginData = await loginRes.json()

    const logoutRes = await request.post('/api/auth/deauthenticate', {
      headers: { Authorization: `Bearer ${loginData.token}` },
    })
    expect(logoutRes.ok()).toBeTruthy()
    console.log(`✅ Logout works`)
  })

  test.afterAll('cleanup: delete test user', async ({ request }) => {
    const loginRes = await request.post('/api/auth/authenticate', {
      data: { username: TEST_EMAIL, password: TEST_PASSWORD },
    })

    if (loginRes.ok()) {
      const data = await loginRes.json()
      if (data.token) {
        const deleteRes = await request.delete('/api/auth/delete-account', {
          headers: { Authorization: `Bearer ${data.token}` },
        })
        console.log(`Cleanup: delete account ${deleteRes.ok() ? 'succeeded' : 'failed'}`)
      }
    }
  })
})
