-- 0015_add_event_created_by.sql
-- Adds events.created_by so the API can record who created each event.
--
-- Why: db.createEvent already binds a created_by value, but the column was
-- never added to the schema, so every POST /addEvent fails with
-- "Failed to store event." This blocks the beta Create Event flow opened
-- in PR #180 and is also a prerequisite for letting owners (and admins)
-- edit/delete their own events from the event detail page.
--
-- Nullable on purpose: existing events were created before this column
-- existed and have no known author.

ALTER TABLE events ADD COLUMN created_by TEXT REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);
