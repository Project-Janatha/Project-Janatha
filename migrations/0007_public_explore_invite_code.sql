-- 0007_public_explore_invite_code.sql
-- Seed the PUBLIC-EXPLORE invite code for frictionless event sign-up
-- Used automatically when users sign up via shared event links

INSERT OR IGNORE INTO invite_codes (code, label, verification_level, is_active)
VALUES ('PUBLIC-EXPLORE', 'Public explore page sign-up', 45, 1);
