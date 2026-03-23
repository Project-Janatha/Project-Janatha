import { test, expect } from '@playwright/test'

test.describe('API Health & Basic Endpoints', () => {
  test('health endpoint returns ok', async ({ request }) => {
    const response = await request.get('/api/health')
    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    expect(data.status).toBe('ok')
    expect(data.version).toBeDefined()
    expect(data.message).toContain('running')
  })

  test('GET /api/centers returns valid response', async ({ request }) => {
    const response = await request.get('/api/centers')
    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    expect(data).toHaveProperty('centers')
    expect(Array.isArray(data.centers)).toBeTruthy()
  })

  test('POST /api/auth/register rejects empty body', async ({ request }) => {
    const response = await request.post('/api/auth/register', {
      data: {},
    })
    // Should reject with 400 or similar
    expect(response.status()).toBeGreaterThanOrEqual(400)
  })

  test('POST /api/auth/authenticate rejects invalid credentials', async ({ request }) => {
    const response = await request.post('/api/auth/authenticate', {
      data: {
        username: 'nonexistent_user_e2e_test',
        password: 'wrongpassword',
      },
    })
    expect(response.ok()).toBeFalsy()
  })

  test('GET /api/auth/verify rejects unauthenticated request', async ({ request }) => {
    const response = await request.get('/api/auth/verify')
    expect(response.status()).toBeGreaterThanOrEqual(400)
  })

  test('POST /api/fetchEvent returns error for invalid id', async ({ request }) => {
    const response = await request.post('/api/fetchEvent', {
      data: { id: 'nonexistent-event-id' },
    })
    // Either 404 or empty result
    const data = await response.json()
    if (response.ok()) {
      expect(data.event).toBeFalsy()
    }
  })

  test('POST /api/fetchCenter returns error for invalid id', async ({ request }) => {
    const response = await request.post('/api/fetchCenter', {
      data: { centerID: 'nonexistent-center-id' },
    })
    const data = await response.json()
    if (response.ok()) {
      expect(data.center).toBeFalsy()
    }
  })
})
