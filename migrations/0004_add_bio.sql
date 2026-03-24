-- 0004_add_bio.sql
-- Add bio column to users table for user profile bios.

ALTER TABLE users ADD COLUMN bio TEXT;
