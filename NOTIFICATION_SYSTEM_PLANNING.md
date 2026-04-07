# Notification System Implementation Planning

> **For:** Project-Janatha developers implementing a notification system
> **Status:** Pre-implementation planning guide
> **Created:** 2026-04-07

---

## Current State Assessment

### What Exists
✓ `react-native-toast-message` (v2.3.3) - Installed, not actively used  
✓ Structured error responses from API  
✓ User authentication & authorization system  
✓ Relational database (D1/SQLite) with proper schema  
✓ Type-safe Hono backend with middleware  

### What's Missing
✗ Persistent notification storage/history  
✗ Notification preferences per user  
✗ Push notifications  
✗ Email notifications  
✗ Real-time WebSocket infrastructure  
✗ Background job queue for async notifications  
✗ Notification center UI screen  

---

## Recommended Implementation Roadmap

### Phase 1: Foundation (Immediate)
- [ ] Create database schema migrations:
  - `notifications` table (persistent user notifications)
  - `notification_preferences` table (user opt-in/out settings)
- [ ] Add backend API endpoints in `/packages/backend/src/app.ts`:
  - `GET /api/notifications` - Fetch user notifications
  - `PUT /api/notifications/:id` - Mark as read
  - `DELETE /api/notifications/:id` - Delete
  - `PUT /api/notification-preferences` - Update settings
- [ ] Add database functions in `/packages/backend/src/db.ts`:
  - `createNotification()`, `getNotifications()`, `markAsRead()`, etc.
- [ ] Add types in `/packages/backend/src/types.ts`:
  - `NotificationRow`, `NotificationApiResponse`, `NotificationPreferencesRow`

### Phase 2: Frontend Integration
- [ ] Create notification context provider
- [ ] Create notification center screen in `/packages/frontend/app/`
- [ ] Integrate `react-native-toast-message` for transient toasts:
  - Setup in root layout (`_layout.tsx`)
  - Create toast utilities for consistent styling
- [ ] Add notification badge/counter to UI
- [ ] Fetch notifications on app load and refresh

### Phase 3: Feature Implementation
- [ ] Implement notification creation triggers:
  - Event attendance confirmations
  - Event reminders (1 day before)
  - User verification updates
  - New users in center
- [ ] Add notification preferences screen
- [ ] Implement notification filtering by type

### Phase 4: Enhancement (Future)
- [ ] Push notifications via Expo Notifications
- [ ] Email notifications integration (SendGrid/Mailgun)
- [ ] Real-time updates via WebSockets
- [ ] Background jobs (Cloudflare Queues)
- [ ] Notification analytics/tracking

---

## Implementation Details

### Database Schema

**Table: `notifications`**
```sql
CREATE TABLE notifications (
  id              TEXT PRIMARY KEY,
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type            TEXT NOT NULL,           -- 'event', 'user', 'admin', 'system'
  title           TEXT NOT NULL,
  message         TEXT NOT NULL,
  read            INTEGER DEFAULT 0,       -- 0 = unread, 1 = read
  read_at         TEXT,                    -- ISO-8601 timestamp
  action_url      TEXT,                    -- Deep link to relevant screen
  data            TEXT,                    -- JSON object with extra context
  created_at      TEXT NOT NULL,
  updated_at      TEXT NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
```

**Table: `notification_preferences`**
```sql
CREATE TABLE notification_preferences (
  user_id         TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  event_updates   INTEGER DEFAULT 1,       -- Receive event notifications
  user_activity   INTEGER DEFAULT 1,       -- Receive social notifications
  admin_alerts    INTEGER DEFAULT 1,       -- Receive admin notifications
  system_updates  INTEGER DEFAULT 1,       -- Receive system notifications
  email_enabled   INTEGER DEFAULT 0,       -- Opt-in to email notifications
  created_at      TEXT NOT NULL,
  updated_at      TEXT NOT NULL
);
```

### Backend Endpoints

```typescript
// Get user notifications
GET /api/notifications
- Query params: ?limit=20&offset=0&read=false (optional filters)
- Returns: { notifications: NotificationApiResponse[], total: number }
- Auth: Required

// Mark notification as read
PUT /api/notifications/:notificationId
- Body: { read: true }
- Returns: { success: boolean }
- Auth: Required

// Delete notification
DELETE /api/notifications/:notificationId
- Returns: { success: boolean }
- Auth: Required

// Get notification preferences
GET /api/notification-preferences
- Returns: NotificationPreferencesApiResponse
- Auth: Required

// Update notification preferences
PUT /api/notification-preferences
- Body: Partial<NotificationPreferencesRow>
- Returns: { success: boolean }
- Auth: Required

// Mark all notifications as read (bulk operation)
POST /api/notifications/mark-all-read
- Returns: { success: boolean, marked: number }
- Auth: Required
```

### Frontend Components Structure

```
/packages/frontend/
├── components/
│   ├── contexts/
│   │   └── NotificationContext.tsx          # Notification state management
│   ├── notifications/
│   │   ├── NotificationCenter.tsx           # Main notification screen
│   │   ├── NotificationItem.tsx             # Single notification card
│   │   ├── NotificationPreferences.tsx      # Settings screen
│   │   └── NotificationBadge.tsx            # Badge for unread count
│   └── utils/
│       └── toastUtils.ts                    # Wrapper for react-native-toast-message
├── hooks/
│   ├── useNotifications.ts                  # Hook for notification management
│   └── useToast.ts                          # Hook for toast notifications
└── app/
    └── notifications/                       # Notification center screen
        └── index.tsx
```

