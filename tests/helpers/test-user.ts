import { expect, type Page, type APIRequestContext } from '@playwright/test'
import { step } from './step'

export interface TestUser {
  email: string
  password: string
  token?: string
}

export function newTestUserCreds(area: string): TestUser {
  return {
    email: `e2e_${area}_${Date.now()}@test.janata.dev`,
    password: 'TestPassword123!',
  }
}

/**
 * Signs up + completes onboarding via UI. Returns user with token.
 * Use in beforeAll to set up a fresh user for a spec.
 *
 * The `api` argument MUST be the {api} fixture from tests/fixtures.ts —
 * not the default {request} — because the latter resolves against the
 * frontend baseURL.
 */
export async function createTestUser(
  page: Page,
  api: APIRequestContext,
  area: string
): Promise<TestUser> {
  const user = newTestUserCreds(area)

  // Register via API using the seeded PUBLIC-EXPLORE invite code (added by
  // migration 0007 for frictionless event-link signup). After registering,
  // the userExistence check routes the UI to Sign In, skipping the invite-
  // code UI step entirely.
  const registerRes = await api.post('/api/auth/register', {
    data: {
      username: user.email,
      password: user.password,
      inviteCode: 'PUBLIC-EXPLORE',
    },
  })
  if (!registerRes.ok()) {
    throw new Error(
      `createTestUser: register failed (${registerRes.status()}): ${await registerRes.text()}`
    )
  }

  await step(page, 'goto /auth (login as existing user)', async () => {
    await page.goto('/auth')
    await page.waitForLoadState('networkidle')
  })

  await step(page, 'submit email', async () => {
    const emailInput = page.getByPlaceholder(/email/i)
    await expect(emailInput).toBeVisible({ timeout: 15000 })
    await emailInput.fill(user.email)
    await page.getByRole('button', { name: /continue/i }).click()
  })

  await step(page, 'submit password (login)', async () => {
    const pw = page.locator('input[placeholder="Password"]').first()
    await expect(pw).toBeVisible({ timeout: 10000 })
    await pw.fill(user.password)
    await page.getByRole('button', { name: /sign in|log in/i }).click()
    await page.waitForURL(/\/(onboarding|\(tabs\))/, { timeout: 15000 })
  })

  await step(page, 'click Welcome Get Started (if shown)', async () => {
    // Onboarding now begins with a "Welcome to Janata!" splash. Click through.
    const welcome = page.getByText(/welcome to janata/i)
    if (await welcome.isVisible({ timeout: 3000 }).catch(() => false)) {
      await page.getByRole('button', { name: /get started/i }).first().click()
      await page.waitForTimeout(800)
    }
  })

  await step(page, 'onboarding step 1: name', async () => {
    await page.getByPlaceholder(/first name/i).fill('E2E')
    await page.getByPlaceholder(/last name/i).fill('TestUser')
    await page.getByText('Continue').click()
  })

  await step(page, 'onboarding step 2: birthday', async () => {
    await page.getByRole('button', { name: 'Month' }).click()
    await page.getByRole('option', { name: 'January' }).click()
    await page.getByRole('button', { name: 'Day' }).click()
    await page.getByRole('option', { name: '15' }).click()
    await page.getByRole('button', { name: 'Year' }).click()
    await page.getByRole('option', { name: '2000' }).click()
    await page.getByText('Continue').click()
  })

  await step(page, 'onboarding step 3: center', async () => {
    const zipInput = page.getByPlaceholder(/zip code|city/i)
    await zipInput.fill('95127')
    await page.waitForTimeout(2500)
    const fallback = page.locator('text=/chinmaya/i >> visible=true').first()
    await expect(fallback).toBeVisible({ timeout: 5000 })
    await fallback.click()
    await page.waitForTimeout(500)
    await page.getByText('Continue').click()
  })

  await step(page, 'onboarding step 4: interests', async () => {
    await page.getByText('Satsangs').click()
    await page.getByText('Continue').click()
  })

  await step(page, 'onboarding step 5: member type', async () => {
    await page.getByText('CHYK').first().click()
    await page.getByText('Continue').click()
  })

  await step(page, 'submit get started', async () => {
    const get = page.locator('text=Get Started >> visible=true').first()
    await expect(get).toBeVisible({ timeout: 5000 })
    await get.click()
    await page.waitForTimeout(2000)
  })

  // Capture token via API for later cleanup.
  const loginRes = await api.post('/api/auth/authenticate', {
    data: { username: user.email, password: user.password },
  })
  if (loginRes.ok()) {
    user.token = (await loginRes.json()).token
  }
  return user
}

/**
 * Logs in via UI (no signup). Use when a test needs a fresh page session
 * for a previously-created user.
 */
export async function loginAsUser(page: Page, user: TestUser): Promise<void> {
  await step(page, `login as ${user.email}`, async () => {
    await page.goto('/auth')
    const emailInput = page.getByPlaceholder(/email/i)
    await expect(emailInput).toBeVisible({ timeout: 15000 })
    await emailInput.fill(user.email)
    await page.getByRole('button', { name: /continue/i }).click()
    const pw = page.locator('input[placeholder="Password"]')
    await expect(pw).toBeVisible({ timeout: 10000 })
    await pw.fill(user.password)
    await page.getByRole('button', { name: /sign in/i }).click()
    await page.waitForTimeout(3000)
  })
}

/**
 * Deletes the test user account. Always call from afterAll.
 */
export async function cleanupTestUser(
  api: APIRequestContext,
  user: TestUser
): Promise<void> {
  let token = user.token
  if (!token) {
    const loginRes = await api.post('/api/auth/authenticate', {
      data: { username: user.email, password: user.password },
    })
    if (!loginRes.ok()) {
      console.warn(`Cleanup: could not log in as ${user.email}`)
      return
    }
    token = (await loginRes.json()).token
  }
  const res = await api.delete('/api/auth/delete-account', {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok()) {
    console.warn(`Cleanup: delete-account failed for ${user.email}: ${res.status()}`)
  }
}
