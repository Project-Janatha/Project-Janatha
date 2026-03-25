/**
 * app.ts
 *
 * Om Sri Chinmaya Sadgurave Namaha. Om Sri Gurubyo Namaha.
 *
 * Hono application for Chinmaya Janata backend.
 * Runs on Cloudflare Workers / Pages Functions.
 *
 * All Express routes ported to Hono with D1 + Web Crypto auth.
 */
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { Env, UserRow, EventRow } from './types'
import { userRowToApi, centerRowToApi, eventRowToApi } from './types'
import {
  hashPassword,
  verifyPassword,
  generateToken,
  generateRefreshToken,
  verifyToken,
} from './auth'
import * as db from './db'
import { ADMIN_NAME, NORMAL_USER, SEVAK, BRAHMACHARI, TIER_DESCALE } from './constants'
import { rateLimit, cacheControl, securityHeaders, validate } from './middleware'

// ── Hono app type with CF bindings ────────────────────────────────────

type HonoEnv = {
  Bindings: Env
  Variables: {
    user: UserRow
  }
}

export const app = new Hono<HonoEnv>().basePath('/api')

// ── Global error handler ──────────────────────────────────────────────

app.onError((err, c) => {
  console.error(`[${c.req.method}] ${c.req.path} — Unhandled error:`, err)
  const errorMessage = err instanceof Error ? err.message : String(err)
  const stack = err instanceof Error ? err.stack : ''
  console.error('Stack:', stack)
  return c.json({ message: 'Internal server error', error: errorMessage }, 500)
})

// ── Global middleware ─────────────────────────────────────────────────

app.use(
  '*',
  cors({
    origin: (origin) => {
      if (!origin) return '*'
      const allowed = [
        'https://chinmaya-janata.pages.dev',
        'http://localhost:8081',
        'http://localhost:8787',
        'http://localhost:19006',
      ]
      if (allowed.includes(origin)) return origin
      if (origin.endsWith('.chinmaya-janata.pages.dev')) return origin
      return ''
    },
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400,
  })
)

app.use('*', securityHeaders)

// ── Auth middleware factory ───────────────────────────────────────────

async function authMiddleware(c: any, next: () => Promise<void>): Promise<Response | void> {
  const authHeader = c.req.header('Authorization')
  if (!authHeader) {
    return c.json({ message: 'Authorization header missing' }, 401)
  }

  const parts = authHeader.split(' ')
  const token = parts.length > 1 ? parts[1] : parts[0]
  if (!token) {
    return c.json({ message: 'Authorization header missing' }, 401)
  }

  const decoded = await verifyToken(token, c.env.JWT_SECRET)
  if (!decoded || decoded.type !== 'access') {
    return c.json({ message: 'Invalid or expired token' }, 403)
  }

  const userData = await db.getUserByUsername(c.env.DB, decoded.username)
  if (!userData) {
    return c.json({ message: 'User not found' }, 403)
  }

  c.set('user', userData)
  await next()
}

// ── Health check ──────────────────────────────────────────────────────

app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    message: 'Backend is running',
    version: '2.1.0',
    timestamp: new Date().toISOString(),
  })
})

// ── User existence check ──────────────────────────────────────────────

app.post('/userExistence', async (c) => {
  const { username } = await c.req.json<{ username: string }>()
  if (!username) {
    return c.json({ existence: false })
  }
  const user = await db.getUserByUsername(c.env.DB, username)
  return c.json({ existence: !!user })
})

// ═══════════════════════════════════════════════════════════════════════
// AUTH ROUTES
// ═══════════════════════════════════════════════════════════════════════

