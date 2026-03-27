import { beforeEach, describe, expect, it } from 'vitest'
import { env } from 'cloudflare:test'
import { applyMigration, dropAllTables } from '../setup'
import * as db from '../../db'

describe('Event DB (D1)', () => {
  beforeEach(async () => {
    await dropAllTables()
    await applyMigration()
  })

  it('createEvent inserts a new event', async () => {
    await db.createCenter(env.DB, {
      id: 'center-1',
      name: 'Center One',
      latitude: 37.0,
      longitude: -121.0,
    })

    const result = await db.createEvent(env.DB, {
      id: 'event-1',
      title: 'Test Event',
      date: '2026-06-01T10:00:00Z',
      latitude: 37.1,
      longitude: -121.1,
      center_id: 'center-1',
    })

    expect(result.success).toBe(true)
    expect(result.eventID).toBe('event-1')
  })

  it('getEventById returns inserted event', async () => {
    await db.createCenter(env.DB, {
      id: 'center-2',
      name: 'Center Two',
      latitude: 40.0,
      longitude: -120.0,
    })

    await db.createEvent(env.DB, {
      id: 'event-2',
      title: 'Lookup Event',
      date: '2026-07-01T10:00:00Z',
      latitude: 40.1,
      longitude: -120.1,
      center_id: 'center-2',
    })

    const found = await db.getEventById(env.DB, 'event-2')

    expect(found).not.toBeNull()
    expect(found?.id).toBe('event-2')
    expect(found?.title).toBe('Lookup Event')
  })
})
