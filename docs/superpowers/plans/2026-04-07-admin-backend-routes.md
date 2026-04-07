# Admin Backend Routes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add admin-only API endpoints (`/api/admin/*`) for listing, searching, and managing users, centers, and events from the admin dashboard.

**Architecture:** New admin route group with shared `adminMiddleware` (auth + isAdmin check). New DB query functions for paginated/searchable lists. All admin routes return consistent JSON with `{ data, total, limit, offset }` for lists. No new tables — uses `verificationLevel >= 107` for admin checks.

**Tech Stack:** Hono (Cloudflare Workers), D1 (SQLite), Vitest with `@cloudflare/vitest-pool-workers`

---

### Task 1: Add `adminMiddleware` helper

**Files:**
- Modify: `packages/backend/src/app.ts:40-42` (add adminMiddleware next to existing isAdmin)

- [ ] **Step 1: Write the failing test**

In `packages/backend/src/__tests__/app.test.ts`, add a new describe block after the existing test sections:

```typescript
// ═══════════════════════════════════════════════════════════════════════
// ADMIN ROUTES
// ═══════════════════════════════════════════════════════════════════════

describe('Admin middleware', () => {
  it('rejects unauthenticated requests to /api/admin/*', async () => {
    const { res, body } = await fetchJSON('/api/admin/stats')
    expect(res.status).toBe(401)
    expect(body.message).toBe('Authorization header missing')
  })

  it('rejects non-admin users', async () => {
    const { token } = await registerAndLogin('regularuser', 'password123')
    const { res, body } = await fetchJSON('/api/admin/stats', {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status).toBe(403)
    expect(body.message).toBe('Admin access required')
  })

  it('allows admin users', async () => {
    const adminToken = await createAdmin()
    const { res } = await fetchJSON('/api/admin/stats', {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    expect(res.status).toBe(200)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/backend && npx vitest run src/__tests__/app.test.ts -t "Admin middleware"`
Expected: FAIL — `/api/admin/stats` returns 404

- [ ] **Step 3: Add adminMiddleware and stats route**

In `packages/backend/src/app.ts`, add after the `isAdmin` function (around line 42):

```typescript
// ── Admin middleware — chains auth + admin check ─────────────────────

async function adminMiddleware(c: any, next: () => Promise<void>): Promise<Response | void> {
  // First run auth
  const authResult = await authMiddleware(c, async () => {})
  if (authResult) return authResult // auth failed, return early

  const user = c.get('user')
  if (!user || !isAdmin(user)) {
    return c.json({ message: 'Admin access required' }, 403)
  }

  await next()
}
```

Then add at the bottom of `app.ts`, before the default export:

```typescript
// ═══════════════════════════════════════════════════════════════════════
// ADMIN ROUTES
// ═══════════════════════════════════════════════════════════════════════

app.get('/admin/stats', adminMiddleware, async (c) => {
  const [users, centers, events] = await Promise.all([
    db.countUsers(c.env.DB),
    db.countCenters(c.env.DB),
    db.countEvents(c.env.DB),
  ])
  return c.json({ users, centers, events })
})
```

- [ ] **Step 4: Add count functions to db.ts**

In `packages/backend/src/db.ts`, add at the end of each section:

After the USERS section (after `deleteUser`):

```typescript
export async function countUsers(db: D1Database): Promise<number> {
  const result = await db.prepare('SELECT COUNT(*) as count FROM users').first<{ count: number }>()
  return result?.count ?? 0
}
```

After the CENTERS section (after `deleteCenter`):

```typescript
export async function countCenters(db: D1Database): Promise<number> {
  const result = await db.prepare('SELECT COUNT(*) as count FROM centers').first<{ count: number }>()
  return result?.count ?? 0
}
```

After the EVENTS section (after `deleteEvent`):

```typescript
export async function countEvents(db: D1Database): Promise<number> {
  const result = await db.prepare('SELECT COUNT(*) as count FROM events').first<{ count: number }>()
  return result?.count ?? 0
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd packages/backend && npx vitest run src/__tests__/app.test.ts -t "Admin middleware"`
Expected: PASS — all 3 assertions pass

- [ ] **Step 6: Run full test suite to check for regressions**

Run: `cd packages/backend && npx vitest run`
Expected: All existing tests still pass

- [ ] **Step 7: Commit**

```bash
git add packages/backend/src/app.ts packages/backend/src/db.ts packages/backend/src/__tests__/app.test.ts
git commit -m "feat(admin): add adminMiddleware and /admin/stats endpoint"
```

---

### Task 2: Admin list users endpoint with search and pagination

**Files:**
- Modify: `packages/backend/src/db.ts` (add `listUsers` function)
- Modify: `packages/backend/src/app.ts` (add `/admin/users` route)
- Modify: `packages/backend/src/__tests__/app.test.ts` (add tests)

- [ ] **Step 1: Write the failing tests**

Add to `packages/backend/src/__tests__/app.test.ts`:

