// No step() wrapping — this spec is API-only and has no UI to capture.
import { test, expect } from './fixtures'

test.describe('API Health & Basic Endpoints', () => {
  test('health endpoint returns ok', async ({ api }) => {
    const response = await api.get('/api/health')
    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    expect(data.status).toBe('ok')
    expect(data.version).toBeDefined()
    expect(data.message).toContain('running')
  })

  test('GET /api/centers returns valid response', async ({ api }) => {
    const response = await api.get('/api/centers')
    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    expect(data).toHaveProperty('centers')
    expect(Array.isArray(data.centers)).toBeTruthy()
  })

  test('POST /api/auth/register rejects empty body', async ({ api }) => {
    const response = await api.post('/api/auth/register', {
      data: {},
    })
    // Should reject with 400 or similar
    expect(response.status()).toBeGreaterThanOrEqual(400)
  })

  test('POST /api/auth/authenticate rejects invalid credentials', async ({ api }) => {
    const response = await api.post('/api/auth/authenticate', {
      data: {
        username: 'nonexistent_user_e2e_test',
        password: 'wrongpassword',
      },
    })
    expect(response.ok()).toBeFalsy()
  })

  test('GET /api/auth/verify rejects unauthenticated request', async ({ api }) => {
    const response = await api.get('/api/auth/verify')
    expect(response.status()).toBeGreaterThanOrEqual(400)
  })

  test('POST /api/fetchEvent returns error for invalid id', async ({ api }) => {
    const response = await api.post('/api/fetchEvent', {
      data: { id: 'nonexistent-event-id' },
    })
    // Either 404 or empty result
    const data = await response.json()
    if (response.ok()) {
      expect(data.event).toBeFalsy()
    }
  })

  test('POST /api/fetchCenter returns error for invalid id', async ({ api }) => {
    const response = await api.post('/api/fetchCenter', {
      data: { centerID: 'nonexistent-center-id' },
    })
    const data = await response.json()
    if (response.ok()) {
      expect(data.center).toBeFalsy()
    }
  })
})
