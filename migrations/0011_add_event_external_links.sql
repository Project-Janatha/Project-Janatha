-- 0011_add_event_external_links.sql
-- Adds two columns to the events table for external links:
--
--   external_url - Official event page on the chapter's site (where the event
--                  was scraped from, or wherever the canonical info lives).
--                  When set, the detail page shows a "Visit official page" link.
--
--   signup_url   - URL where signup happens externally. When set, the native
--                  RSVP / Attend button is hidden in favor of a CTA that
--                  opens this URL in a new tab. Used for events whose signup
--                  flow lives on Eventbrite, Zoom, or the chapter's own form.
--
-- Both columns are TEXT, nullable, additive — existing rows keep working.

ALTER TABLE events ADD COLUMN external_url TEXT;
ALTER TABLE events ADD COLUMN signup_url TEXT;
