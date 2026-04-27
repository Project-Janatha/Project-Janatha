import { test, expect } from '@playwright/test'
import { step } from './helpers/step'

test.describe('Navigation & Route Guards', () => {
  test('unauthenticated user is redirected from home to landing', async ({ page }) => {
    await step(page, 'goto / unauthenticated', async () => {
      await page.goto('/')
      await page.waitForURL(/\/(landing|auth)/, { timeout: 10000 })
      expect(page.url()).toMatch(/\/(landing|auth)/)
    })
  })

  test('unauthenticated user is redirected from events to landing', async ({ page }) => {
    await step(page, 'goto /events unauthenticated', async () => {
      await page.goto('/events')
      await page.waitForURL(/\/(landing|auth)/, { timeout: 10000 })
    })
  })

  test('unauthenticated user is redirected from settings to landing', async ({ page }) => {
    await step(page, 'goto /settings unauthenticated', async () => {
      await page.goto('/settings')
      await page.waitForURL(/\/(landing|auth)/, { timeout: 10000 })
    })
  })

  test('direct access to auth page shows email form', async ({ page }) => {
    await step(page, 'goto /auth', async () => {
      await page.goto('/auth')
      await page.waitForLoadState('networkidle')
    })

    await step(page, 'verify email input and Continue visible', async () => {
      const emailInput = page.getByPlaceholder(/email/i)
      await expect(emailInput).toBeVisible({ timeout: 15000 })
      const continueBtn = page.getByRole('button', { name: /continue/i })
      await expect(continueBtn).toBeVisible()
    })
  })

  test('direct access to landing page works', async ({ page }) => {
    await step(page, 'goto /landing', async () => {
      await page.goto('/landing')
      await page.waitForLoadState('networkidle')
      expect(page.url()).toContain('/landing')
      await expect(page.getByText('Find your center')).toBeVisible({ timeout: 10000 })
    })
  })

  test('unknown routes redirect to landing or auth', async ({ page }) => {
    await step(page, 'goto unknown route', async () => {
      await page.goto('/this-route-does-not-exist')
      await page.waitForTimeout(5000)
      const url = page.url()
      expect(url).toMatch(/\/(landing|auth)/)
    })
  })
})