### Toast Usage Pattern

```typescript
// In hooks/useToast.ts
import Toast from 'react-native-toast-message'

export const useToast = () => {
  return {
    success: (message: string) => 
      Toast.show({ type: 'success', text1: 'Success', text2: message }),
    error: (message: string) => 
      Toast.show({ type: 'error', text1: 'Error', text2: message }),
    info: (message: string) => 
      Toast.show({ type: 'info', text1: 'Info', text2: message }),
  }
}

// In screens
const { success, error } = useToast()
try {
  await attendEvent(eventId)
  success('You are now attending this event!')
} catch (err) {
  error(err.message)
}
```

---

## Notification Types & Triggers

| Type | Event | Trigger | Example |
|------|-------|---------|---------|
| **event** | Event created | User creates event | "Your event 'Satsang' is live!" |
| **event** | Event reminder | 1 day before event | "Reminder: Satsang starts tomorrow at 6 PM" |
| **event** | User RSVP'd | Someone attends | "John Doe is attending your event" |
| **user** | Profile verified | Admin approval | "Your profile has been verified!" |
| **user** | Points awarded | Achievement | "You earned 50 points!" |
| **admin** | Verification needed | New center/event | "Review pending center 'New York Center'" |
| **system** | Maintenance | System updates | "Maintenance scheduled for tonight" |
| **system** | Feature release | New feature | "Check out our new notification system!" |

---

## Key Architectural Decisions

1. **Stateless Backend Pattern:** Notifications stored in D1, not in-memory
2. **No WebSocket Initially:** Polling-based approach for MVP, can upgrade to WebSocket later
3. **User Control:** Notification preferences allow opt-out per notification type
4. **Toast + Persistent:** Combine immediate toast feedback with persistent history
5. **Typed Everything:** Maintain TypeScript types for all notification objects
6. **Scalable:** Design supports future push notifications & email integration

---

## Testing Strategy

### Backend Tests (`/packages/backend/src/__tests__/`)
```typescript
describe('Notifications', () => {
  it('should create notification for user', async () => { })
  it('should fetch user notifications with pagination', async () => { })
  it('should mark notification as read', async () => { })
  it('should respect notification preferences', async () => { })
})
```

### Frontend Tests (`/packages/frontend/`)
```typescript
describe('NotificationCenter', () => {
  it('should display notifications from API', async () => { })
  it('should mark notification as read when clicked', async () => { })
  it('should show unread badge count', async () => { })
})
```

---

## Migration Path

### If Adding Notifications to Existing Events
```sql
-- Add column to track if notification sent
ALTER TABLE events ADD COLUMN reminder_sent INTEGER DEFAULT 0;

-- After Phase 1 implementation:
-- Create notifications when events are added
-- Schedule reminders for 1 day before event
```

---

## Performance Considerations

- **Pagination:** Fetch 20 notifications per page (adjustable)
- **Indexing:** Index on `(user_id, read, created_at)` for efficient queries
- **Caching:** Cache notification preferences per user during session
- **Cleanup:** Implement job to archive old notifications (>30 days) if using D1 limits
- **Rate Limiting:** Apply middleware to notification endpoints

---

## File References

| File | Purpose | Action |
|------|---------|--------|
| `/migrations/0001_initial_schema.sql` | Add notification tables | Create new migration `0002_notifications.sql` |
| `/packages/backend/src/app.ts` | Add API routes | Add GET/PUT/DELETE `/api/notifications` routes |
| `/packages/backend/src/db.ts` | Add DB functions | Add `createNotification()`, `getNotifications()`, etc. |
| `/packages/backend/src/types.ts` | Add types | Add `NotificationRow`, `NotificationApiResponse` |
| `/packages/frontend/app/_layout.tsx` | Root layout | Setup `Toast` component at root |
| `/packages/frontend/components/contexts/` | State | Create `NotificationContext.tsx` |
| `/packages/frontend/app/notifications/index.tsx` | Screen | Create notification center screen |

---

## Estimated Effort

- **Phase 1 (Foundation):** 4-6 hours
- **Phase 2 (Frontend):** 4-5 hours
- **Phase 3 (Features):** 6-8 hours
- **Phase 4 (Enhancements):** 8-12 hours
- **Total MVP:** ~14-19 hours
- **Total with Phase 4:** ~22-31 hours

---

## Dependencies to Install

```bash
# Already installed
npm install --workspace=@janatha/frontend react-native-toast-message@2.3.3

# May need (optional)
npm install --workspace=@janatha/frontend expo-notifications  # For push notifications
npm install --workspace=@janatha/backend @react-native-async-storage/async-storage  # For persistence
```

---

## Next Steps

1. Review this plan with the team
2. Create GitHub issues for each phase
3. Start with Phase 1: Database schema
4. Follow with Phase 2: Frontend integration
5. Iterate based on user feedback
6. Plan Phase 3 features based on priority

---

**Questions?** Reference the main `CODEBASE_ANALYSIS.md` for full project structure details.