app.post('/auth/register', rateLimit(5, 60_000), async (c) => {
  console.log('Register endpoint hit')
  const body = await c.req.json<{
    username: string
    password: string
  }>()
  console.log('Parsed body:', body)

  const normalizedUsername = validate.username(body.username)
  const validPassword = validate.password(body.password)

  console.log('normalizedUsername:', normalizedUsername)
  console.log('validPassword:', validPassword ? 'present' : 'missing')

  if (!normalizedUsername || !validPassword) {
    return c.json({ message: 'Username and password are required' }, 400)
  }

  if (validPassword.length < 8) {
    return c.json({ message: 'Password must be at least 8 characters long' }, 400)
  }

  const existingUser = await db.getUserByUsername(c.env.DB, normalizedUsername.toLowerCase())
  console.log('existingUser:', existingUser ? 'found' : 'none')
  if (existingUser) {
    return c.json({ message: 'Username already exists' }, 409)
  }

  console.log('Hashing password...')
  const hashedPassword = await hashPassword(validPassword)
  console.log('Password hashed')

  console.log('Creating user...')
  console.log('DB:', c.env.DB)
  try {
    const created = await db.createUser(c.env.DB, {
      id: crypto.randomUUID(),
      username: normalizedUsername.toLowerCase(),
      password: hashedPassword,
    })
    console.log('createUser result:', created)

    if (!created.success) {
    const status = created.error === 'User already exists' ? 409 : 500
    return c.json(
      {
        message:
          created.error === 'User already exists'
            ? 'Username already exists'
            : 'Failed to create user',
      },
      status
    )
  }

  return c.json(
    { message: 'User registered successfully', username: normalizedUsername.toLowerCase() },
    201
  )
  } catch (err: any) {
    console.error('createUser error:', err)
    return c.json({ message: 'Failed to create user', error: err?.message }, 500)
  }
})

app.post('/auth/authenticate', rateLimit(5, 60_000), async (c) => {
  const body = await c.req.json<{
    username: string
    password: string
  }>()

  const normalizedUsername = validate.username(body.username)
  const validPassword = validate.password(body.password)

  if (!normalizedUsername || !validPassword) {
    return c.json({ message: 'Username and password are required.' }, 400)
  }

  const user = await db.getUserByUsername(c.env.DB, normalizedUsername.toLowerCase())
  if (!user) {
    return c.json({ message: 'Invalid credentials' }, 401)
  }

  const passwordMatch = await verifyPassword(validPassword, user.password)
  if (!passwordMatch) {
    return c.json({ message: 'Invalid credentials' }, 401)
  }

  const jwtSecret = c.env.JWT_SECRET
  const refreshSecret = c.env.JWT_REFRESH_SECRET || jwtSecret

  const token = await generateToken(user, jwtSecret)
  const refreshToken = await generateRefreshToken(user, refreshSecret)

  return c.json({
    message: 'Authentication successful!',
    user: userRowToApi(user),
    token,
    refreshToken,
  })
})

app.post('/auth/deauthenticate', (c) => {
  return c.json({ message: 'Deauthentication successful!' })
})

app.get('/auth/verify', authMiddleware, (c) => {
  const user = c.get('user')
  return c.json({
    message: 'Token is valid',
    user: userRowToApi(user),
  })
})

app.post('/auth/complete-onboarding', authMiddleware, async (c) => {
  try {
    const user = c.get('user')
    const body = await c.req.json<{
      firstName?: string
      lastName?: string
      dateOfBirth?: string
      centerID?: string
      profileComplete?: boolean
      phoneNumber?: string
      interests?: string[]
    }>()

    const updates: Partial<UserRow> = {}
    if (body.firstName !== undefined) updates.first_name = body.firstName
    if (body.lastName !== undefined) updates.last_name = body.lastName
    if (body.dateOfBirth !== undefined) updates.date_of_birth = body.dateOfBirth
    // Skip center_id if empty string (no center selected during onboarding)
    if (body.centerID) updates.center_id = body.centerID
    if (body.profileComplete !== undefined) updates.profile_complete = body.profileComplete ? 1 : 0
    if (body.phoneNumber !== undefined) updates.phone_number = body.phoneNumber
    if (body.interests !== undefined) updates.interests = JSON.stringify(body.interests)

    const result = await db.updateUser(c.env.DB, user.id, updates)

    if (result.success) {
      const updated = await db.getUserById(c.env.DB, user.id)
      return c.json({
        message: 'Profile completed successfully',
        user: updated ? userRowToApi(updated) : null,
      })
    }

    return c.json({ message: 'Failed to update profile', error: result.error }, 500)
  } catch (err: any) {
    console.error('complete-onboarding error:', err)
    return c.json({ message: 'Failed to complete onboarding' }, 500)
  }
})

