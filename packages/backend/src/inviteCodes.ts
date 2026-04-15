/**
 * inviteCodes.ts
 *
 * Om Sri Chinmaya Sadgurave Namaha. Om Sri Gurubyo Namaha.
 *
 * Invite code management for beta access gating
 */

import type { Env, InviteCodeRow } from './types'
import { ADMIN_CUTOFF } from './constants'

/**
 * Validate an invite code
 * Returns the code row if valid and active, null otherwise
 */
export async function validateInviteCode(
  env: Env,
  code: string
): Promise<InviteCodeRow | null> {
  if (!code || typeof code !== 'string' || code.trim().length === 0) {
    return null
  }

  const stmt = env.DB.prepare(`
    SELECT code, label, verification_level, is_active, created_at
    FROM invite_codes
    WHERE code = ? AND is_active = 1
  `)

  const result = await stmt.bind(code.trim().toUpperCase()).first<InviteCodeRow>()
  return result || null
}

/**
 * Get an invite code (regardless of active status)
 * Used for admin lookups
 */
export async function getInviteCode(
  env: Env,
  code: string
): Promise<InviteCodeRow | null> {
  if (!code || typeof code !== 'string') {
    return null
  }

  const stmt = env.DB.prepare(`
    SELECT code, label, verification_level, is_active, created_at
    FROM invite_codes
    WHERE code = ?
  `)

  const result = await stmt.bind(code.trim().toUpperCase()).first<InviteCodeRow>()
  return result || null
}

/**
 * Create a new invite code
 * Used by developers via admin operations
 */
export async function createInviteCode(
  env: Env,
  code: string,
  label: string,
  verificationLevel: number,
  isActive: boolean = true
): Promise<{ success: boolean; error?: string }> {
  if (!code || code.trim().length === 0) {
    return { success: false, error: 'Code is required' }
  }
  if (!label || label.trim().length === 0) {
    return { success: false, error: 'Label is required' }
  }
  if (typeof verificationLevel !== 'number' || verificationLevel < 0) {
    return { success: false, error: 'Valid verification_level is required' }
  }
  if (verificationLevel >= ADMIN_CUTOFF) {
    return { success: false, error: 'Verification level cannot grant admin access' }
  }

  try {
    const now = new Date().toISOString()
    const stmt = env.DB.prepare(`
      INSERT INTO invite_codes (code, label, verification_level, is_active, created_at)
      VALUES (?, ?, ?, ?, ?)
    `)

    await stmt.bind(
      code.trim().toUpperCase(),
      label.trim(),
      verificationLevel,
      isActive ? 1 : 0,
      now
    ).run()

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create invite code' }
  }
}

/**
 * Deactivate an invite code
 * Existing users keep their verification_level, but new signups are blocked
 */
export async function deactivateInviteCode(
  env: Env,
  code: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const stmt = env.DB.prepare(`
      UPDATE invite_codes
      SET is_active = 0
      WHERE code = ?
    `)

    const result = await stmt.bind(code.trim().toUpperCase()).run()
    return result.success ? { success: true } : { success: false, error: 'Code not found' }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Reactivate an invite code
 */
export async function reactivateInviteCode(
  env: Env,
  code: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const stmt = env.DB.prepare(`
      UPDATE invite_codes
      SET is_active = 1
      WHERE code = ?
    `)

    const result = await stmt.bind(code.trim().toUpperCase()).run()
    return result.success ? { success: true } : { success: false, error: 'Code not found' }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Get all invite codes (for admin/analytics)
 */
export async function getAllInviteCodes(env: Env): Promise<InviteCodeRow[]> {
  const stmt = env.DB.prepare(`
    SELECT code, label, verification_level, is_active, created_at
    FROM invite_codes
    ORDER BY created_at DESC
  `)

  const result = await stmt.all<InviteCodeRow>()
  return result.results || []
}

/**
 * Count users who signed up with a specific invite code
 */
export async function countUsersWithCode(env: Env, code: string): Promise<number> {
  const stmt = env.DB.prepare(`
    SELECT COUNT(*) as count FROM users
    WHERE invite_code = ?
  `)

  const result = await stmt.bind(code.trim().toUpperCase()).first<{ count: number }>()
  return result?.count || 0
}

/**
 * Get all users who signed up with a specific invite code
 */
export async function getUsersWithCode(env: Env, code: string): Promise<string[]> {
  const stmt = env.DB.prepare(`
    SELECT id FROM users
    WHERE invite_code = ?
    ORDER BY created_at DESC
  `)

  const result = await stmt.bind(code.trim().toUpperCase()).all<{ id: string }>()
  return (result.results || []).map((r) => r.id)
}

/**
 * Convert invite code row to API response format
 */
export function inviteCodeRowToApi(row: InviteCodeRow) {
  return {
    code: row.code,
    label: row.label,
    verificationLevel: row.verification_level,
    isActive: row.is_active === 1,
    createdAt: row.created_at,
  }
}
