/**
 * types.ts
 *
 * Om Sri Chinmaya Sadgurave Namaha. Om Sri Gurubyo Namaha.
 *
 * Shared TypeScript types for the Chinmaya Janata backend.
 */

// ── Cloudflare bindings ────────────────────────────────────────────────

export interface Env {
  DB: D1Database
  JWT_SECRET: string
  JWT_REFRESH_SECRET?: string
}

// ── Database row types (mirrors D1 schema) ────────────────────────────

export interface UserRow {
  id: string
  username: string
  password: string
  email: string | null
  first_name: string
  last_name: string
  date_of_birth: string | null
  phone_number: string | null
  profile_image: string | null
  center_id: string | null
  points: number
  is_verified: number // 0 | 1
  verification_level: number
  is_active: number // 0 | 1
  profile_complete: number // 0 | 1
  interests: string | null // JSON array
  created_at: string
  updated_at: string
}

export interface CenterRow {
  id: string
  name: string
  latitude: number
  longitude: number
  address: string | null
  member_count: number
  is_verified: number // 0 | 1
  created_at: string
  updated_at: string
}

export interface EventRow {
  id: string
  title: string
  description: string
  date: string
  latitude: number
  longitude: number
  address: string | null
  center_id: string | null
  tier: number
  people_attending: number
  point_of_contact: string | null
  image: string | null
  category: number | null
  created_at: string
  updated_at: string
}

export interface EventAttendeeRow {
  event_id: string
  user_id: string
  created_at: string
}

export interface EventEndorserRow {
  event_id: string
  user_id: string
  created_at: string
}

// ── API response types ────────────────────────────────────────────────

export type SafeUser = Omit<UserRow, 'password'>

export interface UserApiResponse {
  id: string
  username: string
  email: string | null
  firstName: string
  lastName: string
  dateOfBirth: string | null
  phoneNumber: string | null
  profileImage: string | null
  centerID: string | null
  points: number
  isVerified: boolean
  verificationLevel: number
  isActive: boolean
  profileComplete: boolean
  interests: string[] | null
  createdAt: string
  updatedAt: string
}

export interface CenterApiResponse {
  centerID: string
  name: string
  latitude: number
  longitude: number
  address: string | null
  memberCount: number
  isVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface EventApiResponse {
  eventID: string
  title: string
  description: string
  date: string
  latitude: number
  longitude: number
  address: string | null
  centerID: string | null
  tier: number
  peopleAttending: number
  pointOfContact: string | null
  image: string | null
  category: number | null
  createdAt: string
  updatedAt: string
}

// ── Utility helpers ───────────────────────────────────────────────────

function safeParseJsonArray(value: string | null): string[] | null {
  if (!value) return null
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

// ── Serialization helpers ─────────────────────────────────────────────

export function userRowToApi(row: UserRow): UserApiResponse {
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    dateOfBirth: row.date_of_birth,
    phoneNumber: row.phone_number,
    profileImage: row.profile_image,
    centerID: row.center_id,
    points: row.points,
    isVerified: row.is_verified === 1,
    verificationLevel: row.verification_level,
    isActive: row.is_active === 1,
    profileComplete: row.profile_complete === 1,
    interests: safeParseJsonArray(row.interests),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function centerRowToApi(row: CenterRow): CenterApiResponse {
  return {
    centerID: row.id,
    name: row.name,
    latitude: row.latitude,
    longitude: row.longitude,
    address: row.address,
    memberCount: row.member_count,
    isVerified: row.is_verified === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function eventRowToApi(row: EventRow): EventApiResponse {
  return {
    eventID: row.id,
    title: row.title,
    description: row.description,
    date: row.date,
    latitude: row.latitude,
    longitude: row.longitude,
    address: row.address,
    centerID: row.center_id,
    tier: row.tier,
    peopleAttending: row.people_attending,
    pointOfContact: row.point_of_contact,
    image: row.image,
    category: row.category,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

/**
 * Strips the password from a UserRow for safe API responses.
 */
export function sanitizeUser(row: UserRow): SafeUser {
  const { password: _, ...safe } = row
  return safe
}
