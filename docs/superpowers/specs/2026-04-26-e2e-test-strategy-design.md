# E2E Test Strategy — Phased Rollout

**Date:** 2026-04-26
**Status:** Approved
**Owner:** Kish

## Why

Today the only way to know whether the app still works is to manually click through it. We have a `TESTING_CHECKLIST.md` that lists ~80 manual checks across iOS native, mobile web, and desktop web. We also have a Playwright suite (`tests/`, 5 specs, 554 lines) that exercises landing → signup → 5-step onboarding → home against production only. Beyond auth/onboarding, every feature is verified by hand.

Goal: one command that exercises the app's UI on every platform we ship, so dev iteration becomes "make change → run tests → ship" instead of "make change → click through 80 things and hope."

Scope is happy paths and obvious sad paths. Not visual regression, not load, not exhaustive negative-path coverage.

## Non-Goals

- CI integration (deferred until Phases 1–2 are stable).
- Visual regression (Percy/Chromatic).
- Load / perf testing.
- Replacing `TESTING_CHECKLIST.md` for pre-release manual smoke. The automation augments the checklist, doesn't retire it.
- Real-device cloud farms (BrowserStack, Sauce). Local sim/emulator only.

## Visual Review Artifacts (cross-cutting)

Goal: after a run, Kish can scrub through what each test did without re-running anything. Every E2E test produces:

1. **Step-by-step screenshots.** A helper `step(page, label, fn)` wraps each significant UI action; it runs `fn`, then screenshots `test-results/<spec>/<test>/NN-<label>.png`. Specs use this in place of bare interactions for steps worth reviewing (form fills, button clicks, navigation). Cheap actions (typing into a single field) can be grouped into one labeled step.
2. **Per-test video.** Playwright `video: 'on'` (override the existing `retain-on-failure`). Video saved per test as `.webm`.
3. **Per-test GIF.** Post-run script `scripts/videos-to-gifs.sh` runs `ffmpeg` over each `.webm` → `.gif` at 10fps, max 800px wide. (`ffmpeg` is a new dev-environment dependency; documented in README.)
4. **Review dashboard.** Post-run script `scripts/build-review.mjs` generates `test-results/review.html` — a single page indexing every test with: test name, pass/fail, GIF embedded, link to full video, thumbnail strip of step screenshots. Open with `npm run e2e:review`. Playwright's built-in HTML report (`playwright-report/`) is kept for debugging traces; the review dashboard is the at-a-glance artifact for Kish.
5. **Maestro (Phase 4):** `maestro test --format junit --output ...` plus `--debug-output` produces screenshots and video. Same review dashboard ingests them.

Specs from Phase 2 onward MUST use the `step()` helper for every UI action that's worth seeing in review. Existing Phase-1 specs get retrofitted as part of Phase 1 implementation so the review artifact is useful from day one.

## Phases

Each phase produces a working artifact and is independently shippable. Phases are sequenced so later phases reuse infrastructure built earlier.

### Phase 1 — Local-dev target + run existing suite + review artifacts

**Outcome:** `npm run e2e:local` boots backend + frontend on localhost, runs the existing 5 specs (retrofitted with `step()` helper), tears everything down, generates the review dashboard. `npm run e2e:review` opens the dashboard. Run completes in ~3 minutes.

**Changes:**
1. `playwright.config.ts`: already honors `E2E_BASE_URL`. Change `video: 'retain-on-failure'` → `video: 'on'`. Add `screenshot: 'on'` (was `only-on-failure`).
2. Add `tests/helpers/step.ts` exporting `step(page, label, fn)` — runs fn, then screenshots into the per-test results dir with monotonic numeric prefix.
3. Retrofit existing 5 specs to use `step()` for the meaningful actions (form fills, clicks, nav). Keep test names + assertions identical.
4. Add npm scripts at repo root:
   - `e2e:local` — wipes local D1, starts `npm run dev` in background, polls until backend `/api/health` and frontend (port 8081) are both reachable, runs Playwright with `E2E_BASE_URL=http://localhost:8081`, runs `videos-to-gifs.sh` + `build-review.mjs`, kills background processes on exit (trap-on-exit).
   - `e2e:prod` — runs Playwright against the existing prod baseURL (no DB reset, no background dev).
   - `e2e:review` — opens `test-results/review.html` in default browser.
   - `e2e` — alias for `e2e:local`.