app.put('/auth/update-profile', authMiddleware, async (c) => {
  const user = c.get('user')
  const body = await c.req.json<{
    firstName?: string
    lastName?: string
    email?: string
    centerID?: string
    profileComplete?: boolean
    profileImage?: string
    bio?: string
    phoneNumber?: string
    interests?: string[]
  }>()

  const updates: Partial<UserRow> = {}
  if (body.firstName !== undefined) updates.first_name = body.firstName
  if (body.lastName !== undefined) updates.last_name = body.lastName
  if (body.email !== undefined) updates.email = body.email
  // Coerce empty string to null (allowed by FK), reject non-existent center IDs naturally
  if (body.centerID !== undefined) updates.center_id = body.centerID || null
  if (body.profileComplete !== undefined) updates.profile_complete = body.profileComplete ? 1 : 0
  if (body.profileImage !== undefined) updates.profile_image = body.profileImage
  if (body.bio !== undefined) updates.bio = body.bio || null
  if (body.phoneNumber !== undefined) updates.phone_number = body.phoneNumber
  if (body.interests !== undefined) updates.interests = JSON.stringify(body.interests)

  const result = await db.updateUser(c.env.DB, user.id, updates)

  if (result.success) {
    const updated = await db.getUserById(c.env.DB, user.id)
    return c.json({
      message: 'Profile updated',
      user: updated ? userRowToApi(updated) : null,
    })
  }

  return c.json({ message: 'Failed to update profile', error: result.error }, 500)
})

app.delete('/auth/delete-account', authMiddleware, async (c) => {
  const user = c.get('user')
  const result = await db.deleteUser(c.env.DB, user.id)

  if (result.success) {
    return c.json({ message: 'Account deleted successfully' })
  }

  return c.json({ message: 'Failed to delete account', error: result.error }, 500)
})

// Legacy auth routes (backward compatibility)
app.post('/register', rateLimit(10, 60_000), async (c) => {
  // Forward to the new route handler
  const body = await c.req.json()
  const url = new URL(c.req.url)
  url.pathname = '/api/auth/register'
  const newReq = new Request(url.toString(), {
    method: 'POST',
    headers: c.req.raw.headers,
    body: JSON.stringify(body),
  })
  return app.fetch(newReq, c.env)
})

app.post('/authenticate', rateLimit(10, 60_000), async (c) => {
  const body = await c.req.json()
  const url = new URL(c.req.url)
  url.pathname = '/api/auth/authenticate'
  const newReq = new Request(url.toString(), {
    method: 'POST',
    headers: c.req.raw.headers,
    body: JSON.stringify(body),
  })
  return app.fetch(newReq, c.env)
})

app.post('/deauthenticate', (c) => {
  return c.json({ message: 'Deauthentication successful!' })
})

// ═══════════════════════════════════════════════════════════════════════
// CENTER ROUTES
// ═══════════════════════════════════════════════════════════════════════

app.get('/centers', cacheControl(30), async (c) => {
  const centers = await db.getAllCenters(c.env.DB)
  return c.json({ centers: centers.map(centerRowToApi) })
})

app.post('/addCenter', authMiddleware, async (c) => {
  const body = await c.req.json<{
    latitude: number
    longitude: number
    centerName: string
    address?: string
    website?: string
    phone?: string
    image?: string
    acharya?: string
    pointOfContact?: string
  }>()

  const validName = validate.centerName(body.centerName)
  if (!validName) {
    return c.json({ message: 'centerName is required (max 100 characters)' }, 400)
  }

  const lat = typeof body.latitude === 'number' ? body.latitude : NaN
  const lng = typeof body.longitude === 'number' ? body.longitude : NaN
  if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return c.json(
      { message: 'Valid latitude (-90..90) and longitude (-180..180) are required' },
      400
    )
  }

  const id = crypto.randomUUID()
  const result = await db.createCenter(c.env.DB, {
    id,
    name: validName,
    latitude: lat,
    longitude: lng,
    address: body.address ?? null,
    website: body.website ?? null,
    phone: body.phone ?? null,
    image: body.image ?? null,
    acharya: body.acharya ?? null,
    point_of_contact: body.pointOfContact ?? null,
  })

  if (!result.success) {
    return c.json({ message: 'Internal server error OR center ID not unique' }, 500)
  }

  return c.json({ message: 'Operation successful', id })
})

