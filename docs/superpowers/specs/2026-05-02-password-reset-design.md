# Password Reset (MVP, Beta)

## Overview

Self-serve password reset using a 6-digit code emailed via Resend. Lets beta users recover their accounts without admin intervention. Scoped for the Memorial Day camp demo — not a long-term auth surface.

## Goals

- A user who forgot their password can reset it from the auth screen, end-to-end, without contacting an admin
- The reset flow works identically on web and native (no deep linking required)
- Sending credentials and reset state never leak to the client bundle
- A successful reset invalidates the user's existing JWTs (so a stolen token can't survive a reset)

## Non-Goals

- Multi-factor recovery (recovery codes, SMS, security questions)
- Admin-facing reset UI
- Email verification of new accounts (separate concern)
- Production-grade rate limiting beyond what fits in the existing D1 schema

## Decision Log

| Decision | Choice | Rationale |
|---|---|---|
| Delivery channel | 6-digit code in email (not a magic link) | Same UX on web and native; no deep linking work for Expo |
| Email provider | Resend | Generous free tier (3000/mo, 100/day), best DX on Cloudflare Workers, MailChannels-via-Workers no longer free as of mid-2024 |
| Code lifetime | 15 minutes | Short enough to limit exposure; long enough to find the email on a phone |
| Code storage | PBKDF2-hashed (reuse `auth.ts` helpers) | Treat as a tiny password — never store plaintext |
| Email enumeration | Always return `{ ok: true }` from request endpoint | Don't reveal which emails are registered |
| Rate limit (request) | Max 3 active codes per user, 1-hour window | Stops email-bombing |
| Rate limit (verify) | 5 attempts per code, then code hard-invalidated | Stops code guessing |
| Session invalidation on reset | Token version column on users (option B) | Stateless JWTs require this to invalidate active sessions on reset |
| Confirmation email | "Your password was just changed" sent on success | Catches account takeovers; near-zero cost |

## Data Model

### New table: `password_reset_codes`

| Column        | Type                | Notes                                         |
|---------------|---------------------|-----------------------------------------------|
| `id`          | TEXT PRIMARY KEY    | UUID                                          |
| `user_id`     | TEXT NOT NULL FK    | `ON DELETE CASCADE`                           |
| `code_hash`   | TEXT NOT NULL       | PBKDF2 hash, never plaintext                  |
| `expires_at`  | INTEGER NOT NULL    | unix ms                                       |
| `used_at`     | INTEGER             | unix ms; null until consumed                  |
| `attempts`    | INTEGER DEFAULT 0   | Failed verify attempts                        |
| `created_at`  | INTEGER NOT NULL    | unix ms                                       |

Index: `(user_id, expires_at)` — both endpoints filter by user_id and need to find the active (non-expired) code.

### Users table change

Add column: `token_version INTEGER NOT NULL DEFAULT 0`

Embedded in the JWT at issuance, verified by middleware on every authenticated request. Incrementing this column invalidates all existing JWTs for the user.

Migration: `migrations/0015_password_reset_codes.sql` (already created in this PR).

## API Contract

### `POST /auth/password-reset/request`

- **Auth:** Public
- **Body:** `{ email: string }`
- **Response:** Always `{ ok: true }` (regardless of whether user exists)
- **Rate limit:** Max 3 active codes per user. New requests for a user with active codes invalidate the prior ones.
- **Logic:**
  1. Look up user by `username` (the project uses email-as-username; case-insensitive via existing `COLLATE NOCASE` on the column)
  2. If found:
     - Mark all the user's non-expired codes as `used_at = now()` (single-active-code invariant)
     - Generate 6-digit numeric code (cryptographically random — `crypto.getRandomValues`)
     - Hash with `hashPassword()` from `packages/backend/src/auth.ts`
     - Insert row with `expires_at = now + 15min`, `created_at = now`
     - Send email via Resend (see "Email Content" below)
  3. Always return `{ ok: true }` — no enumeration leak. Errors during email send are logged but not surfaced to the client.

### `POST /auth/password-reset/verify`

- **Auth:** Public
- **Body:** `{ email: string, code: string, newPassword: string }`
- **Response (ok):** `{ ok: true }`
- **Response (failure):** `{ ok: false, error: "code invalid or expired" }` — generic, never differentiates why
- **Logic:**
  1. Look up user by username
  2. Find active code: `WHERE user_id = ? AND used_at IS NULL AND expires_at > now() ORDER BY created_at DESC LIMIT 1`
  3. Increment `attempts`. If post-increment `attempts >= 5`: set `used_at = now()` (hard-invalidate) and return failure.
  4. Verify `verifyPassword(code, code_hash)`. On miss: return failure (the increment from step 3 stands).
  5. On match (atomic in a single transaction):
     - Validate `newPassword` against existing signup rules (see `auth.ts` / signup endpoint for current min length)
     - Hash new password with `hashPassword()`, update `users.password`
     - Increment `users.token_version` (invalidates existing JWTs)
     - Mark code `used_at = now()`
  6. Send confirmation email ("your password was just changed") — fire-and-forget.
  7. Return `{ ok: true }`. Frontend redirects user to login.