5. Reset script: `scripts/reset-local-db.sh` — drops + recreates local D1, applies all migrations, re-seeds. Called by `e2e:local` before each run.
6. Artifact scripts:
   - `scripts/videos-to-gifs.sh` — finds all `.webm` under `test-results/`, runs ffmpeg → `.gif` (10fps, max 800px wide).
   - `scripts/build-review.mjs` — reads Playwright JSON reporter output + filesystem, emits `test-results/review.html`.
7. Add JSON reporter to `playwright.config.ts` so `build-review.mjs` has structured input.
8. `.gitignore`: ensure `test-results/` and `playwright-report/` are ignored (verify, add if missing).
9. README: "Running E2E tests" section — the four commands, ffmpeg dependency, where artifacts land, how to debug a single spec.

**Test data:** local D1 starts empty + seeded centers. Specs create their own users and clean up. Hard reset before each run is acceptable per scope decision.

### Phase 2 — Web feature coverage

**Outcome:** Specs cover the rest of the app's web surface. `npm run e2e:local` runs the full suite in ~5–10 min.

**Shared helpers:** Extract from `live-walkthrough.spec.ts` into `tests/helpers/test-user.ts`:
- `createTestUser(page, request)` — signup + complete onboarding, returns `{ email, password, token }`.
- `loginAsUser(page, email, password)` — fast login that skips signup.
- `cleanupTestUser(request, token)` — DELETE `/api/auth/delete-account`.

Each new spec uses these so we don't copy-paste 50 lines of signup boilerplate.

**New specs:**
| File | Covers |
|---|---|
| `discover.spec.ts` | All / Going / Centers tabs, search, week-calendar date filter, "show past events" toggle |
| `event-detail.spec.ts` | Open event from list, RSVP, un-RSVP, "Going" badge appears on home after RSVP, attendee list renders |
| `centers.spec.ts` | Join center, leave center, Going tab reflects membership |
| `profile.spec.ts` | Edit first name, last name, bio, interests; reload page; values persist |
| `settings.spec.ts` | Logout (returns to landing), notification prefs toggle persists |
| `messages.spec.ts` | Post message on event, see it appear, delete own message |

**Rules each spec follows:**
- One describe block per feature area.
- Serial mode within describe (state flows between tests).
- `afterAll` always cleans up created users.
- Timestamp-prefixed emails: `e2e_<area>_${Date.now()}@test.janata.dev`.
- Network assertions where they add signal (e.g., assert `POST /api/events/:id/rsvp` returns 200, not just "the UI doesn't crash").
- Every meaningful UI action is wrapped in `step(page, '<label>', async () => { ... })` so the review dashboard has labeled screenshots end-to-end.

**Out of scope for Phase 2:** account deletion E2E (handled in cleanup), map interactions (deferred — flaky against MapLibre tile loading, manual smoke is fine), notification *delivery* (only prefs toggle).

### Phase 3 — Mobile-web viewport

**Outcome:** Same suite runs against an iPhone-15 viewport in addition to desktop. Catches "broken on phone" regressions automatically.

**Changes:**
1. Add second project to `playwright.config.ts`:
   ```ts
   projects: [
     { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
     { name: 'mobile-safari', use: { ...devices['iPhone 15'] } },
   ]
   ```
2. Tag specs:
   - Default: spec runs on both projects.
   - Mobile-only specs (e.g., bottom-tab nav, sheet behavior, hamburger menu): `test.describe('@mobile ...')` + filter via `--grep @mobile`.
   - Desktop-only specs (e.g., side-by-side map+list panel): `@desktop`.
3. Audit existing + Phase-2 specs and tag any that have viewport-dependent selectors (the live-walkthrough, for instance, may need `@desktop` if its layout assumptions break on mobile — verify during implementation).

**Caveat documented in README:** Playwright's "iPhone 15" device profile is viewport + UA emulation, not real Safari. Catches responsive/layout regressions, doesn't catch true mobile-Safari touch or rendering bugs. Real-Safari testing remains a manual pre-release step.

### Phase 4 — iOS native (Maestro) — lowest priority

**Outcome:** `npm run e2e:ios` runs 3 happy-path flows against the iOS simulator using Maestro.

**Why Maestro over Detox:** YAML flows, no native build modifications, runs on simulator + real devices, dramatically lower maintenance cost. Detox is more powerful but unnecessary for happy-path coverage. If we later need precise assertions inside RN internals, we revisit.

