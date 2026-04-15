# Public explore page and frictionless event sign-up

## Goal

Make the explorer/map page publicly accessible without authentication. Only require auth when a user tries to attend an event. Replace the profile button with Login/Sign Up for unauthenticated visitors.

This is the highest-priority item for the Guha pilot: he'll share event links via WhatsApp, and recipients need to browse without creating an account first.

## Current state

- `_layout.tsx` redirects all unauthenticated users to `/landing` (lines 87-92)
- `(tabs)/_layout.tsx` HeaderRight already renders a "Log In" button when `user` is null (lines 45-52)
- All read endpoints (`/centers`, `/fetchAllEvents`, `/fetchEvent`, `/fetchCenter`, `/getEventUsers`) use `apiFetch` (no auth header). Backend doesn't require auth for these. No backend changes needed.
- Write endpoints (`/attendEvent`, `/unattendEvent`) use `authFetch` and require a token. Backend returns 401 without one.
- `events/[id].web.tsx` register button silently no-ops when user is null (`user?.username && toggleRegistration(...)`)
- `center/[id].web.tsx` has no auth-dependent actions

## Changes

### 1. Open the auth guard in `_layout.tsx`

**File:** `packages/frontend/app/_layout.tsx` (lines 87-92)

Current logic redirects unauthenticated users to `/landing` unless they're on `/auth`, `/landing`, `/privacy`, `/terms`, or `/cookies`.

Change: also allow `/(tabs)` (the explore page), `/events/[id]`, and `/center/[id]` through without auth.

```typescript
if (!isAuthenticated) {
  // Allow public pages through without redirect
  const isPublicPage =
    inAuthGroup ||
    inLandingPage ||
    pathname === '/' ||
    pathname.startsWith('/(tabs)') ||
    pathname.startsWith('/events/') ||
    pathname.startsWith('/center/') ||
    pathname.startsWith('/privacy') ||
    pathname.startsWith('/terms') ||
    pathname.startsWith('/cookies')

  if (!isPublicPage) {
    router.replace('/landing')
  }
}
```

### 2. Add Login + Sign Up buttons to the header

**File:** `packages/frontend/app/(tabs)/_layout.tsx` (lines 44-53)

The `HeaderRight` component already shows a "Log In" button when `!user`. Update it to show both Login and Sign Up as separate buttons, matching the app's existing style.

```typescript
if (!user) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginRight: 16 }}>
      <SecondaryButton
        onPress={() => router.push('/auth?mode=login')}
        style={{ paddingHorizontal: 12, paddingVertical: 8 }}
      >
        Log In
      </SecondaryButton>
      <PrimaryButton
        onPress={() => router.push('/auth?mode=signup')}
        style={{ paddingHorizontal: 12, paddingVertical: 8 }}
      >
        Sign Up
      </PrimaryButton>
    </View>
  )
}
```

### 3. Auth prompt when unauthenticated user clicks "Attend Event"

**Files:** `packages/frontend/app/events/[id].web.tsx`, `packages/frontend/app/(tabs)/index.web.tsx`

When an unauthenticated user taps "Register" / "Attend Event", show a modal or inline prompt:

> "Create an account to attend this event"
> [Sign Up] [Log In]

Implementation:
- Add an `AuthPromptModal` component (reusable across event detail views)
- When `!user` and register is pressed, show the modal instead of calling `toggleRegistration`
- Both buttons navigate to `/auth?mode=login` or `/auth?mode=signup` with a `returnTo` query param encoding the current event URL

```typescript
// AuthPromptModal.tsx (new component)
function AuthPromptModal({ visible, onClose, eventTitle }: Props) {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Sign up to attend</Text>
          <Text style={styles.body}>
            Create an account to register for {eventTitle}
          </Text>
          <PrimaryButton onPress={() => {
            onClose()
            router.push(`/auth?mode=signup&returnTo=${encodeURIComponent(pathname)}`)
          }}>
            Sign Up
          </PrimaryButton>
          <SecondaryButton onPress={() => {
            onClose()
            router.push(`/auth?mode=login&returnTo=${encodeURIComponent(pathname)}`)
          }}>
            Log In
          </SecondaryButton>
          <Pressable onPress={onClose}>
            <Text>Maybe later</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}
```

