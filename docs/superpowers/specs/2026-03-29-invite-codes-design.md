# Invite Codes for Beta Access

## Overview

Gate new signups behind invite codes to control beta access. Each code represents a batch of testers, sets their `verification_level`, and enables tracking/analytics per cohort. Returning users are unaffected.

## Goals

- Only users with a valid invite code can create new accounts
- Group testers into batches for cohort analysis
- Reuse existing `verification_level` logic for permissions
- Track which code each user signed up with
- Codes are managed by devs via direct SQL (no admin UI)

## Data Model

### New table: `invite_codes`

| Column               | Type                | Notes                                          |
| -------------------- | ------------------- | ---------------------------------------------- |
| `code`               | TEXT PRIMARY KEY     | The code string, e.g. `BETA-WAVE1`             |
| `label`              | TEXT NOT NULL        | Human-readable batch name                      |
| `verification_level` | INTEGER NOT NULL     | Level assigned to users who use this code       |
| `is_active`          | INTEGER DEFAULT 1    | 0 = deactivated, rejects new signups            |
| `created_at`         | TEXT                 | ISO 8601 timestamp                              |

### Users table change

Add column: `invite_code TEXT REFERENCES invite_codes(code)` — nullable (existing users won't have one), required for new signups during beta.

No changes to any other columns. `verification_level` on the user row works exactly as before — it's just set from the invite code instead of the hardcoded default.

## Auth Flow

### Current flow

```
Email input -> check user exists -> (existing) login / (new) password -> onboarding
```

### New flow

```
Email input -> check user exists -> (existing) login / (new) invite code -> password -> onboarding
```

The invite code screen appears only for new users, after the email check determines the user doesn't exist. Returning users see no change.

### Frontend behavior

1. User enters email on auth screen
2. Frontend calls `checkUserExists(username)` (unchanged)
3. If user exists: proceed to password/login (unchanged)
4. If user is new: show invite code input screen
   - Single text input: "Enter your invite code"
   - Submit calls `POST /api/auth/validate-invite-code` with `{ code }`
   - Valid: proceed to password creation (code held in component state)
   - Invalid: show inline error "Invalid invite code"
5. On password submission, `inviteCode` is sent alongside `username` and `password` to the signup endpoint

Both `auth.tsx` (native) and `auth.web.tsx` (web) need the new step. The `authStep` state machine gains a new state: `'initial' -> 'invite-code' -> 'signup' | 'login'`.

## API Changes

### New endpoint: `POST /api/auth/validate-invite-code`

- **Auth:** Public (no authentication required)
- **Body:** `{ code: string }`
- **Response (valid):** `{ valid: true }`
- **Response (invalid):** `{ valid: false, error: "Invalid invite code" }`
- **Logic:** Check `invite_codes` table for matching `code` where `is_active = 1`

### Modified endpoint: `POST /api/auth/signup`

- **Current body:** `{ username, password }`
- **New body:** `{ username, password, inviteCode }`
- **Changes:**
  1. Validate `inviteCode` is present (reject if missing)
  2. Look up code in `invite_codes` table, verify `is_active = 1`
  3. If invalid/inactive: return error, do not create user
  4. On user creation: set `verification_level` from the invite code's value
  5. Store `invite_code` on the user row
- **No changes to response shape** — still returns `{ success: true, id }` on success

Double validation (validate endpoint + signup endpoint) is intentional. The validate endpoint gives fast UX feedback; the signup endpoint is the security boundary.

### No other endpoints change

Login, onboarding, complete-onboarding, and all other endpoints remain unchanged.

## Migration

A single migration script that:

1. Creates the `invite_codes` table
2. Adds the `invite_code` column to the `users` table

This runs against both local D1 and production D1. The local table creation script (`create-local-tables.js` or equivalent) should also be updated to include the new table.

## Seed Data

Codes are created via direct SQL against D1:

```sql
INSERT INTO invite_codes (code, label, verification_level, is_active, created_at)
VALUES ('BETA-WAVE1', 'Wave 1 - Bay Area testers', 45, 1, '2026-03-29T00:00:00Z');
```

No admin UI or CLI tool. Devs manage codes by running SQL.

## Testing

- **validate-invite-code endpoint:** valid code returns `{ valid: true }`, invalid/inactive code returns `{ valid: false }`, missing code returns error
- **signup endpoint:** signup with valid code succeeds and sets correct `verification_level` and `invite_code` on user, signup without code is rejected, signup with inactive code is rejected
- **frontend:** new `invite-code` auth step renders for new users, does not render for existing users, validates before proceeding to password

## Future Considerations (not in scope)

These are explicitly out of scope but the design accommodates them:

- **Max uses per code:** Add a `max_uses` column and count users with that code
- **Expiry dates:** Add an `expires_at` column
- **Post-beta upgrade:** Query users by `invite_code` to batch-update their `verification_level` or migrate them to a different tier
- **Analytics:** PostHog events for `invite_code_validated`, `signup_with_invite_code` with the code as a property for cohort analysis