app.post('/verifyCenter', authMiddleware, async (c) => {
  const user = c.get('user')
  if (user.username !== ADMIN_NAME) {
    return c.json({ message: 'User is not authorized to verify or verification failed.' }, 401)
  }

  const { centerID } = await c.req.json<{ centerID: string }>()
  const center = await db.getCenterById(c.env.DB, centerID)
  if (!center) {
    return c.json({ message: 'Center not found' }, 404)
  }

  const result = await db.updateCenter(c.env.DB, centerID, {
    is_verified: 1,
  })

  if (result.success) {
    return c.json({ message: 'Successful verification!' })
  }
  return c.json({ message: 'Verification failed' }, 500)
})

app.post('/removeCenter', authMiddleware, async (c) => {
  const user = c.get('user')
  if (user.username !== ADMIN_NAME) {
    return c.json({ message: 'Insufficient permissions' }, 401)
  }

  const { centerID } = await c.req.json<{ centerID: string }>()
  const result = await db.deleteCenter(c.env.DB, centerID)

  if (result.success) {
    return c.json({ message: 'Successful removal!' })
  }
  return c.json({ message: 'Removal failed' }, 500)
})

app.post('/fetchAllCenters', cacheControl(30), async (c) => {
  const centers = await db.getAllCenters(c.env.DB)
  return c.json({
    message: 'Successful',
    centersList: centers.map(centerRowToApi),
  })
})

app.post('/fetchCenter', cacheControl(30), async (c) => {
  const { centerID } = await c.req.json<{ centerID: string }>()
  if (!centerID) {
    return c.json({ message: 'Malformed centerID' }, 400)
  }

  const center = await db.getCenterById(c.env.DB, centerID)
  if (!center) {
    return c.json({ message: 'Center not found' }, 404)
  }

  return c.json({ message: 'Success', center: centerRowToApi(center) })
})

// ═══════════════════════════════════════════════════════════════════════
// USER ROUTES
// ═══════════════════════════════════════════════════════════════════════

app.post('/verifyUser', authMiddleware, async (c) => {
  const adminUser = c.get('user')
  if (adminUser.username !== ADMIN_NAME) {
    return c.json({ message: 'Insufficient permission to authorize.' }, 401)
  }

  const { usernameToVerify, verificationLevel } = await c.req.json<{
    usernameToVerify: string
    verificationLevel: number
  }>()

  const targetUser = await db.getUserByUsername(c.env.DB, usernameToVerify)
  if (!targetUser) {
    return c.json({ message: 'User not found.' }, 404)
  }

  const result = await db.updateUser(c.env.DB, targetUser.id, {
    is_verified: 1,
    verification_level: verificationLevel,
  })

  if (result.success) {
    return c.json({ message: 'Verification successful.' })
  }
  return c.json({ message: 'Verification failed.' }, 500)
})

app.post('/userUpdate', authMiddleware, async (c) => {
  const user = c.get('user')
  if (user.username !== ADMIN_NAME) {
    return c.json({ message: 'Insufficient permissions' }, 401)
  }

  const { username, userJSON } = await c.req.json<{
    username: string
    userJSON: any
  }>()

  const targetUser = await db.getUserByUsername(c.env.DB, username)
  if (!targetUser) {
    return c.json({ message: 'User not found.' }, 404)
  }

  // Map the legacy userJSON fields to D1 column names
  const updates: Partial<UserRow> = {}
  if (userJSON.firstName !== undefined) updates.first_name = userJSON.firstName
  if (userJSON.lastName !== undefined) updates.last_name = userJSON.lastName
  if (userJSON.dateOfBirth !== undefined) updates.date_of_birth = userJSON.dateOfBirth
  if (userJSON.profilePictureURL !== undefined) updates.profile_image = userJSON.profilePictureURL
  if (userJSON.center !== undefined)
    updates.center_id = userJSON.center === -1 ? null : String(userJSON.center)
  if (userJSON.points !== undefined) updates.points = userJSON.points
  if (userJSON.isVerified !== undefined) updates.is_verified = userJSON.isVerified ? 1 : 0
  if (userJSON.verificationLevel !== undefined)
    updates.verification_level = userJSON.verificationLevel
  if (userJSON.isActive !== undefined) updates.is_active = userJSON.isActive ? 1 : 0

  const result = await db.updateUser(c.env.DB, targetUser.id, updates)

  if (result.success) {
    return c.json({ message: 'Operation successful.' })
  }
  return c.json({ message: 'Update failed.' }, 400)
})