```typescript
describe('GET /api/admin/users', () => {
  it('returns paginated user list', async () => {
    const adminToken = await createAdmin()
    await registerAndLogin('alice', 'password123')
    await registerAndLogin('bob', 'password123')

    const { res, body } = await fetchJSON('/api/admin/users?limit=10&offset=0', {
      headers: authHeader(adminToken),
    })

    expect(res.status).toBe(200)
    expect(body.total).toBe(3) // admin + alice + bob
    expect(body.data).toHaveLength(3)
    expect(body.limit).toBe(10)
    expect(body.offset).toBe(0)
    // Should not include passwords
    expect(body.data[0].password).toBeUndefined()
  })

  it('searches by username, email, first_name, last_name', async () => {
    const adminToken = await createAdmin()
    await registerAndLogin('alice_wonder', 'password123')
    await registerAndLogin('bob_builder', 'password123')

    const { body } = await fetchJSON('/api/admin/users?q=alice', {
      headers: authHeader(adminToken),
    })

    expect(body.total).toBe(1)
    expect(body.data[0].username).toBe('alice_wonder')
  })

  it('paginates with limit and offset', async () => {
    const adminToken = await createAdmin()
    await registerAndLogin('user1', 'password123')
    await registerAndLogin('user2', 'password123')
    await registerAndLogin('user3', 'password123')

    const { body } = await fetchJSON('/api/admin/users?limit=2&offset=0', {
      headers: authHeader(adminToken),
    })
    expect(body.data).toHaveLength(2)
    expect(body.total).toBe(4) // admin + 3 users

    const { body: page2 } = await fetchJSON('/api/admin/users?limit=2&offset=2', {
      headers: authHeader(adminToken),
    })
    expect(page2.data).toHaveLength(2)
  })

  it('defaults to limit=50 offset=0', async () => {
    const adminToken = await createAdmin()

    const { body } = await fetchJSON('/api/admin/users', {
      headers: authHeader(adminToken),
    })
    expect(body.limit).toBe(50)
    expect(body.offset).toBe(0)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd packages/backend && npx vitest run src/__tests__/app.test.ts -t "GET /api/admin/users"`
Expected: FAIL — 404

- [ ] **Step 3: Add `listUsers` to db.ts**

In `packages/backend/src/db.ts`, add after `countUsers`:

```typescript
export async function listUsers(
  db: D1Database,
  opts: { q?: string; limit: number; offset: number },
): Promise<{ data: UserRow[]; total: number }> {
  const { q, limit, offset } = opts

  if (q) {
    const pattern = `%${q}%`
    const countResult = await db
      .prepare(
        `SELECT COUNT(*) as count FROM users
         WHERE username LIKE ?1 OR email LIKE ?1 OR first_name LIKE ?1 OR last_name LIKE ?1`
      )
      .bind(pattern)
      .first<{ count: number }>()

    const result = await db
      .prepare(
        `SELECT * FROM users
         WHERE username LIKE ?1 OR email LIKE ?1 OR first_name LIKE ?1 OR last_name LIKE ?1
         ORDER BY created_at DESC
         LIMIT ?2 OFFSET ?3`
      )
      .bind(pattern, limit, offset)
      .all<UserRow>()

    return { data: result.results ?? [], total: countResult?.count ?? 0 }
  }

  const countResult = await db
    .prepare('SELECT COUNT(*) as count FROM users')
    .first<{ count: number }>()

  const result = await db
    .prepare('SELECT * FROM users ORDER BY created_at DESC LIMIT ?1 OFFSET ?2')
    .bind(limit, offset)
    .all<UserRow>()

  return { data: result.results ?? [], total: countResult?.count ?? 0 }
}
```

- [ ] **Step 4: Add `/admin/users` route to app.ts**

Add after the `/admin/stats` route:

