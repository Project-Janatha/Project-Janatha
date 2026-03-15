/**
 * auth.test.ts — Unit tests for authentication utilities
 *
 * Tests PBKDF2 password hashing/verification, JWT token generation/verification,
 * legacy bcrypt detection, and timing-safe comparison.
 */
import { describe, it, expect } from 'vitest'
import {
  hashPassword,
  verifyPassword,
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
} from '../auth'

const TEST_SECRET = 'test-jwt-secret-for-testing-only'
const TEST_REFRESH_SECRET = 'test-jwt-refresh-secret-for-testing-only'

const testUser = { id: 'u-test-1', username: 'testuser' }

// ═══════════════════════════════════════════════════════════════════════
// PASSWORD HASHING (PBKDF2)
// ═══════════════════════════════════════════════════════════════════════

describe('hashPassword', () => {
  it('returns a string in the format iterations:salt:hash', async () => {
    const hashed = await hashPassword('mypassword')
    const parts = hashed.split(':')
    expect(parts).toHaveLength(3)
    expect(parts[0]).toBe('100000')
    // salt and hash should be non-empty base64 strings
    expect(parts[1].length).toBeGreaterThan(0)
    expect(parts[2].length).toBeGreaterThan(0)
  })

  it('produces different hashes for the same password (random salt)', async () => {
    const hash1 = await hashPassword('samepassword')
    const hash2 = await hashPassword('samepassword')
    expect(hash1).not.toBe(hash2)
  })

  it('produces different hashes for different passwords', async () => {
    const hash1 = await hashPassword('password1')
    const hash2 = await hashPassword('password2')
    expect(hash1).not.toBe(hash2)
  })
})

// ═══════════════════════════════════════════════════════════════════════
// PASSWORD VERIFICATION
// ═══════════════════════════════════════════════════════════════════════

describe('verifyPassword', () => {
  it('returns true for a correct password', async () => {
    const hashed = await hashPassword('correctpassword')
    const result = await verifyPassword('correctpassword', hashed)
    expect(result).toBe(true)
  })

  it('returns false for an incorrect password', async () => {
    const hashed = await hashPassword('correctpassword')
    const result = await verifyPassword('wrongpassword', hashed)
    expect(result).toBe(false)
  })

  it('returns false for legacy bcrypt hashes (starting with $2)', async () => {
    const bcryptHash = '$2b$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012'
    const result = await verifyPassword('anypassword', bcryptHash)
    expect(result).toBe(false)
  })

  it('returns false for $2a bcrypt prefix too', async () => {
    const bcryptHash = '$2a$12$somesaltandhashdatathatissuperlongandvalid'
    const result = await verifyPassword('anypassword', bcryptHash)
    expect(result).toBe(false)
  })

  it('returns false for malformed stored hash (wrong number of parts)', async () => {
    const result = await verifyPassword('anypassword', 'onlyonepart')
    expect(result).toBe(false)
  })

  it('returns false for malformed stored hash (two parts)', async () => {
    const result = await verifyPassword('anypassword', 'two:parts')
    expect(result).toBe(false)
  })

  it('returns false for non-numeric iteration count', async () => {
    const result = await verifyPassword('anypassword', 'abc:c2FsdA==:aGFzaA==')
    expect(result).toBe(false)
  })

  it('handles empty password correctly', async () => {
    const hashed = await hashPassword('')
    const result = await verifyPassword('', hashed)
    expect(result).toBe(true)

    const wrongResult = await verifyPassword('notempty', hashed)
    expect(wrongResult).toBe(false)
  })

  it('handles unicode passwords correctly', async () => {
    const password = 'Om नमः शिवाय 🙏'
    const hashed = await hashPassword(password)
    const result = await verifyPassword(password, hashed)
    expect(result).toBe(true)

    const wrongResult = await verifyPassword('Om', hashed)
    expect(wrongResult).toBe(false)
  })
})

// ═══════════════════════════════════════════════════════════════════════
// JWT TOKEN GENERATION & VERIFICATION
// ═══════════════════════════════════════════════════════════════════════

