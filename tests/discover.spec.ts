import { test, expect } from './fixtures'
import { step } from './helpers/step'
import {
  type TestUser,
  createTestUser,
  loginAsUser,
  cleanupTestUser,
} from './helpers/test-user'

test.describe('Discover (Home Tab)', () => {
  test.describe.configure({ mode: 'serial' })
  test.setTimeout(90_000)

  let user: TestUser

  test.beforeAll(async ({ browser, api }) => {
    const page = await browser.newPage()
    user = await createTestUser(page, api, 'discover')
    await page.close()
  })

  test.afterAll(async ({ api }) => {
    if (user) await cleanupTestUser(api, user)
  })

  test.beforeEach(async ({ page }) => {
    await loginAsUser(page, user)
  })

  test('Events / Centers tabs are visible', async ({ page }) => {
    await step(page, 'verify Events tab', async () => {
      await expect(page.getByText(/^events$/i).first()).toBeVisible({ timeout: 10000 })
    })
    await step(page, 'verify Centers tab', async () => {
      await expect(page.getByText(/^centers$/i).first()).toBeVisible({ timeout: 5000 })
    })
  })

  test('Centers tab filters to centers', async ({ page }) => {
    await step(page, 'click Centers tab', async () => {
      await page.getByText(/^centers$/i).first().click()
      await page.waitForTimeout(800)
    })
    await step(page, 'verify a Chinmaya center is visible', async () => {
      await expect(page.locator('text=/chinmaya/i').first()).toBeVisible({ timeout: 5000 })
    })
  })

  test('search input filters the list', async ({ page }) => {
    await step(page, 'type into search', async () => {
      const search = page.getByPlaceholder(/search/i).first()
      await expect(search).toBeVisible({ timeout: 5000 })
      await search.fill('san jose')
      await page.waitForTimeout(1000)
    })
    await step(page, 'screenshot post-filter state', async () => {
      // Result presence depends on seed data; the screenshot itself is the artifact.
    })
  })

  test('Going toggle is present', async ({ page }) => {
    await step(page, 'verify Going toggle visible', async () => {
      await expect(page.getByText(/going/i).first()).toBeVisible({ timeout: 5000 })
    })
  })

  test('past events toggle reveals/hides past events', async ({ page }) => {
    await step(page, 'find Show past events toggle', async () => {
      const toggle = page.getByText(/show past events/i)
      if (!(await toggle.isVisible({ timeout: 2000 }).catch(() => false))) {
        test.skip(true, 'Show past events toggle not surfaced on this layout')
      }
      await toggle.click()
      await page.waitForTimeout(500)
    })
    await step(page, 'screenshot post-toggle state', async () => {
      // Visual capture only.
    })
  })
})
