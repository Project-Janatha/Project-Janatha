-- 0005_notifications.sql
-- Notifications system for Chinmaya Janata
-- Supports in-app notifications with read/unread status
-- Extensible for future push and email notifications

-- ═══════════════════════════════════════════════════════════════════════
-- NOTIFICATION TYPES
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS notification_types (
  id              INTEGER PRIMARY KEY,
  name            TEXT NOT NULL UNIQUE,
  description     TEXT,
  icon            TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Insert notification types
INSERT OR IGNORE INTO notification_types (id, name, description, icon) VALUES
  (1, 'EVENT_REMINDER', 'Reminder for an upcoming event', 'bell'),
  (2, 'EVENT_CREATED', 'New event at your center', 'calendar-plus'),
  (3, 'EVENT_CANCELLED', 'Event has been cancelled', 'calendar-minus'),
  (4, 'EVENT_UPDATED', 'Event details have been updated', 'calendar-edit'),
  (5, 'ATTENDEE_JOINED', 'Someone joined your event', 'user-plus'),
  (6, 'CENTER_ANNOUNCEMENT', 'Announcement from your center', 'megaphone'),
  (7, 'SYSTEM_NOTIFICATION', 'System notification', 'info');

-- ═══════════════════════════════════════════════════════════════════════
-- NOTIFICATIONS
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS notifications (
  id              TEXT PRIMARY KEY,                -- UUID
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type_id         INTEGER NOT NULL REFERENCES notification_types(id),
  title           TEXT NOT NULL,
  message         TEXT NOT NULL,
  data            TEXT,                            -- JSON object for additional context
  is_read         INTEGER NOT NULL DEFAULT 0,      -- 0 = false, 1 = true
  is_archived     INTEGER NOT NULL DEFAULT 0,      -- 0 = false, 1 = true
  read_at         TEXT,                            -- ISO-8601 timestamp
  action_url      TEXT,                            -- Deep link or external URL
  related_event_id TEXT REFERENCES events(id) ON DELETE SET NULL,
  related_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notif_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notif_type ON notifications(type_id);
CREATE INDEX IF NOT EXISTS idx_notif_created ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notif_event ON notifications(related_event_id);

-- ═══════════════════════════════════════════════════════════════════════
-- NOTIFICATION PREFERENCES
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS notification_preferences (
  id              TEXT PRIMARY KEY,                -- UUID
  user_id         TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  
  -- In-app notifications
  in_app_enabled  INTEGER NOT NULL DEFAULT 1,      -- 0 = false, 1 = true
  
  -- Push notifications (future)
  push_enabled    INTEGER NOT NULL DEFAULT 1,
  
  -- Email notifications (future)
  email_enabled   INTEGER NOT NULL DEFAULT 1,
  
  -- Notification types preferences
  event_reminders INTEGER NOT NULL DEFAULT 1,
  event_created   INTEGER NOT NULL DEFAULT 1,
  event_cancelled INTEGER NOT NULL DEFAULT 1,
  event_updated   INTEGER NOT NULL DEFAULT 1,
  attendee_joined INTEGER NOT NULL DEFAULT 1,
  center_announcements INTEGER NOT NULL DEFAULT 1,
  
  -- Quiet hours (future)
  quiet_hours_start TEXT,                          -- HH:MM format (UTC)
  quiet_hours_end   TEXT,                          -- HH:MM format (UTC)
  quiet_hours_enabled INTEGER NOT NULL DEFAULT 0,
  
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_notif_prefs_user ON notification_preferences(user_id);
