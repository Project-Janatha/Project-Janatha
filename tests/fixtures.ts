import { test as base, type APIRequestContext, request as pwRequest } from '@playwright/test'

/**
 * Extends the default test with an `api` fixture: a request context whose
 * baseURL is the backend API. Use this for any /api/* call in tests, since
 * Playwright's default `request` fixture uses the page baseURL (frontend).
 *
 * Local dev runs frontend on :8081 and backend on :8787 with no proxy, so
 * tests must hit two distinct origins. Production is same-origin and works
 * with either fixture, but use `api` consistently for portability.
 */
export const test = base.extend<{ api: APIRequestContext }>({
  api: async ({}, use) => {
    const apiURL = process.env.E2E_API_URL || 'http://localhost:8787'
    const ctx = await pwRequest.newContext({ baseURL: apiURL })
    await use(ctx)
    await ctx.dispose()
  },
})

export { expect } from '@playwright/test'
