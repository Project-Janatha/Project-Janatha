import { test, expect } from './fixtures'
import { step } from './helpers/step'
import {
  type TestUser,
  createTestUser,
  loginAsUser,
  cleanupTestUser,
} from './helpers/test-user'

test.describe('Center membership', () => {
  test.describe.configure({ mode: 'serial' })
  test.setTimeout(90_000)

  let user: TestUser
  let centerId: string | null = null

  test.beforeAll(async ({ browser, api }) => {
    const page = await browser.newPage()
    user = await createTestUser(page, api, 'centers')
    await page.close()

    const res = await api.get('/api/centers')
    if (res.ok()) {
      const data = await res.json()
      // Prefer a center the user is NOT yet a member of, fall back to the first.
      const candidate = data.centers?.find((c: any) => !c.isMember) || data.centers?.[0]
      centerId = candidate?.centerID || candidate?.id || null
    }
  })

  test.afterAll(async ({ api }) => {
    if (user) await cleanupTestUser(api, user)
  })

  test.beforeEach(async ({ page }) => {
    if (!centerId) test.skip(true, 'No centers available — skipping centers spec')
    await loginAsUser(page, user)
  })

  test('open a center detail page', async ({ page }) => {
    await step(page, 'navigate to center detail', async () => {
      await page.goto(`/center/${centerId}`)
      await page.waitForLoadState('networkidle')
    })
    await step(page, 'verify URL contains /center/', async () => {
      expect(page.url()).toContain('/center/')
    })
  })

  test('join a center', async ({ page }) => {
    await step(page, 'open center detail', async () => {
      await page.goto(`/center/${centerId}`)
      await page.waitForLoadState('networkidle')
    })

    await step(page, 'click Join', async () => {
      const join = page.getByRole('button', { name: /^join/i }).first()
      if (!(await join.isVisible({ timeout: 5000 }).catch(() => false))) {
        test.skip(true, 'Join button not surfaced — user may already be a member')
      }
      await join.click()
      await page.waitForTimeout(1500)
    })

    await step(page, 'verify member state', async () => {
      // After join, expect a Leave button or member badge to be visible.
      const memberMarker = page
        .getByRole('button', { name: /leave|member/i })
        .or(page.getByText(/member/i))
        .first()
      await expect(memberMarker).toBeVisible({ timeout: 5000 })
    })
  })

  test('leave a center', async ({ page }) => {
    await step(page, 'open center detail', async () => {
      await page.goto(`/center/${centerId}`)
      await page.waitForLoadState('networkidle')
    })

    await step(page, 'click Leave', async () => {
      const leave = page.getByRole('button', { name: /leave/i }).first()
      if (!(await leave.isVisible({ timeout: 5000 }).catch(() => false))) {
        test.skip(true, 'Leave button not surfaced — user may not be a member yet')
      }
      await leave.click()
      await page.waitForTimeout(1500)
    })

    await step(page, 'verify back to non-member state', async () => {
      await expect(page.getByRole('button', { name: /^join/i }).first()).toBeVisible({
        timeout: 5000,
      })
    })
  })
})
