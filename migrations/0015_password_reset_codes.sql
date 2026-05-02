-- 0015_password_reset_codes.sql
-- Self-serve password reset via 6-digit code emailed to the user.
-- Adds token_version on users so password resets can invalidate active JWTs.
-- See: docs/superpowers/specs/2026-05-02-password-reset-design.md

-- ═══════════════════════════════════════════════════════════════════════
-- PASSWORD RESET CODES TABLE
-- ═══════════════════════════════════════════════════════════════════════
-- One row per active reset request. Code is stored hashed (PBKDF2).
-- Codes are single-use and short-lived (15 min). Verify endpoint enforces
-- a max of 5 attempts per code before hard-invalidating.
CREATE TABLE IF NOT EXISTS password_reset_codes (
  id          TEXT PRIMARY KEY,                     -- UUID
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code_hash   TEXT NOT NULL,                        -- PBKDF2 hash, never plaintext
  expires_at  INTEGER NOT NULL,                     -- unix ms
  used_at     INTEGER,                              -- unix ms; null until consumed
  attempts    INTEGER NOT NULL DEFAULT 0,           -- failed verify attempts
  created_at  INTEGER NOT NULL                      -- unix ms
);

-- Lookup-by-user is the hot path (request + verify both filter by user_id).
CREATE INDEX IF NOT EXISTS idx_prc_user_active
  ON password_reset_codes(user_id, expires_at);

-- ═══════════════════════════════════════════════════════════════════════
-- USERS TABLE: token_version
-- ═══════════════════════════════════════════════════════════════════════
-- Embedded in JWT payload at issuance and verified by middleware on every
-- authenticated request. Incrementing this column invalidates all existing
-- JWTs for the user (e.g. on password reset, or future "log out all sessions").
-- Default 0 for backfill compatibility — existing JWTs without the claim
-- are treated as version 0 (see middleware change in spec).
ALTER TABLE users ADD COLUMN token_version INTEGER NOT NULL DEFAULT 0;