**Changes:**
1. Install Maestro CLI (`curl -Ls "https://get.maestro.mobile.dev" | bash`), document the install step.
2. Create `.maestro/` directory with three flows:
   - `signup-onboarding.yaml` — mirrors `live-walkthrough.spec.ts` 1–3.
   - `discover-and-rsvp.yaml` — login + RSVP to event.
   - `profile-edit.yaml` — login + edit + verify persistence.
3. Add npm script `e2e:ios`:
   - Assumes app is already built and running on the iOS sim (`npm run ios` separately).
   - Boots local backend if not already running.
   - Runs `maestro test .maestro/ --format junit --debug-output test-results/maestro/`.
4. Test users: same timestamp pattern, cleanup via API call from a YAML `runScript` step.
5. Maestro flows use `takeScreenshot` after each meaningful action (label included in filename) — equivalent of the `step()` helper for web. Maestro automatically records a per-flow video in debug-output mode.
6. Extend `scripts/build-review.mjs` to ingest Maestro's `test-results/maestro/` (screenshots + video) into the same dashboard. Each flow appears alongside web specs.

**Open question deferred to implementation:** how to point the iOS sim app at `localhost` vs prod. Likely an env-driven config in `app.json` or `EXPO_PUBLIC_API_URL`. Decide during Phase 4 planning.

**Explicit non-coverage:** map, notifications, deep links, share sheet. Manual smoke for those before each native release.

## Cross-Phase Decisions

1. **Local backend = `npm run dev`** (Wrangler dev + Expo). No separate test backend. Hard reset of local D1 before each E2E run is acceptable.
2. **Test users:** timestamp-prefixed emails like `e2e_<area>_${Date.now()}@test.janata.dev`. `afterAll` cleanup is mandatory. If cleanup fails, log the email so we can manually purge.
3. **Network assertions** are preferred over UI-only assertions when feasible — asserts on `response.ok()` for the API call behind a UI action give cleaner failure messages than "button click didn't update DOM."
4. **Failure artifacts:** keep Playwright's defaults — screenshot on failure, video retain-on-failure, trace on first retry. Stored in `playwright-report/` (already gitignored — verify in implementation).
5. **Spec independence:** any spec must be runnable in isolation (`npx playwright test tests/profile.spec.ts`). If it depends on another spec's data, it's wrong.

## Risks

- **Phase 1 startup race:** dev server takes variable time to be ready. Mitigation: poll `/api/health` and the frontend port with timeout, fail fast if not up in 60s.
- **Local D1 reset destroys in-progress dev work.** Mitigation: `e2e:local` prints a clear warning before resetting; `e2e:local:no-reset` variant for when developers want to test against current local state.
- **Phase 2 spec flakiness from Expo dev-server hot reload.** Mitigation: serial mode within describe, generous `waitForLoadState('networkidle')`, retries=1 in non-CI.
- **Phase 4 sim startup is slow.** Mitigation: assume sim is already running (don't try to manage it from npm script). Doc this clearly.
- **Cleanup failures leak test users into local D1.** Acceptable — local D1 gets reset on next run anyway. For prod runs, monitor for accumulation; add a periodic sweep script if it becomes a problem.

## Success Criteria

Per phase:
- **Phase 1:** `npm run e2e:local` exits 0 against a clean local checkout. Existing 5 specs all pass. `npm run e2e:review` opens a dashboard showing labeled step screenshots + GIF + video for every test.
- **Phase 2:** All Phase 2 specs pass against local. Total wall-clock under 10 min. Review dashboard includes every new test with end-to-end labeled screenshots + GIF.
- **Phase 3:** Full suite runs on both `chromium` and `mobile-safari` projects. At least 80% of specs pass on both (some viewport-dependent failures expected and tagged). Review dashboard distinguishes desktop and mobile runs side-by-side per spec.
- **Phase 4:** All 3 Maestro flows pass against iOS sim with locally-running backend. Maestro screenshots + video appear in the same review dashboard as the web specs.

## What this spec does NOT decide

- CI runner (GitHub Actions config) — separate spec when we're ready.
- Cadence of running the suite (pre-commit? pre-PR? on-demand?) — establish with usage.
- Whether to keep `TESTING_CHECKLIST.md` long-term or migrate fully to E2E — punt.
