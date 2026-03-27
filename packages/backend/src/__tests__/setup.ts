/**
 * setup.ts
 *
 * Test setup: applies D1 migrations before each test suite.
 */
import {
  env,
  createExecutionContext,
  waitOnExecutionContext,
} from 'cloudflare:test'

const MIGRATION = `
CREATE TABLE IF NOT EXISTS users (
  id              TEXT PRIMARY KEY,
  username        TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password        TEXT NOT NULL,
  email           TEXT COLLATE NOCASE,
  first_name      TEXT NOT NULL DEFAULT '',
  last_name       TEXT NOT NULL DEFAULT '',
  date_of_birth   TEXT,
  phone_number    TEXT,
  profile_image   TEXT,
  bio             TEXT,
  center_id       TEXT REFERENCES centers(id) ON DELETE SET NULL,
  points          INTEGER NOT NULL DEFAULT 0,
  is_verified     INTEGER NOT NULL DEFAULT 0,
  verification_level INTEGER NOT NULL DEFAULT 45,
  is_active       INTEGER NOT NULL DEFAULT 0,
  profile_complete INTEGER NOT NULL DEFAULT 0,
  interests       TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_center   ON users(center_id);

CREATE TABLE IF NOT EXISTS centers (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  latitude        REAL NOT NULL DEFAULT 0,
  longitude       REAL NOT NULL DEFAULT 0,
  address         TEXT,
  website         TEXT,
  phone           TEXT,
  image           TEXT,
  acharya         TEXT,
  point_of_contact TEXT,
  member_count    INTEGER NOT NULL DEFAULT 0,
  is_verified     INTEGER NOT NULL DEFAULT 0,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_centers_name ON centers(name);

CREATE TABLE IF NOT EXISTS events (
  id              TEXT PRIMARY KEY,
  title           TEXT NOT NULL DEFAULT '',
  description     TEXT NOT NULL DEFAULT '',
  date            TEXT NOT NULL,
  latitude        REAL NOT NULL DEFAULT 0,
  longitude       REAL NOT NULL DEFAULT 0,
  address         TEXT,
  center_id       TEXT REFERENCES centers(id) ON DELETE SET NULL,
  tier            INTEGER NOT NULL DEFAULT 0,
  people_attending INTEGER NOT NULL DEFAULT 0,
  point_of_contact TEXT,
  image           TEXT,
  category        INTEGER,
  created_by      TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_events_center ON events(center_id);
CREATE INDEX IF NOT EXISTS idx_events_date   ON events(date);

CREATE TABLE IF NOT EXISTS event_attendees (
  event_id        TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id         TEXT NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (event_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_ea_user  ON event_attendees(user_id);
CREATE INDEX IF NOT EXISTS idx_ea_event ON event_attendees(event_id);

CREATE TABLE IF NOT EXISTS event_endorsers (
  event_id        TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id         TEXT NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (event_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_ee_user  ON event_endorsers(user_id);
CREATE INDEX IF NOT EXISTS idx_ee_event ON event_endorsers(event_id);
`

/**
 * Run the D1 migration. Call this in beforeAll() or beforeEach().
 */
export async function applyMigration(): Promise<void> {
  const db = env.DB
  const statements = MIGRATION.split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)

  for (const stmt of statements) {
    await db.prepare(stmt).run()
  }
}

/**
 * Drop all tables. Call this in afterEach() for clean isolation.
 */
export async function dropAllTables(): Promise<void> {
  const db = env.DB
  const tables = [
    'event_endorsers',
    'event_attendees',
    'events',
    'users',
    'centers',
  ]
  for (const table of tables) {
    await db.prepare(`DROP TABLE IF EXISTS ${table}`).run()
  }
}

/**
 * Helper: make a request to the Hono app with proper env bindings.
 */
export function makeRequest(
  path: string,
  init?: RequestInit,
): Request {
  return new Request(`http://localhost${path}`, init)
}