### 4. Pass `returnTo` through the auth flow

**File:** `packages/frontend/app/auth.web.tsx`

- Read `returnTo` from URL search params on mount
- After successful login or signup, redirect to `returnTo` instead of the default route
- The `_layout.tsx` auth guard (step 1) will handle the rest of the routing normally

```typescript
const params = useLocalSearchParams<{ mode?: string; returnTo?: string }>()

// After successful login/signup:
if (params.returnTo) {
  router.replace(params.returnTo)
} else {
  // existing default redirect behavior
}
```

### 5. Handle post-signup onboarding for the simplified flow

Currently after signup the user gets redirected to `/onboarding` (full form: name, DOB, center, interests). For the frictionless flow, we want a lighter path:

- After signup via `returnTo` flow, redirect to a minimal onboarding step that only asks for first name and last name
- Once name is provided, mark `profileComplete: true` and redirect to `returnTo`
- The full onboarding form remains available from the profile/settings page

Implementation options (pick one during development):
- **Option A (simpler):** Skip onboarding entirely after signup. Let `_layout.tsx` redirect to onboarding as normal, but add a "Skip for now" button to the onboarding screen that sets a minimal profile and redirects to `returnTo`.
- **Option B (better UX):** Add a `minimal` query param to onboarding that shows only the name fields with a streamlined UI, then redirects to `returnTo`.

Recommend Option A for the first pass. It reuses existing onboarding without modifications and just adds a skip path.

### 6. Conditional UI elements for unauthenticated users

**File:** `packages/frontend/app/(tabs)/index.web.tsx`

Review the main explore page for elements that assume a logged-in user:
- Event cards with "Going" badges: hide `isRegistered` state when no user (already handled, `isRegistered` would be undefined/false)
- "Create Event" button in header: already gated behind `canCreate` which checks `isSuperAdmin(user)`, returns false for null user
- Any `useUser()` calls that might throw: `useUser()` throws if outside `UserProvider`, but it's always inside one. When `user` is null, it works fine.

No changes needed for the main explore page data loading. The hooks use `apiFetch` which doesn't send auth headers.

## Files to modify

| File | Change |
|------|--------|
| `app/_layout.tsx` | Open auth guard for public pages |
| `app/(tabs)/_layout.tsx` | Login + Sign Up buttons for unauthenticated users |
| `app/events/[id].web.tsx` | Auth prompt on register click when not logged in |
| `app/(tabs)/index.web.tsx` | Auth prompt on attend click in event detail panel |
| `app/auth.web.tsx` | Accept `returnTo` param, redirect after auth |
| `app/onboarding.tsx` | Add "Skip for now" button that sets minimal profile |
| `components/ui/AuthPromptModal.tsx` | New shared component for auth prompt |

## What stays the same

- Backend: no changes. Read endpoints are already public, write endpoints already require auth.
- Mobile native app: auth guard changes use pathname checks that won't affect the native routing since native users go through a different flow.
- Landing page: still the default for paths that aren't explicitly public.
- Full onboarding: still exists, still works the same for users who don't skip.

## Testing plan

- [ ] Visit `localhost:8081` without logging in. Should see the explore page with map and event/center list.
- [ ] Click an event card. Event detail should load with all data visible.
- [ ] Click "Register" on an event. Auth prompt modal should appear.
- [ ] Click "Sign Up" in the modal. Should go to `/auth?mode=signup&returnTo=/events/123`.
- [ ] Complete signup. Should redirect back to the event page.
- [ ] Click "Register" again (now logged in). Should work normally.
- [ ] Visit a center detail page without login. Should load and show all data.
- [ ] Visit `/admin` without login. Should redirect to `/landing`.
- [ ] Visit `/settings` without login. Should redirect to `/landing`.
- [ ] Share an event URL. Opening it in an incognito window should show the event, not the landing page.
