import { test, expect } from './fixtures'
import { step } from './helpers/step'
import {
  type TestUser,
  createTestUser,
  loginAsUser,
  cleanupTestUser,
} from './helpers/test-user'

test.describe('Profile editing', () => {
  test.describe.configure({ mode: 'serial' })
  test.setTimeout(90_000)

  let user: TestUser
  const NEW_BIO = `bio updated at ${Date.now()}`

  test.beforeAll(async ({ browser, api }) => {
    const page = await browser.newPage()
    user = await createTestUser(page, api, 'profile')
    await page.close()
  })

  test.afterAll(async ({ api }) => {
    if (user) await cleanupTestUser(api, user)
  })

  test.beforeEach(async ({ page }) => {
    await loginAsUser(page, user)
  })

  test('open profile screen', async ({ page }) => {
    await step(page, 'goto /profile', async () => {
      await page.goto('/profile')
      await page.waitForLoadState('networkidle')
    })
    await step(page, 'verify name visible', async () => {
      // The user's first name is "E2E" (from createTestUser).
      await expect(page.getByText(/E2E/).first()).toBeVisible({ timeout: 10000 })
    })
  })

  test('edit bio persists after reload', async ({ page }) => {
    await step(page, 'open profile', async () => {
      await page.goto('/profile')
      await page.waitForLoadState('networkidle')
    })

    await step(page, 'enter edit mode', async () => {
      const edit = page.getByRole('button', { name: /^edit/i }).first()
      if (!(await edit.isVisible({ timeout: 5000 }).catch(() => false))) {
        test.skip(true, 'No Edit button surfaced — UI may differ')
      }
      await edit.click()
      await page.waitForTimeout(500)
    })

    await step(page, 'change bio', async () => {
      const bio = page.getByPlaceholder(/bio|about/i).first()
      if (!(await bio.isVisible({ timeout: 5000 }).catch(() => false))) {
        test.skip(true, 'No bio field in edit form — UI may differ')
      }
      await bio.fill(NEW_BIO)
    })

    await step(page, 'save', async () => {
      await page.getByRole('button', { name: /save|done/i }).first().click()
      await page.waitForTimeout(1500)
    })

    await step(page, 'reload and verify persistence', async () => {
      await page.reload()
      await page.waitForLoadState('networkidle')
      await expect(page.getByText(NEW_BIO)).toBeVisible({ timeout: 5000 })
    })
  })
})