## Token Version Mechanism (Option B)

To make password reset invalidate live sessions despite stateless JWTs.

### JWT payload change

`packages/backend/src/auth.ts` already has a `TokenPayload` interface:
```ts
interface TokenPayload extends JWTPayload {
  id: string
  username: string
  type?: 'access' | 'refresh'
}
```

Add `tv?: number` (token version). `generateToken` and `generateRefreshToken` need to accept `tokenVersion` and embed it in the payload.

### Middleware verification

Wherever `verifyToken` is called to authenticate a request (look for usage in `packages/backend/src/app.ts` and any `auth.ts` middleware in the routes), extend the check:

```ts
const payload = await verifyToken(token, env.JWT_SECRET)
if (!payload) return unauthorized()

// New: check token_version against the user row.
const user = await db.prepare('SELECT token_version FROM users WHERE id = ?').bind(payload.id).first()
if (!user) return unauthorized()
const claimedVersion = (payload.tv as number | undefined) ?? 0
if (claimedVersion !== user.token_version) return unauthorized()
```

### Backfill behavior

Existing JWTs in circulation don't have a `tv` claim. They're treated as version 0, which matches the default for all existing users. So they keep working until they expire naturally (30-day access, 90-day refresh) — no forced logout for current sessions.

### Performance note

This adds one D1 read per authenticated request. For a beta scale this is fine. If/when it becomes a hotspot, options are: (a) cache user → token_version in a short KV TTL, or (b) include token_version in the JWT only and rely on revocation lists for explicit invalidations.

## Frontend Flow

### Files to create

- `packages/frontend/app/auth/forgot.tsx` (native)
- `packages/frontend/app/auth/forgot.web.tsx` (web)

(Or — preferred — co-locate as `packages/frontend/app/auth/forgot/index.tsx` + `index.web.tsx` if the existing routing convention prefers that. Match whatever pattern `auth.tsx` / `auth.web.tsx` uses.)

### Two-step flow

State machine inside the screen:

```
'enter-email' -> submit -> 'enter-code-and-password' -> submit -> redirect to login (success toast)
```