app.post('/updateRegistration', authMiddleware, async (c) => {
  const user = c.get('user')
  const { username, userJSON } = await c.req.json<{
    username: string
    userJSON: any
  }>()

  if (user.username !== username && user.username !== ADMIN_NAME) {
    return c.json({ message: 'Insufficient permissions' }, 401)
  }

  const targetUser = await db.getUserByUsername(c.env.DB, username)
  if (!targetUser) {
    return c.json({ message: 'Update failed' }, 400)
  }

  const updates: Partial<UserRow> = {}
  if (userJSON.firstName !== undefined) updates.first_name = userJSON.firstName
  if (userJSON.lastName !== undefined) updates.last_name = userJSON.lastName
  if (userJSON.dateOfBirth !== undefined) updates.date_of_birth = userJSON.dateOfBirth
  if (userJSON.center !== undefined)
    updates.center_id = userJSON.center === -1 ? null : String(userJSON.center)

  const result = await db.updateUser(c.env.DB, targetUser.id, updates)

  if (result.success) {
    return c.json({ message: 'User updated' })
  }
  return c.json({ message: 'Update failed' }, 400)
})

app.post('/removeUser', authMiddleware, async (c) => {
  const user = c.get('user')
  if (user.username !== ADMIN_NAME) {
    return c.json({ message: 'Insufficient permissions' }, 401)
  }

  const { username } = await c.req.json<{ username: string }>()
  const targetUser = await db.getUserByUsername(c.env.DB, username)
  if (!targetUser) {
    return c.json({ message: 'Removal failed' }, 400)
  }

  const result = await db.deleteUser(c.env.DB, targetUser.id)
  if (result.success) {
    return c.json({ message: 'User removed' })
  }
  return c.json({ message: 'Removal failed' }, 400)
})

app.post('/getUserEvents', authMiddleware, async (c) => {
  const { username } = await c.req.json<{ username: string }>()
  const targetUser = await db.getUserByUsername(c.env.DB, username)
  if (!targetUser) {
    return c.json({ message: 'User not found' }, 404)
  }

  const events = await db.getUserEvents(c.env.DB, targetUser.id)
  return c.json({
    message: 'Success',
    events: events.map(eventRowToApi),
  })
})

// ═══════════════════════════════════════════════════════════════════════
// EVENT ROUTES
// ═══════════════════════════════════════════════════════════════════════

app.post('/addevent', authMiddleware, async (c) => {
  const data = await c.req.json<{
    title?: string
    description?: string
    latitude: number
    longitude: number
    address?: string
    date: string
    centerID: string
    endorsers?: string[]
    pointOfContact?: string
    image?: string
    category?: number
  }>()

  // Validate required fields
  const validCenterID = validate.id(data.centerID)
  if (!validCenterID) {
    return c.json({ message: 'Valid centerID is required' }, 400)
  }

  if (!data.date || typeof data.date !== 'string') {
    return c.json({ message: 'date is required' }, 400)
  }

  const lat = typeof data.latitude === 'number' ? data.latitude : NaN
  const lng = typeof data.longitude === 'number' ? data.longitude : NaN
  if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return c.json(
      { message: 'Valid latitude (-90..90) and longitude (-180..180) are required' },
      400
    )
  }

  // Validate optional string fields (false = exceeded max length)
  const validTitle = validate.title(data.title)
  const validDescription = validate.description(data.description)
  const validAddress = validate.address(data.address)
  const validImage = validate.url(data.image)

  if (
    validTitle === false ||
    validDescription === false ||
    validAddress === false ||
    validImage === false
  ) {
    return c.json({ message: 'One or more fields exceed maximum length' }, 400)
  }

  // Validate center exists
  const center = await db.getCenterById(c.env.DB, validCenterID)
  if (!center) {
    return c.json({ message: 'Center not found.' }, 404)
  }

  const eventId = crypto.randomUUID()

  const result = await db.createEvent(c.env.DB, {
    id: eventId,
    title: validTitle ?? '',
    description: validDescription ?? '',
    date: data.date,
    latitude: lat,
    longitude: lng,
    address: validAddress ?? null,
    center_id: validCenterID,
    point_of_contact: data.pointOfContact ?? null,
    image: validImage ?? null,
    category: data.category ?? null,
  })

  if (!result.success) {
    return c.json({ message: 'Failed to store event.' }, 500)
  }

  // Add endorsers
  if (data.endorsers && data.endorsers.length > 0) {
    for (const endorserUsername of data.endorsers) {
      const endorserUser = await db.getUserByUsername(c.env.DB, endorserUsername)
      if (endorserUser && endorserUser.verification_level >= SEVAK) {
        await db.addEventEndorser(c.env.DB, eventId, endorserUser.id)
        // Also add as attendee
        await db.addEventAttendee(c.env.DB, eventId, endorserUser.id)
      }
    }
  }

  // Calculate tier
  const endorsers = await db.getEventEndorsers(c.env.DB, eventId)
  const attendeeCount = (await db.getEventAttendees(c.env.DB, eventId)).length
  const tier = calculateTier(endorsers, attendeeCount)
  await db.updateEvent(c.env.DB, eventId, { tier, people_attending: attendeeCount })

  return c.json({ id: eventId, tier })
})

