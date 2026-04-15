-- 0006_invite_codes.sql
-- Invite codes for beta access gating
-- Allows controlled signup with cohort tracking and automatic permission assignment

-- ═══════════════════════════════════════════════════════════════════════
-- INVITE CODES TABLE
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS invite_codes (
  code              TEXT PRIMARY KEY,
  label             TEXT NOT NULL,
  verification_level INTEGER NOT NULL DEFAULT 45,
  is_active         INTEGER NOT NULL DEFAULT 1,
  created_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_invite_codes_active ON invite_codes(is_active);

-- ═══════════════════════════════════════════════════════════════════════
-- USERS TABLE MODIFICATION
-- ═══════════════════════════════════════════════════════════════════════
-- Add invite_code column to users table
-- This tracks which code (if any) was used for signup
-- Nullable for backward compatibility with existing users
ALTER TABLE users ADD COLUMN invite_code TEXT REFERENCES invite_codes(code);

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_users_invite_code ON users(invite_code);

-- ═══════════════════════════════════════════════════════════════════════
-- SEED DATA (OPTIONAL - for development/testing)
-- ═══════════════════════════════════════════════════════════════════════
-- Uncomment to add test codes
-- INSERT OR IGNORE INTO invite_codes (code, label, verification_level, is_active, created_at)
-- VALUES 
--   ('BETA-WAVE1', 'Wave 1 - Bay Area testers', 45, 1, '2026-03-29T00:00:00Z'),
--   ('BETA-WAVE2', 'Wave 2 - Extended testers', 45, 1, '2026-04-01T00:00:00Z'),
--   ('DEV-TEST', 'Development testing', 50, 1, '2026-03-29T00:00:00Z');
