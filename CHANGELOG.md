# Changelog

## Merge Batch — February 27, 2026

### Merge Order & Status

| Order | PR | Title | Scope | Status |
|-------|-----|-------|-------|--------|
| 1 | [#8](https://github.com/Project-Janatha/Project-Janatha/pull/8) | Fix center ID generation to use UUID instead of numeric ID | Backend | Merged |
| 2 | [#9](https://github.com/Project-Janatha/Project-Janatha/pull/9) | Add API service layer and wire Home/Explore to live data | Frontend | Merged |
| 3 | [#12](https://github.com/Project-Janatha/Project-Janatha/pull/12) | Fix circular import and hooks violation in home web layout | Frontend | Merged |
| 4 | [#13](https://github.com/Project-Janatha/Project-Janatha/pull/13) | Wire onboarding completion to backend API | Frontend | Merged |
| 5 | [#14](https://github.com/Project-Janatha/Project-Janatha/pull/14) | Fix center detail page rendering and wire to live data | Frontend | Merged |
| 6 | [#15](https://github.com/Project-Janatha/Project-Janatha/pull/15) | Wire event registration buttons to backend API | Frontend | Merged |
| 7 | [#16](https://github.com/Project-Janatha/Project-Janatha/pull/16) | Add dedicated My Events list page | Frontend | Merged |
| — | [#10](https://github.com/Project-Janatha/Project-Janatha/pull/10) | Wire event detail page to live backend data | Frontend | Closed (superseded by #15) |
| — | [#11](https://github.com/Project-Janatha/Project-Janatha/pull/11) | Build profile/settings pages and fix UI polish issues | Frontend | Closed (redundant — changes covered by #12–#16) |

### PR Details

#### PR #8 — Fix center ID generation to use UUID (Backend)
- Replaces numeric random IDs with UUID v4 strings in `packages/backend/profiles/center.js`
- Fixes infinite loop bug in the uniqueness-check while loop
- Aligns ID format with DynamoDB schema expectations

#### PR #9 — Add API service layer and wire Home/Explore to live data (Frontend)
- New `utils/api.ts`: typed fetch helpers, platform-aware base URL, 15s timeout, auth support
- New `hooks/useApiData.ts`: `useMapPoints`, `useEventList`, `useEventDetail`, `useWeekCalendar` hooks with sample data fallback
- Replaces hardcoded data in `explore.tsx`, `index.tsx`, `index.web.tsx` with hook calls
- Removes Toast notifications from navigation handlers

#### PR #12 — Fix circular import and hooks violation in home web layout (Frontend)
- Fixes circular import: `index.web.tsx` no longer imports from `./index`
- Fixes React hooks rules violation: moves hook calls above conditional returns
- New `EventCard.tsx` component with `compact`/`full` variants
- Extracts shared event card rendering logic from home screens

#### PR #13 — Wire onboarding completion to backend API (Frontend)
- `OnboardingProvider.tsx`: POSTs profile data to `/api/auth/complete-onboarding`
- Adds `isSubmitting`/`submitError` state to onboarding flow
- "Get Started" button shows spinner during submission, error message on failure
- Updates `UserContext` with `profileComplete: true` on success

#### PR #14 — Fix center detail page rendering and wire to live data (Frontend)
- Fixes critical bug: center detail page had no `return` statement (rendered blank)
- New `useCenterDetail` hook for fetching center + associated events
- Dynamic calendar replacing hardcoded "August 2025" grid
- Extracts `CalendarView` and `CenterEventCard` as proper components

#### PR #15 — Wire event registration buttons to backend API (Frontend)
- `toggleRegistration` with optimistic local state + `updateEvent` API call
- `isToggling` loading indicator on Attend/Cancel buttons
- Error alert on registration failure
- New API functions: `updateEvent`, `getUserEvents`

#### PR #16 — Add dedicated My Events list page (Frontend)
- New `app/events/index.tsx` page showing registered events
- `useMyEvents` hook with loading, empty state, pull-to-refresh
- Route registration in `_layout.tsx` for `events/index`

### Merge Strategy

Each PR after #9 was rebased onto the updated `main` before merging to resolve cherry-pick duplicates cleanly. PR #16 required manual conflict resolution in `utils/api.ts` and `hooks/useApiData.ts` to preserve both `useCenterDetail` (from #14) and `useMyEvents` (from #16).

### Dependencies

```
PR #8  (independent)
PR #9  ← foundation for all frontend PRs
PR #12 ← depends on #9 (shared API layer)
PR #13 ← depends on #9 (shared API layer)
PR #14 ← depends on #9 (shared API layer + adds useCenterDetail)
PR #15 ← depends on #9 (shared API layer + adds registration)
PR #16 ← depends on #15 (uses getUserEvents)
```
