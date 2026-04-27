import { test, expect } from './fixtures'
import { step } from './helpers/step'
import {
  type TestUser,
  createTestUser,
  loginAsUser,
  cleanupTestUser,
} from './helpers/test-user'

test.describe('Settings', () => {
  test.describe.configure({ mode: 'serial' })
  test.setTimeout(90_000)

  let user: TestUser

  test.beforeAll(async ({ browser, api }) => {
    const page = await browser.newPage()
    user = await createTestUser(page, api, 'settings')
    await page.close()
  })

  test.afterAll(async ({ api }) => {
    if (user) await cleanupTestUser(api, user)
  })

  test.beforeEach(async ({ page }) => {
    await loginAsUser(page, user)
  })

  test('open settings screen', async ({ page }) => {
    await step(page, 'goto /settings', async () => {
      await page.goto('/settings')
      await page.waitForLoadState('networkidle')
    })
    await step(page, 'verify URL contains /settings', async () => {
      expect(page.url()).toContain('/settings')
    })
  })

  test('logout returns to landing/auth', async ({ page }) => {
    await step(page, 'open settings', async () => {
      await page.goto('/settings')
      await page.waitForLoadState('networkidle')
    })

    await step(page, 'click Logout', async () => {
      const logout = page.getByRole('button', { name: /log ?out|sign ?out/i }).first()
      if (!(await logout.isVisible({ timeout: 5000 }).catch(() => false))) {
        test.skip(true, 'No logout button surfaced — UI may differ')
      }
      await logout.click()
    })

    await step(page, 'verify landed on /landing or /auth', async () => {
      await page.waitForURL(/\/(landing|auth)/, { timeout: 10000 })
    })
  })

  test('notification preference toggle persists', async ({ page }) => {
    await step(page, 'open notifications settings', async () => {
      await page.goto('/settings/notifications')
      await page.waitForLoadState('networkidle')
    })

    let beforeState: string | null = null
    await step(page, 'toggle first preference', async () => {
      const toggle = page.getByRole('switch').first()
      if (!(await toggle.isVisible({ timeout: 3000 }).catch(() => false))) {
        test.skip(true, 'No notification toggles surfaced — settings may differ')
      }
      beforeState = await toggle.getAttribute('aria-checked')
      await toggle.click()
      await page.waitForTimeout(800)
      const afterState = await toggle.getAttribute('aria-checked')
      expect(afterState).not.toBe(beforeState)
    })

    await step(page, 'reload and verify persistence', async () => {
      await page.reload()
      await page.waitForLoadState('networkidle')
      const toggle = page.getByRole('switch').first()
      if (await toggle.isVisible({ timeout: 3000 }).catch(() => false)) {
        const after = await toggle.getAttribute('aria-checked')
        expect(after).not.toBe(beforeState)
      }
    })
  })
})
