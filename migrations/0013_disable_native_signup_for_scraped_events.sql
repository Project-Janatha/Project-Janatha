-- 0013_disable_native_signup_for_scraped_events.sql
-- For the 41 events seeded in 0010 from scraped chapter websites, signup
-- happens on those external sites, not on Janata. Set signup_url = external_url
-- so the event detail page swaps the native "Attend Event" button for a
-- "Sign up at <hostname>" CTA. Janata acts as a referrer.
--
-- This intentionally only touches rows where external_url was populated by
-- 0012, which scopes the change to the 41 scraped events. The 13 pre-existing
-- prod events (test/sample) have external_url = NULL and keep native RSVP.
--
-- Idempotent; safe to re-run.

UPDATE events
SET signup_url = external_url, updated_at = datetime('now')
WHERE external_url IS NOT NULL
  AND signup_url IS NULL;
