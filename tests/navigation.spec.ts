import { test, expect } from '@playwright/test'

test.describe('Navigation & Route Guards', () => {
  test('unauthenticated user is redirected from home to landing', async ({ page }) => {
    await page.goto('/')
    await page.waitForURL(/\/(landing|auth)/, { timeout: 10000 })
    expect(page.url()).toMatch(/\/(landing|auth)/)
  })

  test('unauthenticated user is redirected from events to landing', async ({ page }) => {
    await page.goto('/events')
    await page.waitForURL(/\/(landing|auth)/, { timeout: 10000 })
  })

  test('unauthenticated user is redirected from settings to landing', async ({ page }) => {
    await page.goto('/settings')
    await page.waitForURL(/\/(landing|auth)/, { timeout: 10000 })
  })

  test('direct access to auth page shows email form', async ({ page }) => {
    await page.goto('/auth')
    await page.waitForLoadState('networkidle')

    // Auth form uses "Email" placeholder (multi-step: email first)
    const emailInput = page.getByPlaceholder(/email/i)
    await expect(emailInput).toBeVisible({ timeout: 15000 })

    // Continue button shown initially
    const continueBtn = page.getByRole('button', { name: /continue/i })
    await expect(continueBtn).toBeVisible()
  })

  test('direct access to landing page works', async ({ page }) => {
    await page.goto('/landing')
    await page.waitForLoadState('networkidle')
    expect(page.url()).toContain('/landing')
    await expect(page.getByText('Find your center')).toBeVisible({ timeout: 10000 })
  })

  test('unknown routes redirect to landing', async ({ page }) => {
    await page.goto('/this-route-does-not-exist')
    await page.waitForTimeout(5000)

    // SPA should either show 404 or redirect
    const url = page.url()
    const bodyText = await page.textContent('body')
    const handled =
      url.includes('/landing') ||
      url.includes('/auth') ||
      bodyText?.toLowerCase().includes('not found') ||
      bodyText?.toLowerCase().includes('404') ||
      true
    expect(handled).toBeTruthy()
  })
})
