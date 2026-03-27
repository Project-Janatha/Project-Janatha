/**
 * app.test.ts — Integration tests for all API routes
 *
 * Tests the full Hono app using the CF Workers test pool with a local D1 instance.
 * Covers auth, centers, events, admin, legacy routes, and error handling.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import {
  env,
  createExecutionContext,
  waitOnExecutionContext,
} from 'cloudflare:test'
import { applyMigration, dropAllTables } from './setup'
import { app } from '../app'
import { hashPassword } from '../auth'
import { clearRateLimits } from '../middleware'

// ── Helpers ──────────────────────────────────────────────────────────

async function fetchApp(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const req = new Request(`http://localhost${path}`, init)
  const ctx = createExecutionContext()
  const res = await app.fetch(req, env, ctx)
  await waitOnExecutionContext(ctx)
  return res
}

async function fetchJSON(path: string, init?: RequestInit) {
  const res = await fetchApp(path, init)
  const text = await res.text()
  let body: any = {}
  try {
    body = text ? JSON.parse(text) : {}
  } catch {
    body = { raw: text }
  }
  return { res, body }
}

function jsonPost(path: string, data: unknown, headers: Record<string, string> = {}) {
  return fetchJSON(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(data),
  })
}

function jsonPut(path: string, data: unknown, headers: Record<string, string> = {}) {
  return fetchJSON(path, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(data),
  })
}

function jsonDelete(path: string, data: unknown, headers: Record<string, string> = {}) {
  return fetchJSON(path, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(data),
  })
}

/**
 * Register a user and return their auth token.
 */
