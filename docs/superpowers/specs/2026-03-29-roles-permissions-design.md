# Roles & Permissions v1

## Overview

Add granular role-based access control to Chinmaya Janata. Three role levels:

- **Super admin** — core team, manages everything (keeps existing `verification_level >= 107`)
- **Center admin** — manages a specific center's details, events, and members
- **Event admin** — manages a specific event and its attendees

## Data Model

### Existing (no change)

Super admin is determined by `verification_level >= ADMIN_CUTOFF (107)` on the user row. Core team emails in `DEVELOPER_EMAILS` get `BRAHMACHARI (108)` on signup. No changes needed.

### New `user_roles` table

```sql
CREATE TABLE user_roles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,          -- 'center_admin' | 'event_admin'
  resource_type TEXT NOT NULL, -- 'center' | 'event'
  resource_id TEXT NOT NULL,   -- the center or event UUID
  granted_by TEXT REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, role, resource_id)
);
```

- `granted_by` is null when auto-assigned on resource creation
- `ON DELETE CASCADE` cleans up roles when a user is deleted
- Unique constraint prevents duplicate assignments

### Auto-assignment

- When a user creates a center → insert `center_admin` role for that center
- When a user creates an event → insert `event_admin` role for that event

## Backend Authorization

### Helper functions

```
isSuperAdmin(user)            → verification_level >= ADMIN_CUTOFF
isCenterAdmin(user, centerId) → isSuperAdmin OR has center_admin role for centerId
isEventAdmin(user, eventId)   → isSuperAdmin OR has event_admin role for eventId
                                 OR isCenterAdmin of the event's parent center
```

Center admins implicitly have event admin powers for all events under their center.

### Route authorization matrix

| Route | Current auth | New auth |
|-------|-------------|----------|
| `POST /addCenter` | authenticated | authenticated (no change) |
| `POST /verifyCenter` | super admin | super admin (no change) |
| `POST /removeCenter` | super admin | super admin (no change) |
| `PUT /updateCenter` (new) | N/A | center admin or super admin |
| `POST /addEvent` | authenticated | authenticated (creator auto-gets event_admin) |
| `POST /updateEvent` | super admin or creator | event admin, center admin, or super admin |
| `POST /removeEvent` | super admin | event admin, center admin, or super admin |
| `POST /verifyUser` | super admin | super admin (no change) |
| `POST /userUpdate` | super admin | super admin (no change) |
| `POST /removeUser` | super admin | super admin (no change) |
| Manage attendees (new) | N/A | event admin, center admin, or super admin |
| Manage center members (new) | N/A | center admin or super admin |

### New endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/roles/me` | authenticated | Get current user's roles |
| GET | `/api/roles/:resourceType/:resourceId` | center/event admin or super admin | List admins for a center/event |
| POST | `/api/roles/assign` | super admin | Assign a role to a user |
| POST | `/api/roles/revoke` | super admin | Revoke a role from a user |
| PUT | `/api/updateCenter` | center admin or super admin | Edit center details |
| DELETE | `/api/center/:centerId/members/:userId` | center admin or super admin | Remove a member from a center |
| DELETE | `/api/event/:eventId/attendees/:userId` | event admin, center admin, or super admin | Remove an attendee from an event |

### Login/verify response change

The `/auth/authenticate` and `/auth/verify` responses will include the user's roles:

```json
{
  "user": { ... },
  "roles": [
    { "role": "center_admin", "resourceType": "center", "resourceId": "uuid-1" },
    { "role": "event_admin", "resourceType": "event", "resourceId": "uuid-2" }
  ],
  "token": "..."
}
```

## Frontend

### User context

Store roles in the existing user context alongside user data. Provide helper functions:

```ts
isSuperAdmin()                → check verification_level >= 107
isCenterAdmin(centerId)       → super admin OR has center_admin for centerId
isEventAdmin(eventId)         → super admin OR has event_admin for eventId
```

### Inline controls (contextual)

**Center detail page** — visible to center admin or super admin:
- Edit button for center details (name, address, image, acharya, point of contact)
- "Manage Members" section — member list with remove option
- Edit/delete controls on each event listed under the center

**Event detail page** — visible to event admin, center admin, or super admin:
- Edit button (extend existing creator edit to event admins)
- Delete button
- "Manage Attendees" section — attendee list with remove option

### Super admin dashboard (`/admin`)

Accessible only to super admins. Link in the settings panel, only rendered for super admins.

**Centers tab:**
- List all centers with search/filter
- Verify/unverify centers
- Delete centers
- Assign/view/revoke center admins (search for user by name/email)

**Events tab:**
- List all events with search/filter
- Delete events
- View/manage event admins

**Users tab:**
- List all users with search
- View user details and their roles
- Verify/unverify users
- Remove users

### Navigation

- Settings panel: "Admin Dashboard" link, rendered only when `isSuperAdmin()` is true
- Routes to `/admin` with nested tab navigation

## Out of scope (v1)

- Center admins assigning other center admins (only super admins can assign roles)
- Event admin assigning other event admins
- Role-based push notifications
- Audit log of admin actions
- Bulk operations in admin dashboard
