-- 0010_extend_events_schema.sql
-- Adds two columns to the events table to better represent real-world events:
--
--   end_date     - ISO-8601 datetime, nullable. Lets multi-day events (camps,
--                  retreats, yajna series) carry a real range instead of
--                  cramming the end into the description.
--
--   is_recurring - 0/1 flag for events that repeat on a schedule
--                  (weekly satsangs, balavihar, study groups). Cadence
--                  details live in the description for now.
--
-- Both columns are additive and nullable / defaulted, so existing rows
-- (and the API serializer) continue to work without migration of values.

ALTER TABLE events ADD COLUMN end_date TEXT;
ALTER TABLE events ADD COLUMN is_recurring INTEGER NOT NULL DEFAULT 0;