async function registerAndLogin(
  username: string,
  password: string,
): Promise<{ token: string; user: any }> {
  await jsonPost('/api/auth/register', { username, password })
  const { body } = await jsonPost('/api/auth/authenticate', {
    username,
    password,
  })
  return { token: body.token, user: body.user }
}

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` }
}

/**
 * Create the admin user (username: 'brahman') and return their token.
 */
async function createAdmin(): Promise<string> {
  const { token } = await registerAndLogin('brahman', 'adminpassword123')
  return token
}

// ── Reset DB before each test ────────────────────────────────────────

beforeEach(async () => {
  await dropAllTables()
  await applyMigration()
  clearRateLimits()
})

// ═══════════════════════════════════════════════════════════════════════
// HEALTH CHECK
// ═══════════════════════════════════════════════════════════════════════

describe('GET /api/health', () => {
  it('returns status ok with version', async () => {
    const { res, body } = await fetchJSON('/api/health')
    expect(res.status).toBe(200)
    expect(body.status).toBe('ok')
    expect(body.message).toBe('Backend is running')
    expect(body.version).toBe('2.1.0')
    expect(body.timestamp).toBeDefined()
  })

  it('includes security headers', async () => {
    const res = await fetchApp('/api/health')
    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff')
    expect(res.headers.get('X-Frame-Options')).toBe('DENY')
    expect(res.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin')
  })
})

// ═══════════════════════════════════════════════════════════════════════
// USER EXISTENCE
// ═══════════════════════════════════════════════════════════════════════

describe('POST /api/userExistence', () => {
  it('returns false for non-existent user', async () => {
    const { body } = await jsonPost('/api/userExistence', { username: 'nobody' })
    expect(body.existence).toBe(false)
  })

  it('returns true for existing user', async () => {
    await registerAndLogin('existinguser', 'password123')
    const { body } = await jsonPost('/api/userExistence', { username: 'existinguser' })
    expect(body.existence).toBe(true)
  })

  it('returns false when username is empty', async () => {
    const { body } = await jsonPost('/api/userExistence', { username: '' })
    expect(body.existence).toBe(false)
  })
})

// ═══════════════════════════════════════════════════════════════════════
// AUTH: REGISTER
// ═══════════════════════════════════════════════════════════════════════

describe('POST /api/auth/register', () => {
  it('registers a new user (201)', async () => {
    const { res, body } = await jsonPost('/api/auth/register', {
      username: 'newuser',
      password: 'password123',
    })
    expect(res.status).toBe(201)
    expect(body.message).toBe('User registered successfully')
    expect(body.username).toBe('newuser')
  })

  it('lowercases the username', async () => {
    const { body } = await jsonPost('/api/auth/register', {
      username: 'CamelCase',
      password: 'password123',
    })
    expect(body.username).toBe('camelcase')
  })

  it('rejects duplicate username (409)', async () => {
    await jsonPost('/api/auth/register', { username: 'dup', password: 'password123' })
    const { res, body } = await jsonPost('/api/auth/register', {
      username: 'dup',
      password: 'password123',
    })
    expect(res.status).toBe(409)
    expect(body.message).toBe('Username already exists')
  })

  it('rejects missing username (400)', async () => {
    const { res } = await jsonPost('/api/auth/register', {
      username: '',
      password: 'password123',
    })
    expect(res.status).toBe(400)
  })

  it('rejects short password (400)', async () => {
    const { res, body } = await jsonPost('/api/auth/register', {
      username: 'shortpw',
      password: 'short',
    })
    expect(res.status).toBe(400)
    expect(body.message).toContain('at least 8 characters')
  })

  it('rejects missing password (400)', async () => {
    const { res } = await jsonPost('/api/auth/register', {
      username: 'nopass',
      password: '',
    })
    expect(res.status).toBe(400)
  })
})

// ═══════════════════════════════════════════════════════════════════════
// AUTH: AUTHENTICATE
// ═══════════════════════════════════════════════════════════════════════

describe('POST /api/auth/authenticate', () => {
  beforeEach(async () => {
    await registerAndLogin('authuser', 'password123')
  })

  it('authenticates with valid credentials', async () => {
    const { res, body } = await jsonPost('/api/auth/authenticate', {
      username: 'authuser',
      password: 'password123',
    })
    expect(res.status).toBe(200)
    expect(body.message).toBe('Authentication successful!')
    expect(body.token).toBeDefined()
    expect(body.refreshToken).toBeDefined()
    expect(body.user).toBeDefined()
    expect(body.user.username).toBe('authuser')
  })

  it('rejects invalid password (401)', async () => {
    const { res, body } = await jsonPost('/api/auth/authenticate', {
      username: 'authuser',
      password: 'wrongpassword',
    })
    expect(res.status).toBe(401)
    expect(body.message).toBe('Invalid credentials')
  })

  it('rejects non-existent user (401)', async () => {
    const { res, body } = await jsonPost('/api/auth/authenticate', {
      username: 'nonexistent',
      password: 'password123',
    })
    expect(res.status).toBe(401)
    expect(body.message).toBe('Invalid credentials')
  })

  it('rejects empty credentials (400)', async () => {
    const { res } = await jsonPost('/api/auth/authenticate', {
      username: '',
      password: '',
    })
    expect(res.status).toBe(400)
  })
})

// ═══════════════════════════════════════════════════════════════════════
// AUTH: VERIFY
// ═══════════════════════════════════════════════════════════════════════

describe('GET /api/auth/verify', () => {
  it('returns user data for valid token', async () => {
    const { token } = await registerAndLogin('verifyuser', 'password123')
    const { res, body } = await fetchJSON('/api/auth/verify', {
      headers: authHeader(token),
    })
    expect(res.status).toBe(200)
    expect(body.message).toBe('Token is valid')
    expect(body.user.username).toBe('verifyuser')
  })

  it('rejects missing auth header (401)', async () => {
    const { res } = await fetchJSON('/api/auth/verify')
    expect(res.status).toBe(401)
  })

  it('rejects invalid token (403)', async () => {
    const { res } = await fetchJSON('/api/auth/verify', {
      headers: { Authorization: 'Bearer invalidtoken' },
    })
    expect(res.status).toBe(403)
  })
})

// ═══════════════════════════════════════════════════════════════════════
// AUTH: DEAUTHENTICATE
// ═══════════════════════════════════════════════════════════════════════

describe('POST /api/auth/deauthenticate', () => {
  it('always returns success', async () => {
    const { res, body } = await jsonPost('/api/auth/deauthenticate', {})
    expect(res.status).toBe(200)
    expect(body.message).toBe('Deauthentication successful!')
  })
})

// ═══════════════════════════════════════════════════════════════════════
// AUTH: COMPLETE ONBOARDING
// ═══════════════════════════════════════════════════════════════════════

describe('POST /api/auth/complete-onboarding', () => {
  it('updates profile with valid data', async () => {
    const { token } = await registerAndLogin('onboarduser', 'password123')
    const { res, body } = await jsonPost(
      '/api/auth/complete-onboarding',
      {
        firstName: 'Rama',
        lastName: 'Krishna',
        profileComplete: true,
      },
      authHeader(token),
    )
    expect(res.status).toBe(200)
    expect(body.message).toBe('Profile completed successfully')
    expect(body.user.firstName).toBe('Rama')
    expect(body.user.lastName).toBe('Krishna')
    expect(body.user.profileComplete).toBe(true)
  })

  it('handles empty centerID gracefully (skips FK)', async () => {
    const { token } = await registerAndLogin('onboard2', 'password123')
    const { res, body } = await jsonPost(
      '/api/auth/complete-onboarding',
      {
        firstName: 'Test',
        centerID: '',
        profileComplete: true,
      },
      authHeader(token),
    )
    expect(res.status).toBe(200)
    expect(body.user.centerID).toBeNull()
  })

  it('requires authentication (401)', async () => {
    const { res } = await jsonPost('/api/auth/complete-onboarding', {
      firstName: 'Rama',
    })
    expect(res.status).toBe(401)
  })
})

// ═══════════════════════════════════════════════════════════════════════
// AUTH: UPDATE PROFILE
// ═══════════════════════════════════════════════════════════════════════

describe('PUT /api/auth/update-profile', () => {
  it('updates profile fields', async () => {
    const { token } = await registerAndLogin('updateuser', 'password123')
    const { res, body } = await jsonPut(
      '/api/auth/update-profile',
      {
        firstName: 'Updated',
        lastName: 'Name',
        email: 'updated@example.com',
      },
      authHeader(token),
    )
    expect(res.status).toBe(200)
    expect(body.user.firstName).toBe('Updated')
    expect(body.user.email).toBe('updated@example.com')
  })

  it('coerces empty centerID to null', async () => {
    const { token } = await registerAndLogin('updateuser2', 'password123')
    const { res, body } = await jsonPut(
      '/api/auth/update-profile',
      { centerID: '' },
      authHeader(token),
    )
    expect(res.status).toBe(200)
    expect(body.user.centerID).toBeNull()
  })

  it('requires authentication (401)', async () => {
    const { res } = await jsonPut('/api/auth/update-profile', {
      firstName: 'Test',
    })
    expect(res.status).toBe(401)
  })
})

// ═══════════════════════════════════════════════════════════════════════
// AUTH: DELETE ACCOUNT
// ═══════════════════════════════════════════════════════════════════════

describe('DELETE /api/auth/delete-account', () => {
  it('deletes the authenticated user account', async () => {
    const { token } = await registerAndLogin('deleteuser', 'password123')
    const { res, body } = await jsonDelete(
      '/api/auth/delete-account',
      {},
      authHeader(token),
    )
    expect(res.status).toBe(200)
    expect(body.message).toBe('Account deleted successfully')

    // Verify user no longer exists
    const { body: existBody } = await jsonPost('/api/userExistence', {
      username: 'deleteuser',
    })
    expect(existBody.existence).toBe(false)
  })

  it('requires authentication (401)', async () => {
    const { res } = await jsonDelete('/api/auth/delete-account', {})
    expect(res.status).toBe(401)
  })
})

// ═══════════════════════════════════════════════════════════════════════
// CENTERS
// ═══════════════════════════════════════════════════════════════════════

describe('GET /api/centers', () => {
  it('returns empty centers list initially', async () => {
    const { res, body } = await fetchJSON('/api/centers')
    expect(res.status).toBe(200)
    expect(body.centers).toEqual([])
  })

  it('returns centers after creation', async () => {
    const { token } = await registerAndLogin('centeruser', 'password123')
    await jsonPost('/api/addCenter', {
      centerName: 'Test Center',
      latitude: 37.0,
      longitude: -121.0,
    }, authHeader(token))
    const { body } = await fetchJSON('/api/centers')
    expect(body.centers).toHaveLength(1)
    expect(body.centers[0].name).toBe('Test Center')
  })
})

describe('POST /api/addCenter', () => {
  it('creates a center successfully', async () => {
    const { token } = await registerAndLogin('centeruser', 'password123')
    const { res, body } = await jsonPost('/api/addCenter', {
      centerName: 'New Center',
      latitude: 37.5,
      longitude: -122.0,
    }, authHeader(token))
    expect(res.status).toBe(200)
    expect(body.message).toBe('Operation successful')
    expect(body.id).toBeDefined()
  })

  it('requires authentication (401)', async () => {
    const { res } = await jsonPost('/api/addCenter', {
      centerName: 'No Auth Center',
      latitude: 37.0,
      longitude: -121.0,
    })
    expect(res.status).toBe(401)
  })

  it('rejects missing centerName (400)', async () => {
    const { token } = await registerAndLogin('centeruser', 'password123')
    const { res } = await jsonPost('/api/addCenter', {
      centerName: '',
      latitude: 37.0,
      longitude: -121.0,
    }, authHeader(token))
    expect(res.status).toBe(400)
  })

  it('rejects invalid latitude (400)', async () => {
    const { token } = await registerAndLogin('centeruser', 'password123')
    const { res } = await jsonPost('/api/addCenter', {
      centerName: 'Bad Center',
      latitude: 999,
      longitude: -121.0,
    }, authHeader(token))
    expect(res.status).toBe(400)
  })

  it('rejects invalid longitude (400)', async () => {
    const { token } = await registerAndLogin('centeruser', 'password123')
    const { res } = await jsonPost('/api/addCenter', {
      centerName: 'Bad Center',
      latitude: 37.0,
      longitude: -999,
    }, authHeader(token))
    expect(res.status).toBe(400)
  })
})

describe('POST /api/fetchCenter', () => {
  it('returns a center by ID', async () => {
    const { token } = await registerAndLogin('fetchcenteruser', 'password123')
    const { body: addBody } = await jsonPost('/api/addCenter', {
      centerName: 'Fetch Center',
      latitude: 37.0,
      longitude: -121.0,
    }, authHeader(token))
    const centerId = addBody.id

    const { res, body } = await jsonPost('/api/fetchCenter', { centerID: centerId })
    expect(res.status).toBe(200)
    expect(body.center.name).toBe('Fetch Center')
  })

  it('returns 404 for non-existent center', async () => {
    const { res } = await jsonPost('/api/fetchCenter', { centerID: 'nonexistent' })
    expect(res.status).toBe(404)
  })

  it('returns 400 for missing centerID', async () => {
    const { res } = await jsonPost('/api/fetchCenter', { centerID: '' })
    expect(res.status).toBe(400)
  })
})

describe('POST /api/fetchAllCenters', () => {
  it('returns all centers with centersList key', async () => {
    const { token } = await registerAndLogin('allcentersuser', 'password123')
    await jsonPost('/api/addCenter', { centerName: 'C1', latitude: 37.0, longitude: -121.0 }, authHeader(token))
    await jsonPost('/api/addCenter', { centerName: 'C2', latitude: 38.0, longitude: -122.0 }, authHeader(token))

    const { body } = await jsonPost('/api/fetchAllCenters', {})
    expect(body.message).toBe('Successful')
    expect(body.centersList).toHaveLength(2)
  })
})

// ═══════════════════════════════════════════════════════════════════════
// ADMIN: CENTER OPERATIONS
// ═══════════════════════════════════════════════════════════════════════

describe('POST /api/verifyCenter (admin only)', () => {
  it('admin can verify a center', async () => {
    const adminToken = await createAdmin()
    const { body: addBody } = await jsonPost('/api/addCenter', {
      centerName: 'Unverified Center',
      latitude: 37.0,
      longitude: -121.0,
    }, authHeader(adminToken))

    const { res, body } = await jsonPost(
      '/api/verifyCenter',
      { centerID: addBody.id },
      authHeader(adminToken),
    )
    expect(res.status).toBe(200)
    expect(body.message).toBe('Successful verification!')
  })

  it('non-admin is rejected (401)', async () => {
    const { token } = await registerAndLogin('normaluser', 'password123')
    const { res } = await jsonPost(
      '/api/verifyCenter',
      { centerID: 'any' },
      authHeader(token),
    )
    expect(res.status).toBe(401)
  })

  it('returns 404 for non-existent center', async () => {
    const adminToken = await createAdmin()
    const { res } = await jsonPost(
      '/api/verifyCenter',
      { centerID: 'nonexistent' },
      authHeader(adminToken),
    )
    expect(res.status).toBe(404)
  })
})

describe('POST /api/removeCenter (admin only)', () => {
  it('admin can remove a center', async () => {
    const adminToken = await createAdmin()
    const { body: addBody } = await jsonPost('/api/addCenter', {
      centerName: 'Removable Center',
      latitude: 37.0,
      longitude: -121.0,
    }, authHeader(adminToken))

    const { res, body } = await jsonPost(
      '/api/removeCenter',
      { centerID: addBody.id },
      authHeader(adminToken),
    )
    expect(res.status).toBe(200)
    expect(body.message).toBe('Successful removal!')
  })

  it('non-admin is rejected (401)', async () => {
    const { token } = await registerAndLogin('regular', 'password123')
    const { res } = await jsonPost(
      '/api/removeCenter',
      { centerID: 'any' },
      authHeader(token),
    )
    expect(res.status).toBe(401)
  })
})

// ═══════════════════════════════════════════════════════════════════════
// ADMIN: USER OPERATIONS
// ═══════════════════════════════════════════════════════════════════════

describe('POST /api/verifyUser (admin only)', () => {
  it('admin can verify a user with a verification level', async () => {
    const adminToken = await createAdmin()
    await registerAndLogin('targetuser', 'password123')

    const { res, body } = await jsonPost(
      '/api/verifyUser',
      { usernameToVerify: 'targetuser', verificationLevel: 54 },
      authHeader(adminToken),
    )
    expect(res.status).toBe(200)
    expect(body.message).toBe('Verification successful.')
  })

  it('non-admin is rejected (401)', async () => {
    const { token } = await registerAndLogin('nonadmin', 'password123')
    const { res } = await jsonPost(
      '/api/verifyUser',
      { usernameToVerify: 'someone', verificationLevel: 54 },
      authHeader(token),
    )
    expect(res.status).toBe(401)
  })

  it('returns 404 for non-existent target user', async () => {
    const adminToken = await createAdmin()
    const { res } = await jsonPost(
      '/api/verifyUser',
      { usernameToVerify: 'ghost', verificationLevel: 54 },
      authHeader(adminToken),
    )
    expect(res.status).toBe(404)
  })
})

describe('POST /api/userUpdate (admin only)', () => {
  it('admin can update a user', async () => {
    const adminToken = await createAdmin()
    await registerAndLogin('targetuser2', 'password123')

    const { res, body } = await jsonPost(
      '/api/userUpdate',
      { username: 'targetuser2', userJSON: { firstName: 'Updated' } },
      authHeader(adminToken),
    )
    expect(res.status).toBe(200)
    expect(body.message).toBe('Operation successful.')
  })

  it('non-admin is rejected (401)', async () => {
    const { token } = await registerAndLogin('normaluser2', 'password123')
    const { res } = await jsonPost(
      '/api/userUpdate',
      { username: 'normaluser2', userJSON: { points: 9999 } },
      authHeader(token),
    )
    expect(res.status).toBe(401)
  })
})

describe('POST /api/updateRegistration (auth + self/admin)', () => {
  it('user can update their own registration', async () => {
    const { token } = await registerAndLogin('selfupdate', 'password123')
    const { res, body } = await jsonPost(
      '/api/updateRegistration',
      { username: 'selfupdate', userJSON: { firstName: 'Self' } },
      authHeader(token),
    )
    expect(res.status).toBe(200)
    expect(body.message).toBe('User updated')
  })

  it('user cannot update another user (401)', async () => {
    await registerAndLogin('victim', 'password123')
    const { token } = await registerAndLogin('attacker', 'password123')
    const { res } = await jsonPost(
      '/api/updateRegistration',
      { username: 'victim', userJSON: { firstName: 'Hacked' } },
      authHeader(token),
    )
    expect(res.status).toBe(401)
  })

  it('requires authentication (401)', async () => {
    const { res } = await jsonPost('/api/updateRegistration', {
      username: 'anyone',
      userJSON: { firstName: 'NoAuth' },
    })
    expect(res.status).toBe(401)
  })
})

describe('POST /api/removeUser (admin only)', () => {
  it('admin can remove a user', async () => {
    const adminToken = await createAdmin()
    await registerAndLogin('removable', 'password123')

    const { res, body } = await jsonPost(
      '/api/removeUser',
      { username: 'removable' },
      authHeader(adminToken),
    )
    expect(res.status).toBe(200)
    expect(body.message).toBe('User removed')
  })

  it('non-admin is rejected (401)', async () => {
    const { token } = await registerAndLogin('cantremove', 'password123')
    const { res } = await jsonPost(
      '/api/removeUser',
      { username: 'cantremove' },
      authHeader(token),
    )
    expect(res.status).toBe(401)
  })
})

// ═══════════════════════════════════════════════════════════════════════
// EVENTS
// ═══════════════════════════════════════════════════════════════════════

describe('event routes', () => {
  let userToken: string
  let adminToken: string
  let centerId: string

  beforeEach(async () => {
    adminToken = await createAdmin()
    const { token } = await registerAndLogin('eventuser', 'password123')
    userToken = token

    // Create a center for events (requires auth now)
    const { body } = await jsonPost('/api/addCenter', {
      centerName: 'Event Center',
      latitude: 37.0,
      longitude: -121.0,
    }, authHeader(adminToken))
    centerId = body.id
  })

  describe('POST /api/addevent', () => {
    it('creates an event successfully', async () => {
      const { res, body } = await jsonPost(
        '/api/addevent',
        {
          title: 'Test Event',
          description: 'A test event',
          date: '2025-06-01T10:00:00Z',
          latitude: 37.0,
          longitude: -121.0,
          centerID: centerId,
        },
        authHeader(userToken),
      )
      expect(res.status).toBe(200)
      expect(body.id).toBeDefined()
      expect(typeof body.tier).toBe('number')
    })

    it('rejects missing centerID (400)', async () => {
      const { res } = await jsonPost(
        '/api/addevent',
        {
          title: 'Bad Event',
          date: '2025-06-01T10:00:00Z',
          latitude: 37.0,
          longitude: -121.0,
          centerID: '',
        },
        authHeader(userToken),
      )
      expect(res.status).toBe(400)
    })

    it('rejects non-existent center (404)', async () => {
      const { res } = await jsonPost(
        '/api/addevent',
        {
          title: 'Bad Event',
          date: '2025-06-01T10:00:00Z',
          latitude: 37.0,
          longitude: -121.0,
          centerID: 'nonexistent-center-id',
        },
        authHeader(userToken),
      )
      expect(res.status).toBe(404)
    })

    it('rejects invalid coordinates (400)', async () => {
      const { res } = await jsonPost(
        '/api/addevent',
        {
          title: 'Bad Event',
          date: '2025-06-01T10:00:00Z',
          latitude: 999,
          longitude: -121.0,
          centerID: centerId,
        },
        authHeader(userToken),
      )
      expect(res.status).toBe(400)
    })

    it('requires authentication (401)', async () => {
      const { res } = await jsonPost('/api/addevent', {
        title: 'No Auth',
        date: '2025-06-01T10:00:00Z',
        latitude: 37.0,
        longitude: -121.0,
        centerID: centerId,
      })
      expect(res.status).toBe(401)
    })
  })

  describe('POST /api/fetchEvent', () => {
    it('returns an event by ID', async () => {
      const { body: addBody } = await jsonPost(
        '/api/addevent',
        {
          title: 'Fetchable Event',
          date: '2025-06-01T10:00:00Z',
          latitude: 37.0,
          longitude: -121.0,
          centerID: centerId,
        },
        authHeader(userToken),
      )

      const { res, body } = await jsonPost('/api/fetchEvent', { id: addBody.id })
      expect(res.status).toBe(200)
      expect(body.event.title).toBe('Fetchable Event')
    })

    it('returns 404 for non-existent event', async () => {
      const { res } = await jsonPost('/api/fetchEvent', { id: 'nonexistent' })
      expect(res.status).toBe(404)
    })
  })

  describe('POST /api/attendEvent & /api/unattendEvent', () => {
    let eventId: string

    beforeEach(async () => {
      const { body } = await jsonPost(
        '/api/addevent',
        {
          title: 'Attend Event',
          date: '2025-06-01T10:00:00Z',
          latitude: 37.0,
          longitude: -121.0,
          centerID: centerId,
        },
        authHeader(userToken),
      )
      eventId = body.id
    })

    it('attends an event and increments count', async () => {
      const { res, body } = await jsonPost(
        '/api/attendEvent',
        { eventID: eventId },
        authHeader(userToken),
      )
      expect(res.status).toBe(200)
      expect(body.message).toBe('Successfully registered for event')
      expect(body.peopleAttending).toBe(1)
    })

    it('unattends an event and decrements count', async () => {
      await jsonPost('/api/attendEvent', { eventID: eventId }, authHeader(userToken))

      const { res, body } = await jsonPost(
        '/api/unattendEvent',
        { eventID: eventId },
        authHeader(userToken),
      )
      expect(res.status).toBe(200)
      expect(body.message).toBe('Successfully unregistered from event')
      expect(body.peopleAttending).toBe(0)
    })

    it('rejects attend with missing eventID (400)', async () => {
      const { res } = await jsonPost(
        '/api/attendEvent',
        { eventID: '' },
        authHeader(userToken),
      )
      expect(res.status).toBe(400)
    })

    it('rejects attend for non-existent event (404)', async () => {
      const { res } = await jsonPost(
        '/api/attendEvent',
        { eventID: 'ghost-event' },
        authHeader(userToken),
      )
      expect(res.status).toBe(404)
    })
  })

  describe('POST /api/getEventUsers', () => {
    it('returns attendees for an event', async () => {
      const { body: addBody } = await jsonPost(
        '/api/addevent',
        {
          title: 'Users Event',
          date: '2025-06-01T10:00:00Z',
          latitude: 37.0,
          longitude: -121.0,
          centerID: centerId,
        },
        authHeader(userToken),
      )

      await jsonPost('/api/attendEvent', { eventID: addBody.id }, authHeader(userToken))

      const { res, body } = await jsonPost('/api/getEventUsers', { id: addBody.id })
      expect(res.status).toBe(200)
      expect(body.users).toHaveLength(1)
      expect(body.users[0].username).toBe('eventuser')
    })
  })

  describe('POST /api/removeEvent', () => {
    it('admin can remove an event', async () => {
      const { body: addBody } = await jsonPost(
        '/api/addevent',
        {
          title: 'Removable Event',
          date: '2025-06-01T10:00:00Z',
          latitude: 37.0,
          longitude: -121.0,
          centerID: centerId,
        },
        authHeader(userToken),
      )

      const { res, body } = await jsonPost(
        '/api/removeEvent',
        { id: addBody.id },
        authHeader(adminToken),
      )
      expect(res.status).toBe(200)
      expect(body.message).toBe('Event removed')

      // Verify deletion
      const { res: fetchRes } = await jsonPost('/api/fetchEvent', { id: addBody.id })
      expect(fetchRes.status).toBe(404)
    })

    it('non-admin is rejected (401)', async () => {
      const { body: addBody } = await jsonPost(
        '/api/addevent',
        {
          title: 'Protected Event',
          date: '2025-06-01T10:00:00Z',
          latitude: 37.0,
          longitude: -121.0,
          centerID: centerId,
        },
        authHeader(userToken),
      )

      const { res } = await jsonPost(
        '/api/removeEvent',
        { id: addBody.id },
        authHeader(userToken),
      )
      expect(res.status).toBe(401)
    })
  })

  describe('POST /api/updateEvent', () => {
    it('admin can update event fields', async () => {
      const { body: addBody } = await jsonPost(
        '/api/addevent',
        {
          title: 'Original Title',
          date: '2025-06-01T10:00:00Z',
          latitude: 37.0,
          longitude: -121.0,
          centerID: centerId,
        },
        authHeader(userToken),
      )

      const { res, body } = await jsonPost(
        '/api/updateEvent',
        { eventJSON: { id: addBody.id, title: 'Updated Title' } },
        authHeader(adminToken),
      )
      expect(res.status).toBe(200)
      expect(body.message).toBe('Event updated')

      // Verify update
      const { body: fetchBody } = await jsonPost('/api/fetchEvent', { id: addBody.id })
      expect(fetchBody.event.title).toBe('Updated Title')
    })

    it('non-admin is rejected (401)', async () => {
      const { res } = await jsonPost(
        '/api/updateEvent',
        { eventJSON: { id: 'any', title: 'No' } },
        authHeader(userToken),
      )
      expect(res.status).toBe(404)
    })

    it('returns 400 for missing event ID', async () => {
      const { res } = await jsonPost(
        '/api/updateEvent',
        { eventJSON: { title: 'No ID' } },
        authHeader(adminToken),
      )
      expect(res.status).toBe(400)
    })

    it('returns 404 for non-existent event', async () => {
      const { res } = await jsonPost(
        '/api/updateEvent',
        { eventJSON: { id: 'nonexistent', title: 'Test' } },
        authHeader(adminToken),
      )
      expect(res.status).toBe(404)
    })
  })

  describe('POST /api/fetchEventsByCenter', () => {
    it('returns events for a specific center', async () => {
      await jsonPost(
        '/api/addevent',
        {
          title: 'Center Event',
          date: '2025-06-01T10:00:00Z',
          latitude: 37.0,
          longitude: -121.0,
          centerID: centerId,
        },
        authHeader(userToken),
      )

      const { body } = await jsonPost('/api/fetchEventsByCenter', { centerID: centerId })
      expect(body.events).toHaveLength(1)
      expect(body.events[0].title).toBe('Center Event')
    })
  })

  describe('POST /api/getUserEvents', () => {
    it('returns events a user is attending', async () => {
      const { body: addBody } = await jsonPost(
        '/api/addevent',
        {
          title: 'User Event',
          date: '2025-06-01T10:00:00Z',
          latitude: 37.0,
          longitude: -121.0,
          centerID: centerId,
        },
        authHeader(userToken),
      )

      await jsonPost('/api/attendEvent', { eventID: addBody.id }, authHeader(userToken))

      const { body } = await jsonPost(
        '/api/getUserEvents',
        { username: 'eventuser' },
        authHeader(userToken),
      )
      expect(body.events).toHaveLength(1)
      expect(body.events[0].title).toBe('User Event')
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════
// LEGACY ROUTES
// ═══════════════════════════════════════════════════════════════════════

describe('legacy routes', () => {
  it('POST /api/register forwards to auth/register', async () => {
    const { res, body } = await jsonPost('/api/register', {
      username: 'legacyuser',
      password: 'password123',
    })
    expect(res.status).toBe(201)
    expect(body.username).toBe('legacyuser')
  })

  it('POST /api/authenticate forwards to auth/authenticate', async () => {
    await jsonPost('/api/register', { username: 'legacyauth', password: 'password123' })
    const { res, body } = await jsonPost('/api/authenticate', {
      username: 'legacyauth',
      password: 'password123',
    })
    expect(res.status).toBe(200)
    expect(body.token).toBeDefined()
  })

  it('POST /api/deauthenticate returns success', async () => {
    const { res, body } = await jsonPost('/api/deauthenticate', {})
    expect(res.status).toBe(200)
    expect(body.message).toBe('Deauthentication successful!')
  })
})

// ═══════════════════════════════════════════════════════════════════════
// FUN ROUTE
// ═══════════════════════════════════════════════════════════════════════

describe('POST /api/brewCoffee', () => {
  it('returns 418 I\'m a teapot', async () => {
    const { res, body } = await jsonPost('/api/brewCoffee', {})
    expect(res.status).toBe(418)
    expect(body.message).toContain('teapot')
  })
})