app.post('/removeEvent', authMiddleware, async (c) => {
  const user = c.get('user')
  if (user.username !== ADMIN_NAME) {
    return c.json({ message: 'Insufficient permissions' }, 401)
  }

  const { id } = await c.req.json<{ id: string }>()
  const result = await db.deleteEvent(c.env.DB, id)
  if (result.success) {
    return c.json({ message: 'Event removed' })
  }
  return c.json({ message: 'Failed to remove event' }, 500)
})

app.post('/fetchEvent', cacheControl(30), async (c) => {
  const { id } = await c.req.json<{ id: string }>()
  const event = await db.getEventById(c.env.DB, id)
  if (!event) {
    return c.json({ message: 'Event not found' }, 404)
  }
  return c.json({ message: 'Success', event: eventRowToApi(event) })
})

app.post('/updateEvent', authMiddleware, async (c) => {
  const user = c.get('user')
  if (user.username !== ADMIN_NAME) {
    return c.json({ message: 'Insufficient permissions' }, 401)
  }

  const { eventJSON } = await c.req.json<{ eventJSON: any }>()

  const eventId = eventJSON.id || eventJSON.eventID
  if (!eventId) {
    return c.json({ message: 'Event ID required' }, 400)
  }

  const existing = await db.getEventById(c.env.DB, eventId)
  if (!existing) {
    return c.json({ message: 'Event not found' }, 404)
  }

  const updates: Partial<EventRow> = {}
  if (eventJSON.title !== undefined) updates.title = eventJSON.title
  if (eventJSON.description !== undefined) updates.description = eventJSON.description
  if (eventJSON.date !== undefined) updates.date = eventJSON.date
  if (eventJSON.latitude !== undefined) updates.latitude = parseFloat(String(eventJSON.latitude))
  if (eventJSON.longitude !== undefined) updates.longitude = parseFloat(String(eventJSON.longitude))
  if (eventJSON.address !== undefined) updates.address = eventJSON.address
  if (eventJSON.centerID !== undefined) updates.center_id = eventJSON.centerID
  if (eventJSON.pointOfContact !== undefined) updates.point_of_contact = eventJSON.pointOfContact
  if (eventJSON.image !== undefined) updates.image = eventJSON.image
  if (eventJSON.category !== undefined) updates.category = eventJSON.category

  const result = await db.updateEvent(c.env.DB, eventId, updates)
  if (result.success) {
    return c.json({ message: 'Event updated' })
  }
  return c.json({ message: 'Update failed' }, 400)
})

app.post('/getEventUsers', cacheControl(30), async (c) => {
  const { id } = await c.req.json<{ id: string }>()
  if (!id) {
    return c.json({ message: 'Bad request - missing id' }, 400)
  }

  const event = await db.getEventById(c.env.DB, id)
  if (!event) {
    return c.json({ message: 'Event not found' }, 404)
  }

  const attendees = await db.getEventAttendees(c.env.DB, id)
  return c.json({
    message: 'Success',
    users: attendees.map((u) => userRowToApi(u)),
  })
})

