-- 0014_add_event_allow_janata_signup.sql
-- Adds allow_janata_signup to events: a per-event opt-in for native RSVP
-- when an external signup_url is also set.
--
-- Default behavior (allow_janata_signup = 0):
--   - signup_url null  → native "Attend Event" button
--   - signup_url set   → external "Sign up at <hostname>" button only;
--                         native RSVP hidden, attendee count hidden
--
-- When admin sets allow_janata_signup = 1 on an event with signup_url:
--   - Two buttons: "Attend on Janata" (primary) + "Sign up at <hostname>"
--     (secondary). Janata acts as an alternate, official site stays canonical.
--   - Attendee count visible again ("X on Janata").
--
-- Default 0 so existing behavior is preserved everywhere.

ALTER TABLE events ADD COLUMN allow_janata_signup INTEGER NOT NULL DEFAULT 0;