```typescript
app.get('/admin/users', adminMiddleware, async (c) => {
  const url = new URL(c.req.url)
  const q = url.searchParams.get('q') || undefined
  const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') ?? '50', 10) || 50, 1), 100)
  const offset = Math.max(parseInt(url.searchParams.get('offset') ?? '0', 10) || 0, 0)

  const { data, total } = await db.listUsers(c.env.DB, { q, limit, offset })

  return c.json({
    data: data.map(userRowToApi),
    total,
    limit,
    offset,
  })
})
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd packages/backend && npx vitest run src/__tests__/app.test.ts -t "GET /api/admin/users"`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add packages/backend/src/app.ts packages/backend/src/db.ts packages/backend/src/__tests__/app.test.ts
git commit -m "feat(admin): add /admin/users endpoint with search and pagination"
```

---

### Task 3: Admin list centers endpoint with search and pagination

**Files:**
- Modify: `packages/backend/src/db.ts` (add `listCenters`)
- Modify: `packages/backend/src/app.ts` (add `/admin/centers` route)
- Modify: `packages/backend/src/__tests__/app.test.ts` (add tests)

- [ ] **Step 1: Write the failing tests**

Add to `packages/backend/src/__tests__/app.test.ts`:

```typescript
describe('GET /api/admin/centers', () => {
  it('returns paginated center list with member counts', async () => {
    const adminToken = await createAdmin()

    // Create centers
    await jsonPost('/api/addCenter', {
      centerName: 'CM San Jose',
      latitude: 37.3,
      longitude: -121.9,
      address: '1050 S White Rd',
    }, authHeader(adminToken))

    await jsonPost('/api/addCenter', {
      centerName: 'CM Houston',
      latitude: 29.7,
      longitude: -95.4,
    }, authHeader(adminToken))

    const { res, body } = await fetchJSON('/api/admin/centers?limit=10&offset=0', {
      headers: authHeader(adminToken),
    })

    expect(res.status).toBe(200)
    expect(body.total).toBe(2)
    expect(body.data).toHaveLength(2)
    expect(body.data[0].centerID).toBeDefined()
    expect(body.data[0].name).toBeDefined()
  })

  it('searches by center name, address, or acharya', async () => {
    const adminToken = await createAdmin()

    await jsonPost('/api/addCenter', {
      centerName: 'CM San Jose',
      latitude: 37.3,
      longitude: -121.9,
    }, authHeader(adminToken))

    await jsonPost('/api/addCenter', {
      centerName: 'CM Houston',
      latitude: 29.7,
      longitude: -95.4,
    }, authHeader(adminToken))

    const { body } = await fetchJSON('/api/admin/centers?q=houston', {
      headers: authHeader(adminToken),
    })

    expect(body.total).toBe(1)
    expect(body.data[0].name).toBe('CM Houston')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd packages/backend && npx vitest run src/__tests__/app.test.ts -t "GET /api/admin/centers"`
Expected: FAIL — 404

- [ ] **Step 3: Add `listCenters` to db.ts**

In `packages/backend/src/db.ts`, add after `countCenters`:

```typescript
export async function listCenters(
  db: D1Database,
  opts: { q?: string; limit: number; offset: number },
): Promise<{ data: CenterRow[]; total: number }> {
  const { q, limit, offset } = opts

  if (q) {
    const pattern = `%${q}%`
    const countResult = await db
      .prepare(
        `SELECT COUNT(*) as count FROM centers
         WHERE name LIKE ?1 OR address LIKE ?1 OR acharya LIKE ?1 OR point_of_contact LIKE ?1`
      )
      .bind(pattern)
      .first<{ count: number }>()

    const result = await db
      .prepare(
        `SELECT * FROM centers
         WHERE name LIKE ?1 OR address LIKE ?1 OR acharya LIKE ?1 OR point_of_contact LIKE ?1
         ORDER BY name ASC
         LIMIT ?2 OFFSET ?3`
      )
      .bind(pattern, limit, offset)
      .all<CenterRow>()

    return { data: result.results ?? [], total: countResult?.count ?? 0 }
  }

  const countResult = await db
    .prepare('SELECT COUNT(*) as count FROM centers')
    .first<{ count: number }>()

  const result = await db
    .prepare('SELECT * FROM centers ORDER BY name ASC LIMIT ?1 OFFSET ?2')
    .bind(limit, offset)
    .all<CenterRow>()

  return { data: result.results ?? [], total: countResult?.count ?? 0 }
}
```

- [ ] **Step 4: Add `/admin/centers` route to app.ts**

Add after the `/admin/users` route:

```typescript
app.get('/admin/centers', adminMiddleware, async (c) => {
  const url = new URL(c.req.url)
  const q = url.searchParams.get('q') || undefined
  const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') ?? '50', 10) || 50, 1), 100)
  const offset = Math.max(parseInt(url.searchParams.get('offset') ?? '0', 10) || 0, 0)

  const { data, total } = await db.listCenters(c.env.DB, { q, limit, offset })

  return c.json({
    data: data.map(centerRowToApi),
    total,
    limit,
    offset,
  })
})
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd packages/backend && npx vitest run src/__tests__/app.test.ts -t "GET /api/admin/centers"`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add packages/backend/src/app.ts packages/backend/src/db.ts packages/backend/src/__tests__/app.test.ts
git commit -m "feat(admin): add /admin/centers endpoint with search and pagination"
```

---

### Task 4: Admin list events endpoint with search and pagination

**Files:**
- Modify: `packages/backend/src/db.ts` (add `listEvents`)
- Modify: `packages/backend/src/app.ts` (add `/admin/events` route)
- Modify: `packages/backend/src/__tests__/app.test.ts` (add tests)

- [ ] **Step 1: Write the failing tests**

Add to `packages/backend/src/__tests__/app.test.ts`:

```typescript
describe('GET /api/admin/events', () => {
  it('returns paginated event list', async () => {
    const adminToken = await createAdmin()

    // Create a center first (events need a center)
    const { body: centerBody } = await jsonPost('/api/addCenter', {
      centerName: 'CM San Jose',
      latitude: 37.3,
      longitude: -121.9,
    }, authHeader(adminToken))
    const centerId = centerBody.id

    // Create events
    await jsonPost('/api/addEvent', {
      title: 'Gita Chanting',
      date: '2026-04-05T10:00:00Z',
      latitude: 37.3,
      longitude: -121.9,
      centerID: centerId,
    }, authHeader(adminToken))

    await jsonPost('/api/addEvent', {
      title: 'Youth Retreat',
      date: '2026-04-12T09:00:00Z',
      latitude: 37.3,
      longitude: -121.9,
      centerID: centerId,
    }, authHeader(adminToken))

    const { res, body } = await fetchJSON('/api/admin/events?limit=10&offset=0', {
      headers: authHeader(adminToken),
    })

    expect(res.status).toBe(200)
    expect(body.total).toBe(2)
    expect(body.data).toHaveLength(2)
    expect(body.data[0].eventID).toBeDefined()
    expect(body.data[0].title).toBeDefined()
  })

  it('searches by title, address, or description', async () => {
    const adminToken = await createAdmin()

    const { body: centerBody } = await jsonPost('/api/addCenter', {
      centerName: 'CM San Jose',
      latitude: 37.3,
      longitude: -121.9,
    }, authHeader(adminToken))

    await jsonPost('/api/addEvent', {
      title: 'Gita Chanting',
      description: 'Weekly session',
      date: '2026-04-05T10:00:00Z',
      latitude: 37.3,
      longitude: -121.9,
      centerID: centerBody.id,
    }, authHeader(adminToken))

    await jsonPost('/api/addEvent', {
      title: 'Youth Retreat',
      description: 'Annual retreat',
      date: '2026-04-12T09:00:00Z',
      latitude: 37.3,
      longitude: -121.9,
      centerID: centerBody.id,
    }, authHeader(adminToken))

    const { body } = await fetchJSON('/api/admin/events?q=gita', {
      headers: authHeader(adminToken),
    })

    expect(body.total).toBe(1)
    expect(body.data[0].title).toBe('Gita Chanting')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd packages/backend && npx vitest run src/__tests__/app.test.ts -t "GET /api/admin/events"`
Expected: FAIL — 404

- [ ] **Step 3: Add `listEvents` to db.ts**

In `packages/backend/src/db.ts`, add after `countEvents`:

```typescript
export async function listEvents(
  db: D1Database,
  opts: { q?: string; limit: number; offset: number },
): Promise<{ data: EventRow[]; total: number }> {
  const { q, limit, offset } = opts

  if (q) {
    const pattern = `%${q}%`
    const countResult = await db
      .prepare(
        `SELECT COUNT(*) as count FROM events
         WHERE title LIKE ?1 OR description LIKE ?1 OR address LIKE ?1`
      )
      .bind(pattern)
      .first<{ count: number }>()

    const result = await db
      .prepare(
        `SELECT * FROM events
         WHERE title LIKE ?1 OR description LIKE ?1 OR address LIKE ?1
         ORDER BY date DESC
         LIMIT ?2 OFFSET ?3`
      )
      .bind(pattern, limit, offset)
      .all<EventRow>()

    return { data: result.results ?? [], total: countResult?.count ?? 0 }
  }

  const countResult = await db
    .prepare('SELECT COUNT(*) as count FROM events')
    .first<{ count: number }>()

  const result = await db
    .prepare('SELECT * FROM events ORDER BY date DESC LIMIT ?1 OFFSET ?2')
    .bind(limit, offset)
    .all<EventRow>()

  return { data: result.results ?? [], total: countResult?.count ?? 0 }
}
```

- [ ] **Step 4: Add `/admin/events` route to app.ts**

Add after the `/admin/centers` route:

```typescript
app.get('/admin/events', adminMiddleware, async (c) => {
  const url = new URL(c.req.url)
  const q = url.searchParams.get('q') || undefined
  const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') ?? '50', 10) || 50, 1), 100)
  const offset = Math.max(parseInt(url.searchParams.get('offset') ?? '0', 10) || 0, 0)

  const { data, total } = await db.listEvents(c.env.DB, { q, limit, offset })

  return c.json({
    data: data.map(eventRowToApi),
    total,
    limit,
    offset,
  })
})
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd packages/backend && npx vitest run src/__tests__/app.test.ts -t "GET /api/admin/events"`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add packages/backend/src/app.ts packages/backend/src/db.ts packages/backend/src/__tests__/app.test.ts
git commit -m "feat(admin): add /admin/events endpoint with search and pagination"
```

---

### Task 5: Admin center actions (edit, toggle verify, delete)

**Files:**
- Modify: `packages/backend/src/app.ts` (add PUT/POST/DELETE routes)
- Modify: `packages/backend/src/__tests__/app.test.ts` (add tests)

- [ ] **Step 1: Write the failing tests**

Add to `packages/backend/src/__tests__/app.test.ts`:

```typescript
describe('Admin center actions', () => {
  async function createTestCenter(adminToken: string) {
    const { body } = await jsonPost('/api/addCenter', {
      centerName: 'CM Test',
      latitude: 37.3,
      longitude: -121.9,
      address: '123 Test St',
    }, authHeader(adminToken))
    return body.id
  }

  it('PUT /api/admin/centers/:id updates center details', async () => {
    const adminToken = await createAdmin()
    const centerId = await createTestCenter(adminToken)

    const { res, body } = await jsonPut(`/api/admin/centers/${centerId}`, {
      name: 'CM San Jose Updated',
      phone: '555-1234',
    }, authHeader(adminToken))

    expect(res.status).toBe(200)
    expect(body.message).toBe('Center updated')

    // Verify the update
    const { body: fetched } = await jsonPost('/api/fetchCenter', { centerID: centerId })
    expect(fetched.center.name).toBe('CM San Jose Updated')
    expect(fetched.center.phone).toBe('555-1234')
  })

  it('POST /api/admin/centers/:id/verify toggles verification', async () => {
    const adminToken = await createAdmin()
    const centerId = await createTestCenter(adminToken)

    // Verify
    const { res } = await jsonPost(`/api/admin/centers/${centerId}/verify`, {}, authHeader(adminToken))
    expect(res.status).toBe(200)

    const { body: fetched } = await jsonPost('/api/fetchCenter', { centerID: centerId })
    expect(fetched.center.isVerified).toBe(true)

    // Unverify
    await jsonPost(`/api/admin/centers/${centerId}/verify`, {}, authHeader(adminToken))
    const { body: fetched2 } = await jsonPost('/api/fetchCenter', { centerID: centerId })
    expect(fetched2.center.isVerified).toBe(false)
  })

  it('DELETE /api/admin/centers/:id deletes center', async () => {
    const adminToken = await createAdmin()
    const centerId = await createTestCenter(adminToken)

    const { res } = await fetchJSON(`/api/admin/centers/${centerId}`, {
      method: 'DELETE',
      headers: authHeader(adminToken),
    })
    expect(res.status).toBe(200)

    const { res: fetchRes } = await jsonPost('/api/fetchCenter', { centerID: centerId })
    expect(fetchRes.status).toBe(404)
  })

  it('returns 404 for non-existent center', async () => {
    const adminToken = await createAdmin()

    const { res } = await jsonPut('/api/admin/centers/nonexistent', {
      name: 'test',
    }, authHeader(adminToken))
    expect(res.status).toBe(404)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd packages/backend && npx vitest run src/__tests__/app.test.ts -t "Admin center actions"`
Expected: FAIL — 404

- [ ] **Step 3: Add center action routes to app.ts**

Add after the `/admin/centers` GET route:

```typescript
app.put('/admin/centers/:id', adminMiddleware, async (c) => {
  const centerId = c.req.param('id')
  const center = await db.getCenterById(c.env.DB, centerId)
  if (!center) {
    return c.json({ message: 'Center not found' }, 404)
  }

  const body = await c.req.json<{
    name?: string
    address?: string
    website?: string
    phone?: string
    image?: string
    acharya?: string
    pointOfContact?: string
  }>()

  const updates: Partial<CenterRow> = {}
  if (body.name !== undefined) updates.name = body.name
  if (body.address !== undefined) updates.address = body.address || null
  if (body.website !== undefined) updates.website = body.website || null
  if (body.phone !== undefined) updates.phone = body.phone || null
  if (body.image !== undefined) updates.image = body.image || null
  if (body.acharya !== undefined) updates.acharya = body.acharya || null
  if (body.pointOfContact !== undefined) updates.point_of_contact = body.pointOfContact || null

  const result = await db.updateCenter(c.env.DB, centerId, updates)
  if (result.success) {
    return c.json({ message: 'Center updated' })
  }
  return c.json({ message: 'Update failed', error: result.error }, 500)
})

app.post('/admin/centers/:id/verify', adminMiddleware, async (c) => {
  const centerId = c.req.param('id')
  const center = await db.getCenterById(c.env.DB, centerId)
  if (!center) {
    return c.json({ message: 'Center not found' }, 404)
  }

  const newVerified = center.is_verified === 1 ? 0 : 1
  const result = await db.updateCenter(c.env.DB, centerId, { is_verified: newVerified })
  if (result.success) {
    return c.json({ message: newVerified ? 'Center verified' : 'Center unverified', isVerified: newVerified === 1 })
  }
  return c.json({ message: 'Update failed' }, 500)
})

app.delete('/admin/centers/:id', adminMiddleware, async (c) => {
  const centerId = c.req.param('id')
  const center = await db.getCenterById(c.env.DB, centerId)
  if (!center) {
    return c.json({ message: 'Center not found' }, 404)
  }

  const result = await db.deleteCenter(c.env.DB, centerId)
  if (result.success) {
    return c.json({ message: 'Center deleted' })
  }
  return c.json({ message: 'Delete failed' }, 500)
})
```

Note: You'll need to add the `CenterRow` import to the existing imports at the top of `app.ts`. The type is already imported via `types.ts` — check that `CenterRow` is in the import statement. If not, add it:

```typescript
import type { Env, UserRow, EventRow, CenterRow } from './types'
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd packages/backend && npx vitest run src/__tests__/app.test.ts -t "Admin center actions"`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/backend/src/app.ts packages/backend/src/__tests__/app.test.ts
git commit -m "feat(admin): add center edit, verify toggle, and delete endpoints"
```

---

### Task 6: Admin event actions (edit, delete)

**Files:**
- Modify: `packages/backend/src/app.ts` (add PUT/DELETE routes)
- Modify: `packages/backend/src/__tests__/app.test.ts` (add tests)

- [ ] **Step 1: Write the failing tests**

Add to `packages/backend/src/__tests__/app.test.ts`:

```typescript
describe('Admin event actions', () => {
  async function createTestEvent(adminToken: string) {
    const { body: centerBody } = await jsonPost('/api/addCenter', {
      centerName: 'CM Test',
      latitude: 37.3,
      longitude: -121.9,
    }, authHeader(adminToken))

    const { body: eventBody } = await jsonPost('/api/addEvent', {
      title: 'Test Event',
      date: '2026-04-05T10:00:00Z',
      latitude: 37.3,
      longitude: -121.9,
      centerID: centerBody.id,
      description: 'Original description',
    }, authHeader(adminToken))

    return { eventId: eventBody.id, centerId: centerBody.id }
  }

  it('PUT /api/admin/events/:id updates event details', async () => {
    const adminToken = await createAdmin()
    const { eventId } = await createTestEvent(adminToken)

    const { res, body } = await jsonPut(`/api/admin/events/${eventId}`, {
      title: 'Updated Event',
      description: 'New description',
    }, authHeader(adminToken))

    expect(res.status).toBe(200)
    expect(body.message).toBe('Event updated')

    const { body: fetched } = await jsonPost('/api/fetchEvent', { id: eventId })
    expect(fetched.event.title).toBe('Updated Event')
    expect(fetched.event.description).toBe('New description')
  })

  it('DELETE /api/admin/events/:id deletes event', async () => {
    const adminToken = await createAdmin()
    const { eventId } = await createTestEvent(adminToken)

    const { res } = await fetchJSON(`/api/admin/events/${eventId}`, {
      method: 'DELETE',
      headers: authHeader(adminToken),
    })
    expect(res.status).toBe(200)

    const { res: fetchRes } = await jsonPost('/api/fetchEvent', { id: eventId })
    expect(fetchRes.status).toBe(404)
  })

  it('returns 404 for non-existent event', async () => {
    const adminToken = await createAdmin()
    const { res } = await jsonPut('/api/admin/events/nonexistent', {
      title: 'test',
    }, authHeader(adminToken))
    expect(res.status).toBe(404)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd packages/backend && npx vitest run src/__tests__/app.test.ts -t "Admin event actions"`
Expected: FAIL — 404

- [ ] **Step 3: Add event action routes to app.ts**

Add after the admin center routes:

```typescript
app.put('/admin/events/:id', adminMiddleware, async (c) => {
  const eventId = c.req.param('id')
  const event = await db.getEventById(c.env.DB, eventId)
  if (!event) {
    return c.json({ message: 'Event not found' }, 404)
  }

  const body = await c.req.json<{
    title?: string
    description?: string
    date?: string
    address?: string
    pointOfContact?: string
    image?: string
    category?: number
  }>()

  const updates: Partial<EventRow> = {}
  if (body.title !== undefined) updates.title = body.title
  if (body.description !== undefined) updates.description = body.description
  if (body.date !== undefined) updates.date = body.date
  if (body.address !== undefined) updates.address = body.address || null
  if (body.pointOfContact !== undefined) updates.point_of_contact = body.pointOfContact || null
  if (body.image !== undefined) updates.image = body.image || null
  if (body.category !== undefined) updates.category = body.category

  const result = await db.updateEvent(c.env.DB, eventId, updates)
  if (result.success) {
    return c.json({ message: 'Event updated' })
  }
  return c.json({ message: 'Update failed', error: result.error }, 500)
})

app.delete('/admin/events/:id', adminMiddleware, async (c) => {
  const eventId = c.req.param('id')
  const event = await db.getEventById(c.env.DB, eventId)
  if (!event) {
    return c.json({ message: 'Event not found' }, 404)
  }

  const result = await db.deleteEvent(c.env.DB, eventId)
  if (result.success) {
    return c.json({ message: 'Event deleted' })
  }
  return c.json({ message: 'Delete failed' }, 500)
})
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd packages/backend && npx vitest run src/__tests__/app.test.ts -t "Admin event actions"`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/backend/src/app.ts packages/backend/src/__tests__/app.test.ts
git commit -m "feat(admin): add event edit and delete endpoints"
```

---

### Task 7: Admin user actions (verify toggle, delete)

**Files:**
- Modify: `packages/backend/src/app.ts` (add routes)
- Modify: `packages/backend/src/__tests__/app.test.ts` (add tests)

- [ ] **Step 1: Write the failing tests**

Add to `packages/backend/src/__tests__/app.test.ts`:

```typescript
describe('Admin user actions', () => {
  it('POST /api/admin/users/:id/verify toggles user verification', async () => {
    const adminToken = await createAdmin()
    const { user } = await registerAndLogin('testuser', 'password123')

    // Verify the user
    const { res, body } = await jsonPost(`/api/admin/users/${user.id}/verify`, {
      verificationLevel: 54,
    }, authHeader(adminToken))
    expect(res.status).toBe(200)
    expect(body.isVerified).toBe(true)

    // Unverify the user
    const { body: body2 } = await jsonPost(`/api/admin/users/${user.id}/verify`, {
      verificationLevel: 45,
      isVerified: false,
    }, authHeader(adminToken))
    expect(body2.isVerified).toBe(false)
  })

  it('DELETE /api/admin/users/:id deletes user', async () => {
    const adminToken = await createAdmin()
    const { user } = await registerAndLogin('deleteuser', 'password123')

    const { res } = await fetchJSON(`/api/admin/users/${user.id}`, {
      method: 'DELETE',
      headers: authHeader(adminToken),
    })
    expect(res.status).toBe(200)

    // Verify user is gone
    const { body } = await jsonPost('/api/userExistence', { username: 'deleteuser' })
    expect(body.existence).toBe(false)
  })

  it('returns 404 for non-existent user', async () => {
    const adminToken = await createAdmin()
    const { res } = await jsonPost('/api/admin/users/nonexistent/verify', {
      verificationLevel: 54,
    }, authHeader(adminToken))
    expect(res.status).toBe(404)
  })

  it('prevents admin from deleting themselves', async () => {
    const adminToken = await createAdmin()

    // Get admin user ID
    const { body: verifyBody } = await fetchJSON('/api/auth/verify', {
      headers: authHeader(adminToken),
    })
    const adminId = verifyBody.user.id

    const { res, body } = await fetchJSON(`/api/admin/users/${adminId}`, {
      method: 'DELETE',
      headers: authHeader(adminToken),
    })
    expect(res.status).toBe(400)
    expect(body.message).toBe('Cannot delete your own account from admin panel')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd packages/backend && npx vitest run src/__tests__/app.test.ts -t "Admin user actions"`
Expected: FAIL — 404

- [ ] **Step 3: Add user action routes to app.ts**

Add after the admin event routes:

```typescript
app.post('/admin/users/:id/verify', adminMiddleware, async (c) => {
  const userId = c.req.param('id')
  const targetUser = await db.getUserById(c.env.DB, userId)
  if (!targetUser) {
    return c.json({ message: 'User not found' }, 404)
  }

  const body = await c.req.json<{
    verificationLevel?: number
    isVerified?: boolean
  }>()

  const updates: Partial<UserRow> = {}

  if (body.isVerified === false) {
    updates.is_verified = 0
    updates.verification_level = body.verificationLevel ?? NORMAL_USER
  } else {
    updates.is_verified = 1
    updates.verification_level = body.verificationLevel ?? targetUser.verification_level
  }

  const result = await db.updateUser(c.env.DB, userId, updates)
  if (result.success) {
    return c.json({
      message: updates.is_verified ? 'User verified' : 'User unverified',
      isVerified: updates.is_verified === 1,
    })
  }
  return c.json({ message: 'Update failed' }, 500)
})

app.delete('/admin/users/:id', adminMiddleware, async (c) => {
  const userId = c.req.param('id')
  const adminUser = c.get('user')

  if (adminUser.id === userId) {
    return c.json({ message: 'Cannot delete your own account from admin panel' }, 400)
  }

  const targetUser = await db.getUserById(c.env.DB, userId)
  if (!targetUser) {
    return c.json({ message: 'User not found' }, 404)
  }

  const result = await db.deleteUser(c.env.DB, userId)
  if (result.success) {
    return c.json({ message: 'User deleted' })
  }
  return c.json({ message: 'Delete failed' }, 500)
})
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd packages/backend && npx vitest run src/__tests__/app.test.ts -t "Admin user actions"`
Expected: PASS

- [ ] **Step 5: Run full test suite**

Run: `cd packages/backend && npx vitest run`
Expected: All tests pass

- [ ] **Step 6: Commit**

```bash
git add packages/backend/src/app.ts packages/backend/src/__tests__/app.test.ts
git commit -m "feat(admin): add user verify toggle and delete endpoints"
```

---

### Task 8: Admin center members list

**Files:**
- Modify: `packages/backend/src/db.ts` (add `getCenterMembers`)
- Modify: `packages/backend/src/app.ts` (add route)
- Modify: `packages/backend/src/__tests__/app.test.ts` (add tests)

- [ ] **Step 1: Write the failing test**

Add to `packages/backend/src/__tests__/app.test.ts`:

```typescript
describe('GET /api/admin/centers/:id/members', () => {
  it('returns users belonging to a center', async () => {
    const adminToken = await createAdmin()

    // Create center
    const { body: centerBody } = await jsonPost('/api/addCenter', {
      centerName: 'CM Test',
      latitude: 37.3,
      longitude: -121.9,
    }, authHeader(adminToken))
    const centerId = centerBody.id

    // Create a user and assign them to the center
    const { token: userToken, user } = await registerAndLogin('member1', 'password123')
    await jsonPut('/api/auth/update-profile', {
      centerID: centerId,
    }, authHeader(userToken))

    const { res, body } = await fetchJSON(`/api/admin/centers/${centerId}/members`, {
      headers: authHeader(adminToken),
    })

    expect(res.status).toBe(200)
    expect(body.data.length).toBeGreaterThanOrEqual(1)
    expect(body.data.some((u: any) => u.username === 'member1')).toBe(true)
  })

  it('returns 404 for non-existent center', async () => {
    const adminToken = await createAdmin()
    const { res } = await fetchJSON('/api/admin/centers/nonexistent/members', {
      headers: authHeader(adminToken),
    })
    expect(res.status).toBe(404)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/backend && npx vitest run src/__tests__/app.test.ts -t "GET /api/admin/centers"`
Expected: FAIL — 404

- [ ] **Step 3: Add `getCenterMembers` to db.ts**

In `packages/backend/src/db.ts`, add after `listCenters`:

```typescript
export async function getCenterMembers(
  db: D1Database,
  centerId: string,
): Promise<UserRow[]> {
  const result = await db
    .prepare('SELECT * FROM users WHERE center_id = ?1 ORDER BY created_at DESC')
    .bind(centerId)
    .all<UserRow>()
  return result.results ?? []
}
```

- [ ] **Step 4: Add route to app.ts**

Add after the center DELETE route:

```typescript
app.get('/admin/centers/:id/members', adminMiddleware, async (c) => {
  const centerId = c.req.param('id')
  const center = await db.getCenterById(c.env.DB, centerId)
  if (!center) {
    return c.json({ message: 'Center not found' }, 404)
  }

  const members = await db.getCenterMembers(c.env.DB, centerId)
  return c.json({ data: members.map(userRowToApi) })
})
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd packages/backend && npx vitest run src/__tests__/app.test.ts -t "GET /api/admin/centers"`
Expected: PASS

- [ ] **Step 6: Run full test suite and commit**

Run: `cd packages/backend && npx vitest run`
Expected: All tests pass

```bash
git add packages/backend/src/app.ts packages/backend/src/db.ts packages/backend/src/__tests__/app.test.ts
git commit -m "feat(admin): add center members list endpoint"
```

---

### Task 9: Final integration test and cleanup

**Files:**
- Modify: `packages/backend/src/__tests__/app.test.ts` (add integration test)

- [ ] **Step 1: Write an end-to-end admin workflow test**

Add to `packages/backend/src/__tests__/app.test.ts`:

```typescript
describe('Admin end-to-end workflow', () => {
  it('full admin lifecycle: list, create, edit, verify, delete', async () => {
    const adminToken = await createAdmin()

    // 1. Check stats — start empty (just admin user)
    const { body: stats } = await fetchJSON('/api/admin/stats', {
      headers: authHeader(adminToken),
    })
    expect(stats.users).toBe(1)
    expect(stats.centers).toBe(0)
    expect(stats.events).toBe(0)

    // 2. Create a center, verify it appears in admin list
    await jsonPost('/api/addCenter', {
      centerName: 'CM Test Center',
      latitude: 37.3,
      longitude: -121.9,
    }, authHeader(adminToken))

    const { body: centerList } = await fetchJSON('/api/admin/centers', {
      headers: authHeader(adminToken),
    })
    expect(centerList.total).toBe(1)
    const centerId = centerList.data[0].centerID

    // 3. Verify the center
    await jsonPost(`/api/admin/centers/${centerId}/verify`, {}, authHeader(adminToken))
    const { body: centerAfterVerify } = await fetchJSON('/api/admin/centers', {
      headers: authHeader(adminToken),
    })
    expect(centerAfterVerify.data[0].isVerified).toBe(true)

    // 4. Create an event, verify in admin list
    await jsonPost('/api/addEvent', {
      title: 'Test Event',
      date: '2026-04-05T10:00:00Z',
      latitude: 37.3,
      longitude: -121.9,
      centerID: centerId,
    }, authHeader(adminToken))

    const { body: eventList } = await fetchJSON('/api/admin/events', {
      headers: authHeader(adminToken),
    })
    expect(eventList.total).toBe(1)

    // 5. Stats should reflect the new data
    const { body: stats2 } = await fetchJSON('/api/admin/stats', {
      headers: authHeader(adminToken),
    })
    expect(stats2.centers).toBe(1)
    expect(stats2.events).toBe(1)
  })
})
```

- [ ] **Step 2: Run full test suite**

Run: `cd packages/backend && npx vitest run`
Expected: ALL tests pass

- [ ] **Step 3: Commit**

```bash
git add packages/backend/src/__tests__/app.test.ts
git commit -m "test(admin): add end-to-end admin workflow integration test"
```
