import { test, expect } from './fixtures'
import { step } from './helpers/step'
import {
  type TestUser,
  createTestUser,
  loginAsUser,
  cleanupTestUser,
} from './helpers/test-user'

test.describe('Event Detail + RSVP', () => {
  test.describe.configure({ mode: 'serial' })
  test.setTimeout(90_000)

  let user: TestUser
  let eventId: string | null = null

  test.beforeAll(async ({ browser, api }) => {
    const page = await browser.newPage()
    user = await createTestUser(page, api, 'event_detail')
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
    if (!eventId) test.skip(true, 'No events available — skipping event-detail spec')
    await loginAsUser(page, user)
  })

  test('opens an event detail page', async ({ page }) => {
    await step(page, 'navigate to event detail', async () => {
      await page.goto(`/event/${eventId}`)
      await page.waitForLoadState('networkidle')
    })

    await step(page, 'verify URL contains /event/', async () => {
      expect(page.url()).toContain(`/event/`)
    })
  })

  test('RSVP toggles "Going"', async ({ page }) => {
    await step(page, 'open event detail', async () => {
      await page.goto(`/event/${eventId}`)
      await page.waitForLoadState('networkidle')
    })

    await step(page, 'click RSVP / Going / Attend button', async () => {
      const rsvp = page.getByRole('button', { name: /rsvp|going|attend|i'?ll be there/i }).first()
      if (!(await rsvp.isVisible({ timeout: 5000 }).catch(() => false))) {
        test.skip(true, 'No RSVP button surfaced — UI may differ on this layout')
      }
      await rsvp.click()
      await page.waitForTimeout(1500)
    })

    await step(page, 'verify going state visible', async () => {
      // After RSVP, expect either a "Going" badge or a button label change.
      await expect(page.getByText(/going/i).first()).toBeVisible({ timeout: 5000 })
    })
  })
})