- **Step 1 (enter email):** Single email input. Submit calls `requestPasswordReset(email)`. Advance to step 2 unconditionally (don't reveal whether email matched).
- **Step 2 (code + new password):** Two inputs (6-digit numeric, new password) and a "Resend code" link that triggers a fresh `requestPasswordReset`. Submit calls `confirmPasswordReset(email, code, newPassword)`. On success → redirect to `/auth` with success toast. On failure → generic "code invalid or expired" + offer to resend.

### authClient changes

`packages/frontend/src/auth/authClient.ts` — add two methods:

```ts
async requestPasswordReset(email: string): Promise<{ ok: true }>
async confirmPasswordReset(email: string, code: string, newPassword: string): Promise<{ ok: boolean; error?: string }>
```

### Login screen link

Add "Forgot password?" link on `packages/frontend/app/auth.tsx` and `auth.web.tsx`, visible only on the password-entry step (after email is confirmed to exist). Routes to `/auth/forgot`.

## Email Content

### Reset code email

- **Subject:** `Your Chinmaya Janata password reset code`
- **From:** `Chinmaya Janata <noreply@chinmayajanata.org>` (uses `RESEND_FROM_EMAIL` env var)
- **Body:**
  - Greeting (use `first_name` if set, else "Hi")
  - The 6-digit code, large and monospaced
  - "This code expires in 15 minutes."
  - "If you didn't request this, you can ignore this email — your password won't be changed."
  - "Chinmaya Janata will never ask you for this code."
  - Plain-text fallback included

Implementation: build with `react-email` (skill is installed at `~/.agents/skills/react-email`) for clean cross-client HTML. Render to HTML at build/runtime, send via Resend.

### Confirmation email

- **Subject:** `Your Chinmaya Janata password was changed`
- **Body:** "Your password was just changed at [time]. If this wasn't you, contact us immediately." Include a contact channel.

## Security Defaults

| Surface | Default | Implementation |
|---|---|---|
| Code format | 6-digit numeric (000000–999999) | `crypto.getRandomValues(new Uint8Array(3))` → integer mod 1_000_000, zero-padded |
| Code expiry | 15 min | `expires_at = now + 15 * 60 * 1000` |
| Active codes per user | Max 3 in last 60 min | Reject 4th request; existing codes invalidated on each new request anyway |
| Verify attempts | 5 per code | Increment on miss; hard-invalidate at 5 |
| Code storage | PBKDF2-hashed | Reuse `hashPassword` / `verifyPassword` from `auth.ts` |
| Enumeration | Always `{ ok: true }` from request | No status difference for unknown email |
| Generic errors | Yes | Verify failure messages don't differentiate "expired" vs "wrong code" vs "no such user" |
| Password rules on reset | Match existing signup rules | Look up the current min length / pattern in the signup endpoint and reuse |
| Session invalidation | Yes (token_version) | See "Token Version Mechanism" |
| Confirmation email | Yes | Fired after successful reset |

## Testing Plan

### Backend unit tests

`packages/backend/src/__tests__/passwordReset.test.ts` — cases:

- Happy path: request → email queued, verify → password updated, token_version incremented, code marked used
- Unknown email returns `ok: true` (enumeration test)
- Expired code rejected
- Wrong code increments attempts; 5th attempt hard-invalidates
- Used code can't be reused
- New request invalidates prior active code for same user
- Old JWT (with prior token_version) rejected by middleware after a reset

Existing tests to update:
- `packages/backend/src/__tests__/auth.test.ts` — add token_version to test fixtures and verify it's embedded in generated tokens

### E2E (Playwright)

Extend `tests/auth-flow.spec.ts` with a forgot-password scenario (web only):
1. Create a test user with a known email
2. From login screen, click "Forgot password?"
3. Submit email
4. Read the latest code from D1 directly (test harness — bypass actual email send by stubbing Resend or by querying the row + reversing the hash isn't possible; instead expose a test-only env hook that lets the test capture the plaintext code at generation, OR query the users table for the latest code where we deterministically generate during tests)
5. Submit code + new password
6. Log in with new password — expect success
7. Try to use old JWT — expect 401

Prefer stubbing Resend in tests (don't send real email). The Resend skill at `~/.agents/skills/resend` documents recommended patterns.

### Manual verification before merge

- One real reset against staging Worker with a real inbox
- Inspect the email rendering in Gmail and Apple Mail at minimum

## Dependencies & Setup

- `RESEND_API_KEY` — secret. Already wired into `.dev.vars` / wrangler comment in this PR. Must be set via `npx wrangler secret put RESEND_API_KEY` in staging and production before this ships.
- `RESEND_FROM_EMAIL` — non-secret var. Set to `noreply@chinmayajanata.org` in `wrangler.toml` and `wrangler.staging.toml` in this PR. **The sender domain must be verified in the Resend dashboard before sending — Resend will 403 silently otherwise.**
- npm packages to add (when implementing):
  - `resend` — official SDK
  - `react-email` + `@react-email/components` — for the email template (optional; can also inline HTML if we want to avoid the dep)

## Pickup-Here TODOs

What's already in this PR:
- [x] Migration `0015_password_reset_codes.sql`
- [x] `.gitignore` covers `**/.dev.vars`
- [x] `.dev.vars` untracked from git
- [x] `.dev.vars.example` template added
- [x] `RESEND_API_KEY` documented in `wrangler.toml` secrets comment
- [x] `RESEND_FROM_EMAIL` set in `wrangler.toml` and `wrangler.staging.toml`
- [x] This design doc

What's left to implement (suggested order):

1. **Token version plumbing** (touches existing auth — do this first, separately if useful)
   - Update `TokenPayload` to include `tv?: number`
   - `generateToken` / `generateRefreshToken` accept and embed `tokenVersion`
   - Update all call sites of `generateToken` (login, signup, refresh) to read and pass `users.token_version`
   - Auth middleware: read `tv` claim, verify against current `users.token_version`, reject mismatch
   - Update `auth.test.ts`
2. **Email scaffolding**
   - `npm install resend react-email @react-email/components` in `packages/backend`
   - `packages/backend/src/email/send.ts` — thin Resend wrapper that reads `RESEND_API_KEY` and `RESEND_FROM_EMAIL` from env, sends with retry, returns success/failure for logging
   - `packages/backend/src/email/passwordReset.tsx` — React Email template for the code email
   - `packages/backend/src/email/passwordChanged.tsx` — confirmation template
3. **Backend routes**
   - `packages/backend/src/passwordReset.ts` — handlers for `request` and `verify`
   - Wire routes into `packages/backend/src/app.ts` under `/auth/password-reset/*`
   - Helper for generating the 6-digit code (extract to `passwordReset.ts` or a shared util)
4. **Backend tests**
   - `packages/backend/src/__tests__/passwordReset.test.ts` covering the cases listed above
5. **Frontend authClient**
   - Add `requestPasswordReset` and `confirmPasswordReset` to `packages/frontend/src/auth/authClient.ts`
6. **Frontend screens**
   - `packages/frontend/app/auth/forgot.tsx` + `.web.tsx` (two-step state machine)
   - "Forgot password?" link on `auth.tsx` / `auth.web.tsx`
7. **E2E test**
   - Extend `tests/auth-flow.spec.ts`
8. **Operational**
   - Verify `chinmayajanata.org` domain in Resend dashboard
   - Set `RESEND_API_KEY` secret on staging Worker (`npx wrangler secret put RESEND_API_KEY --config wrangler.staging.toml`)
   - Set on prod Worker (`npx wrangler secret put RESEND_API_KEY`)
   - Apply migration to staging, then prod, after the implementation merges

### Known limitations / future work

- No CRON to garbage-collect stale `password_reset_codes` rows. They sit forever after expiry. Add a Worker scheduled handler later if the table grows.
- Per-IP rate limiting isn't implemented — only per-user. An attacker can still spam different emails. If abuse appears, add KV-backed IP throttling.
- No "log out everywhere" UI for users; the only thing that increments `token_version` right now is password reset. If we ever add a "sign out all devices" button, it just bumps that column.
