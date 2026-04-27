import { test, type Page } from '@playwright/test'

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
}

/**
 * Wraps a UI action in a Playwright test.step and screenshots after it runs.
 * The screenshot is attached to the test report so review.html can index it.
 */
export async function step<T>(
  page: Page,
  label: string,
  fn: () => Promise<T>
): Promise<T> {
  return test.step(label, async () => {
    const result = await fn()
    const info = test.info()
    const idx = String(
      info.attachments.filter((a) => a.contentType === 'image/png').length + 1
    ).padStart(2, '0')
    const screenshotPath = info.outputPath(`step-${idx}-${slug(label)}.png`)
    await page.screenshot({ path: screenshotPath })
    await info.attach(`step ${idx}: ${label}`, {
      path: screenshotPath,
      contentType: 'image/png',
    })
    return result
  })
}