app.post('/attendEvent', authMiddleware, async (c) => {
  const user = c.get('user')
  const { eventID } = await c.req.json<{ eventID: string }>()

  if (!eventID) {
    return c.json({ message: 'eventID is required' }, 400)
  }

  const event = await db.getEventById(c.env.DB, eventID)
  if (!event) {
    return c.json({ message: 'Event not found' }, 404)
  }

  const result = await db.addEventAttendee(c.env.DB, eventID, user.id)
  if (!result.success) {
    return c.json({ message: 'Failed to register attendance', error: result.error }, 500)
  }

  const updated = await db.getEventById(c.env.DB, eventID)
  return c.json({
    message: 'Successfully registered for event',
    peopleAttending: updated?.people_attending ?? event.people_attending + 1,
  })
})

app.post('/unattendEvent', authMiddleware, async (c) => {
  const user = c.get('user')
  const { eventID } = await c.req.json<{ eventID: string }>()

  if (!eventID) {
    return c.json({ message: 'eventID is required' }, 400)
  }

  const event = await db.getEventById(c.env.DB, eventID)
  if (!event) {
    return c.json({ message: 'Event not found' }, 404)
  }

  const result = await db.removeEventAttendee(c.env.DB, eventID, user.id)
  if (!result.success) {
    return c.json({ message: 'Failed to remove attendance', error: result.error }, 500)
  }

  const updated = await db.getEventById(c.env.DB, eventID)
  return c.json({
    message: 'Successfully unregistered from event',
    peopleAttending: updated?.people_attending ?? Math.max(0, event.people_attending - 1),
  })
})

app.post('/fetchEventsByCenter', cacheControl(30), async (c) => {
  const { centerID } = await c.req.json<{ centerID: string }>()
  const events = await db.getEventsByCenterId(c.env.DB, centerID)
  return c.json({
    message: 'Success',
    events: events.map(eventRowToApi),
  })
})

// ══════════════════════════════════════════════════════════════════════
// PROFILE IMAGE ROUTES
// ══════════════════════════════════════════════════════════════════════

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
app.post('/profile/uploadImage', authMiddleware, async (c) => {
  const user = c.get('user')

  // Parse multipart form data
  const body = await c.req.parseBody()
  const file = body['file']

  // Validate file
  if (!(file instanceof File)) {
    return c.json({ message: 'No file uploaded' }, 400)
  }

  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return c.json(
      { message: 'Unsupported file type. Allowed types are JPEG, PNG, GIF, WebP, HEIC' },
      400
    )
  }

  // Validate file size (max 5MB)
  if (file.size > MAX_FILE_SIZE) {
    return c.json({ message: 'File size exceeds 5MB limit' }, 400)
  }

  // Generate unique filename
  const ext = file.name.split('.').pop() || 'jpg'
  const key = `avatars/${user.id}/${crypto.randomUUID()}.${ext}`

  // Upload to R2
  await c.env.AVATARS.put(key, file.stream(), {
    httpMetadata: { contentType: file.type },
    customMetadata: {
      userId: user.id,
      originalFileName: file.name,
    },
  })

  const baseUrl = 'https://avatars.chinmayajanata.org/avatars'
  const url = `${baseUrl}/${key}`

  // Update user profile with new image URL
  await db.updateUser(c.env.DB, user.id, {
    profile_image: url,
  })

  return c.json({ message: 'Profile image uploaded successfully', imageUrl: url })
})

// ── Fun route ─────────────────────────────────────────────────────────

app.post('/brewCoffee', (c) => {
  return c.json(
    {
      message:
        'This server is a teapot, and cannot brew coffee. It not just cannot, but it will not. How dare you disgrace this server with a request to brew coffee? This is a server that brews tea. Masala Chai >>> Filter Coffee.',
    },
    418
  )
})

// ── Tier calculation ──────────────────────────────────────────────────

function calculateTier(endorsers: UserRow[], attendeeCount: number): number {
  let tier = 0
  let brahmachariAndAbove = 0

  for (const endorser of endorsers) {
    tier += endorser.points * endorser.verification_level
    if (endorser.verification_level >= BRAHMACHARI) {
      brahmachariAndAbove++
    }
  }

  tier += attendeeCount * NORMAL_USER
  tier *= brahmachariAndAbove + 1
  tier = Math.floor(tier / TIER_DESCALE)

  return tier
}

// ── Default export ────────────────────────────────────────────────────

export default app