describe('generateToken / verifyToken', () => {
  it('generates a valid JWT access token', async () => {
    const token = await generateToken(testUser, TEST_SECRET)
    expect(typeof token).toBe('string')
    expect(token.split('.')).toHaveLength(3) // header.payload.signature
  })

  it('verifyToken returns payload with correct fields', async () => {
    const token = await generateToken(testUser, TEST_SECRET)
    const payload = await verifyToken(token, TEST_SECRET)

    expect(payload).not.toBeNull()
    expect(payload!.id).toBe('u-test-1')
    expect(payload!.username).toBe('testuser')
    expect(payload!.type).toBe('access')
    expect(payload!.exp).toBeDefined()
    expect(payload!.iat).toBeDefined()
  })

  it('verifyToken returns null for invalid token', async () => {
    const result = await verifyToken('invalid.token.here', TEST_SECRET)
    expect(result).toBeNull()
  })

  it('verifyToken returns null for wrong secret', async () => {
    const token = await generateToken(testUser, TEST_SECRET)
    const result = await verifyToken(token, 'wrong-secret')
    expect(result).toBeNull()
  })

  it('verifyToken returns null for empty token', async () => {
    const result = await verifyToken('', TEST_SECRET)
    expect(result).toBeNull()
  })
})

describe('generateRefreshToken / verifyRefreshToken', () => {
  it('generates a valid JWT refresh token', async () => {
    const token = await generateRefreshToken(testUser, TEST_REFRESH_SECRET)
    expect(typeof token).toBe('string')
    expect(token.split('.')).toHaveLength(3)
  })

  it('verifyRefreshToken returns payload with type=refresh', async () => {
    const token = await generateRefreshToken(testUser, TEST_REFRESH_SECRET)
    const payload = await verifyRefreshToken(token, TEST_REFRESH_SECRET)

    expect(payload).not.toBeNull()
    expect(payload!.id).toBe('u-test-1')
    expect(payload!.username).toBe('testuser')
    expect(payload!.type).toBe('refresh')
  })

  it('verifyRefreshToken returns null for access tokens (wrong type)', async () => {
    const accessToken = await generateToken(testUser, TEST_SECRET)
    // Use the same secret for simplicity — the type check should catch it
    const result = await verifyRefreshToken(accessToken, TEST_SECRET)
    expect(result).toBeNull()
  })

  it('verifyRefreshToken returns null for invalid token', async () => {
    const result = await verifyRefreshToken('garbage', TEST_REFRESH_SECRET)
    expect(result).toBeNull()
  })

  it('verifyRefreshToken returns null for wrong secret', async () => {
    const token = await generateRefreshToken(testUser, TEST_REFRESH_SECRET)
    const result = await verifyRefreshToken(token, 'wrong-secret')
    expect(result).toBeNull()
  })
})

// ═══════════════════════════════════════════════════════════════════════
// CROSS-VERIFICATION CHECKS
// ═══════════════════════════════════════════════════════════════════════

describe('cross-verification', () => {
  it('access token verified with verifyToken should have type=access', async () => {
    const token = await generateToken(testUser, TEST_SECRET)
    const payload = await verifyToken(token, TEST_SECRET)
    expect(payload!.type).toBe('access')
  })

  it('refresh token verified with verifyToken returns payload (no type check)', async () => {
    // verifyToken does not check type, so a refresh token is technically valid
    const token = await generateRefreshToken(testUser, TEST_SECRET)
    const payload = await verifyToken(token, TEST_SECRET)
    expect(payload).not.toBeNull()
    expect(payload!.type).toBe('refresh')
  })

  it('tokens with different users produce different payloads', async () => {
    const user1 = { id: 'u-1', username: 'alice' }
    const user2 = { id: 'u-2', username: 'bob' }

    const token1 = await generateToken(user1, TEST_SECRET)
    const token2 = await generateToken(user2, TEST_SECRET)

    const payload1 = await verifyToken(token1, TEST_SECRET)
    const payload2 = await verifyToken(token2, TEST_SECRET)

    expect(payload1!.id).toBe('u-1')
    expect(payload1!.username).toBe('alice')
    expect(payload2!.id).toBe('u-2')
    expect(payload2!.username).toBe('bob')
  })
})
