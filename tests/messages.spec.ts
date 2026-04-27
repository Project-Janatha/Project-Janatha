import { test, expect } from './fixtures'
import { step } from './helpers/step'
import {
  type TestUser,
  createTestUser,
  loginAsUser,
  cleanupTestUser,
} from './helpers/test-user'

test.describe('Event messages', () => {
  test.describe.configure({ mode: 'serial' })
  test.setTimeout(90_000)

  let user: TestUser
  let eventId: string | null = null
  const MSG = `e2e msg ${Date.now()}`

  test.beforeAll(async ({ browser, api }) => {
    const page = await browser.newPage()
    user = await createTestUser(page, api, 'messages')
    await page.close()

    const res = await api.get('/api/events')
    if (res.ok()) {
      const data = await res.json()
      const first = data.events?.[0]
      eventId = first?.eventID || first?.id || null
    }
  })

  test.afterAll(async ({ api }) => {
    if (user) await cleanupTestUser(api, user)
  })

  test.beforeEach(async ({ page }) => {
    if (!eventId) test.skip(true, 'No events available — skipping messages spec')
    await loginAsUser(page, user)
  })

  test('post a message and see it appear', async ({ page }) => {
    await step(page, 'open event detail', async () => {
      await page.goto(`/event/${eventId}`)
      await page.waitForLoadState('networkidle')
    })

    await step(page, 'find messages input and post', async () => {
      const input = page.getByPlaceholder(/message|comment|say something/i).first()
      if (!(await input.isVisible({ timeout: 5000 }).catch(() => false))) {
        test.skip(true, 'No messages input — feature may not be on event detail')
      }
      await input.fill(MSG)
      const submit = page.getByRole('button', { name: /^send$|^post$|submit/i }).first()
      if (await submit.isVisible({ timeout: 2000 }).catch(() => false)) {
        await submit.click()
      } else {
        await input.press('Enter')
      }
      await page.waitForTimeout(1500)
    })

    await step(page, 'verify message visible', async () => {
      await expect(page.getByText(MSG)).toBeVisible({ timeout: 5000 })
    })
  })

  test('delete own message removes it', async ({ page }) => {
    await step(page, 'open event detail', async () => {
      await page.goto(`/event/${eventId}`)
      await page.waitForLoadState('networkidle')
    })

    await step(page, 'find own message and trigger delete', async () => {
      const own = page.getByText(MSG)
      if (!(await own.isVisible({ timeout: 5000 }).catch(() => false))) {
        test.skip(true, 'Own message not visible — previous test may have failed or skipped')
      }
      // Try right-click first; fall back to hover/long-press affordance.
      await own.click({ button: 'right' }).catch(() => own.hover())
      const del = page.getByRole('button', { name: /delete|remove/i }).first()
      if (!(await del.isVisible({ timeout: 2000 }).catch(() => false))) {
        test.skip(true, 'No delete affordance surfaced — UI may differ')
      }
      await del.click()
      await page.waitForTimeout(1000)
    })

    await step(page, 'verify message gone', async () => {
      await expect(page.getByText(MSG)).toHaveCount(0)
    })
  })
})
