-- 0003_add_center_details.sql
-- Add website, phone, image, acharya, and point_of_contact to centers table.

ALTER TABLE centers ADD COLUMN website TEXT;
ALTER TABLE centers ADD COLUMN phone TEXT;
ALTER TABLE centers ADD COLUMN image TEXT;
ALTER TABLE centers ADD COLUMN acharya TEXT;
ALTER TABLE centers ADD COLUMN point_of_contact TEXT;
