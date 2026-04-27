import { test, expect } from '@playwright/test'
import { step } from './helpers/step'

test.describe('Landing Page', () => {
  test('loads and shows hero content', async ({ page }) => {
    await step(page, 'goto root', async () => {
      await page.goto('/')
      await page.waitForURL(/\/(landing|auth)?/, { timeout: 10000 })
    })

    await step(page, 'verify hero text', async () => {
      await expect(page.getByText('Find your center')).toBeVisible({ timeout: 10000 })
      await expect(page.getByText('Grow together')).toBeVisible()
    })
  })

  test('shows navigation bar with Get Started button', async ({ page }) => {
    await step(page, 'goto /landing', async () => {
      await page.goto('/landing')
      await page.waitForLoadState('networkidle')
    })

    await step(page, 'verify brand and Get Started visible', async () => {
      const brand = page.locator('text=Janata >> visible=true').first()
      await expect(brand).toBeVisible({ timeout: 10000 })

      const getStartedBtn = page.getByText('Get Started', { exact: true }).first()
      await expect(getStartedBtn).toBeVisible({ timeout: 10000 })
    })
  })

  test('Join the Community button navigates to auth', async ({ page }) => {
    await step(page, 'goto /landing', async () => {
      await page.goto('/landing')
      await page.waitForLoadState('networkidle')
    })

    await step(page, 'click Join the Community', async () => {
      const joinBtn = page.getByText(/join the community/i)
      await expect(joinBtn).toBeVisible({ timeout: 10000 })
      await joinBtn.click()
    })

    await step(page, 'verify navigated to /auth', async () => {
      await page.waitForURL(/\/auth/, { timeout: 10000 })
    })
  })

  test('Get Started button navigates to auth', async ({ page }) => {
    await step(page, 'goto /landing', async () => {
      await page.goto('/landing')
      await page.waitForLoadState('networkidle')
    })

    await step(page, 'click Get Started', async () => {
      const getStartedBtn = page.getByText('Get Started', { exact: true }).first()
      await expect(getStartedBtn).toBeVisible({ timeout: 10000 })
      await getStartedBtn.click()
    })

    await step(page, 'verify navigated to /auth', async () => {
      await page.waitForURL(/\/auth/, { timeout: 10000 })
    })
  })

  test('page has no critical console errors (excluding WebGL)', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await step(page, 'goto /landing', async () => {
      await page.goto('/landing')
      await page.waitForLoadState('networkidle')
    })

    // Filter out expected errors (WebGL not available in headless, resource loads)
    const criticalErrors = errors.filter(
      (e) =>
        !e.includes('favicon') &&
        !e.includes('manifest') &&
        !e.includes('Failed to load resource') &&
        !e.includes('WebGL') &&
        !e.includes('webglcontextcreationerror')
    )

    expect(criticalErrors).toHaveLength(0)
  })

  test('landing page is responsive', async ({ page }) => {
    await step(page, 'desktop 1280x800', async () => {
      await page.setViewportSize({ width: 1280, height: 800 })
      await page.goto('/landing')
      await expect(page.getByText('Find your center')).toBeVisible({ timeout: 10000 })
    })

    await step(page, 'tablet 768x1024', async () => {
      await page.setViewportSize({ width: 768, height: 1024 })
      await expect(page.getByText('Find your center')).toBeVisible()
    })

    await step(page, 'phone 375x812', async () => {
      await page.setViewportSize({ width: 375, height: 812 })
      await expect(page.getByText('Find your center')).toBeVisible()
    })
  })
})
