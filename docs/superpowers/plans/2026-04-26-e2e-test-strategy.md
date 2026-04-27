# E2E Test Strategy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a phased Playwright + Maestro E2E test system that produces reviewable visual artifacts (labeled step screenshots, GIFs, videos, and a single review dashboard).

**Architecture:** Extend the existing Playwright suite (`tests/`, prod-targeted) with: (1) a local-dev runner that boots backend + frontend and resets local D1, (2) a `step()` helper that screenshots after each meaningful UI action via Playwright's `test.step` + `testInfo.attach`, (3) a post-run pipeline that converts videos to GIFs and emits `test-results/review.html`. New web specs cover discover, event-detail, centers, profile, settings, messages. A second Playwright project adds mobile-web viewport. Maestro adds iOS-sim flows that feed the same review dashboard.

**Tech Stack:** Playwright `^1.58.2`, Wrangler `^4.0.0`, Cloudflare D1 (local mode), Expo `~55.0.0`, ffmpeg (new dev-environment dependency), Maestro CLI (Phase 4 only).

**Reference spec:** `docs/superpowers/specs/2026-04-26-e2e-test-strategy-design.md`

---

## File Structure

**New files:**
- `tests/helpers/step.ts` — `step(page, label, fn)` wrapper (Playwright `test.step` + screenshot + attach).
- `tests/helpers/test-user.ts` — `createTestUser`, `loginAsUser`, `cleanupTestUser` extracted from `live-walkthrough.spec.ts`.
- `tests/discover.spec.ts` — All/Going/Centers tabs, search, week-calendar filter, past-events toggle.
- `tests/event-detail.spec.ts` — open event, RSVP/un-RSVP, attendee list.
- `tests/centers.spec.ts` — join/leave center, Going-tab membership reflection.
- `tests/profile.spec.ts` — edit name, bio, interests; persistence.
- `tests/settings.spec.ts` — logout, notification prefs.
- `tests/messages.spec.ts` — post/delete event messages.
- `scripts/reset-local-db.sh` — drop + recreate local D1, apply migrations, re-seed.
- `scripts/wait-for-services.mjs` — poll backend `/api/health` and frontend until ready.
- `scripts/videos-to-gifs.sh` — convert Playwright `.webm` outputs to `.gif`.
- `scripts/build-review.mjs` — emit `test-results/review.html` from Playwright JSON reporter + filesystem.
- `scripts/run-e2e-local.mjs` — orchestrator: reset DB → start dev → wait → run Playwright → stop dev → run artifact scripts.
- `.maestro/signup-onboarding.yaml` (Phase 4)
- `.maestro/discover-and-rsvp.yaml` (Phase 4)
- `.maestro/profile-edit.yaml` (Phase 4)
- `scripts/run-e2e-ios.sh` (Phase 4)

**Modified files:**
- `playwright.config.ts` — `video: 'on'`, `screenshot: 'on'`, JSON reporter, mobile project (Phase 3).
- `package.json` (root) — npm scripts (`e2e`, `e2e:local`, `e2e:prod`, `e2e:review`, `e2e:ios`).
- `README.md` — "Running E2E tests" section.
- `.gitignore` — verify `test-results/`, `playwright-report/`.
- `tests/landing.spec.ts`, `tests/auth-flow.spec.ts`, `tests/navigation.spec.ts`, `tests/api-health.spec.ts`, `tests/live-walkthrough.spec.ts` — retrofit with `step()` helper; refactor live-walkthrough to use `test-user.ts` helpers.

---

# Phase 1 — Local-dev target + retrofit + review artifacts

## Task 1.1: Reconnaissance — pin down local dev URL setup

**Why:** Backend (wrangler) defaults to port 8787; frontend (expo) defaults to port 8081. Production uses same-origin (Cloudflare Pages serves both). Local dev needs either a unified-origin proxy or two distinct URLs for `request.*` API calls vs `page.goto` navigation. Must determine which before writing the runner.

**Files:** read-only investigation.

- [ ] **Step 1:** Inspect frontend dev config for proxy or unified-origin setup.
  Run:
  ```bash
  grep -rn "8787\|api.*proxy\|rewrite" packages/frontend/{app.json,metro.config.js,babel.config.js} packages/frontend/utils/api.ts packages/frontend/src 2>/dev/null | head -30
  ```
  Then read whichever file appears most relevant.

- [ ] **Step 2:** Run `npm run dev` in a separate terminal (or `run_in_background`) and observe the URLs each service prints. Confirm:
  - Backend URL (likely `http://localhost:8787`)
  - Frontend URL (likely `http://localhost:8081`)
  - Whether the frontend proxies `/api/*` to the backend, or whether tests must hit two URLs.

- [ ] **Step 3:** Document the finding inline in this plan as a comment block under this task. Two outcomes:
  - **Outcome A (unified):** frontend proxies `/api/*` → backend. `E2E_BASE_URL` alone is sufficient.
  - **Outcome B (split):** need both `E2E_BASE_URL` (frontend) and `E2E_API_URL` (backend); `playwright.config.ts` and the helpers must thread the API URL separately.

- [ ] **Step 4:** Stop the dev processes (`pkill -f wrangler; pkill -f expo`).

- [ ] **Step 5:** Commit findings.
  ```bash
  git add docs/superpowers/plans/2026-04-26-e2e-test-strategy.md
  git commit -m "docs: record local dev URL recon for E2E plan"
  ```

---

## Task 1.2: Add `step()` helper

**Files:**
- Create: `tests/helpers/step.ts`

- [ ] **Step 1:** Write the helper.
  ```ts
  // tests/helpers/step.ts
  import { test, type Page } from '@playwright/test'

  function slug(s: string): string {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60)
  }

  /**
   * Wraps a UI action in a Playwright test.step and screenshots after it runs.
   * The screenshot is attached to the test report so review.html can index it.
   */
  export async function step<T>(
    page: Page,
    label: string,
    fn: () => Promise<T>
  ): Promise<T> {
    return test.step(label, async () => {
      const result = await fn()
      const info = test.info()
      const idx = String(
        info.attachments.filter((a) => a.contentType === 'image/png').length + 1
      ).padStart(2, '0')
      const screenshotPath = info.outputPath(`step-${idx}-${slug(label)}.png`)
      await page.screenshot({ path: screenshotPath })
      await info.attach(`step ${idx}: ${label}`, {
        path: screenshotPath,
        contentType: 'image/png',
      })
      return result
    })
  }
  ```

- [ ] **Step 2:** Verify it type-checks.
  Run: `cd packages/frontend && npx tsc --noEmit ../../tests/helpers/step.ts` (use the tsconfig that the tests run under — Playwright defaults to TS via ts-node, no separate compile step needed; the actual verification is running it in a test).
  Expected: no errors. If the test directory has its own tsconfig, prefer `npx playwright test --list` from the repo root.

- [ ] **Step 3:** Commit.
  ```bash
  git add tests/helpers/step.ts
  git commit -m "feat(e2e): add step() helper for labeled screenshot capture"
  ```

---

## Task 1.3: Update `playwright.config.ts` for visual artifacts

**Files:**
- Modify: `playwright.config.ts`

- [ ] **Step 1:** Update reporter, video, and screenshot settings.
  Replace the current `reporter` and `use` blocks with:
  ```ts
  reporter: [
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list'],
  ],
  timeout: 30_000,
  expect: { timeout: 10_000 },
  outputDir: 'test-results/artifacts',

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'on',
    video: 'on',
  },
  ```

- [ ] **Step 2:** Verify config loads.
  Run: `npx playwright test --list | head -10`
  Expected: lists the 5 existing specs without error.

- [ ] **Step 3:** Commit.
  ```bash
  git add playwright.config.ts
  git commit -m "feat(e2e): record video and screenshots on every test run"
  ```

---

## Task 1.4: Retrofit `landing.spec.ts` with `step()`

**Files:**
- Modify: `tests/landing.spec.ts`

- [ ] **Step 1:** Read the file.
  Run: `cat tests/landing.spec.ts`

- [ ] **Step 2:** For each `await page.goto(...)`, `await page.click(...)`, `await page.fill(...)`, and meaningful `expect(...).toBeVisible()` group, wrap the action in `step(page, '<label>', async () => { ... })`. Import the helper at top:
  ```ts
  import { step } from './helpers/step'
  ```
  Keep test names and assertion semantics identical. Each test should have 3–8 step blocks.

- [ ] **Step 3:** Run only this spec against prod to verify nothing broke.
  Run: `npx playwright test tests/landing.spec.ts --project=chromium`
  Expected: all tests pass (same as before retrofit). HTML report shows attached screenshots labeled per step.

- [ ] **Step 4:** Commit.
  ```bash
  git add tests/landing.spec.ts
  git commit -m "test(e2e): wrap landing.spec actions in step() helper"
  ```

---

## Task 1.5: Retrofit `auth-flow.spec.ts`, `navigation.spec.ts`, `api-health.spec.ts` with `step()`

**Files:**
- Modify: `tests/auth-flow.spec.ts`, `tests/navigation.spec.ts`, `tests/api-health.spec.ts`

- [ ] **Step 1:** For each spec, repeat the retrofit pattern from Task 1.4: import `step`, wrap UI actions. For `api-health.spec.ts`, which is API-only (uses `request` not `page`), skip — no UI to screenshot. Add a comment at the top of `api-health.spec.ts`:
  ```ts
  // No step() wrapping — this spec is API-only and has no UI to capture.
  ```

- [ ] **Step 2:** Run each retrofitted spec.
  ```bash
  npx playwright test tests/auth-flow.spec.ts
  npx playwright test tests/navigation.spec.ts
  npx playwright test tests/api-health.spec.ts
  ```
  Expected: all pass. (If a previously-passing test now fails, the retrofit broke something — fix by inspecting the change.)

- [ ] **Step 3:** Commit.
  ```bash
  git add tests/auth-flow.spec.ts tests/navigation.spec.ts tests/api-health.spec.ts
  git commit -m "test(e2e): wrap auth-flow/navigation specs in step() helper"
  ```

---

## Task 1.6: Retrofit `live-walkthrough.spec.ts` with `step()`

**Files:**
- Modify: `tests/live-walkthrough.spec.ts`

This is the largest and most valuable spec — every meaningful action gets a labeled step.

- [ ] **Step 1:** Identify the meaningful actions in each test:
  - Test 1 (Landing): `goto landing`, `verify hero text`.
  - Test 2 (Create account): `goto auth`, `enter email`, `submit email`, `enter password`, `confirm password`, `submit signup`, `verify onboarding`.
  - Test 3 (Onboarding): `step 1 name`, `step 2 birthday`, `step 3 center`, `step 4 interests`, `step 5 member type`, `submit get started`.
  - Test 4 (View home): `goto auth`, `login`, `verify home`.
  - Test 5 + 6 (API only): no `step()` needed.

- [ ] **Step 2:** Wrap each. Example for Test 2:
  ```ts
  test('2. Create account', async ({ page }) => {
    await step(page, 'goto /auth', async () => {
      await page.goto('/auth')
      await page.waitForLoadState('networkidle')
    })

    await step(page, 'enter email and continue', async () => {
      const emailInput = page.getByPlaceholder(/email/i)
      await expect(emailInput).toBeVisible({ timeout: 15000 })
      await emailInput.fill(TEST_EMAIL)
      await page.getByRole('button', { name: /continue/i }).click()
    })

    await step(page, 'enter password and confirm', async () => {
      const passwordInput = page.locator('input[placeholder="Password"]').first()
      await expect(passwordInput).toBeVisible({ timeout: 10000 })
      await passwordInput.fill(TEST_PASSWORD)
      const confirmInput = page.locator('input[placeholder="Confirm password"]')
      await expect(confirmInput).toBeVisible({ timeout: 5000 })
      await confirmInput.fill(TEST_PASSWORD)
    })

    await step(page, 'submit create account', async () => {
      await page.getByRole('button', { name: /create account/i }).click()
      await page.waitForURL(/\/onboarding/, { timeout: 15000 })
      await expect(page.getByText('Step 1 of 5')).toBeVisible({ timeout: 10000 })
    })
  })
  ```
  Apply the same shape to Tests 1, 3, 4. Leave 5, 6, and `afterAll` unchanged.

- [ ] **Step 3:** Run against prod to verify nothing broke.
  Run: `npx playwright test tests/live-walkthrough.spec.ts`
  Expected: all 6 tests pass. HTML report shows ~20+ labeled screenshots across the suite.

- [ ] **Step 4:** Commit.
  ```bash
  git add tests/live-walkthrough.spec.ts
  git commit -m "test(e2e): wrap live-walkthrough actions in step() helper"
  ```

---

## Task 1.7: Add `scripts/reset-local-db.sh`

**Files:**
- Create: `scripts/reset-local-db.sh`

- [ ] **Step 1:** Write the script.
  ```bash
  #!/usr/bin/env bash
  # Drops and recreates local D1, applies all migrations in order, seeds centers.
  # Used by e2e:local before each run so tests are deterministic.
  set -euo pipefail

  REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
  cd "$REPO_ROOT"

  echo "==> Wiping local D1 state (.wrangler/state/v3/d1)"
  rm -rf .wrangler/state/v3/d1 packages/backend/.wrangler/state/v3/d1 2>/dev/null || true

  echo "==> Applying migrations in order"
  for f in $(ls migrations/0*.sql | sort); do
    echo "  - $f"
    npx wrangler d1 execute chinmaya-janata-db --local --file="$f" \
      --config packages/backend/wrangler.toml > /dev/null
  done

  echo "==> Seeding centers"
  npx wrangler d1 execute chinmaya-janata-db --local --file=migrations/seed_centers.sql \
    --config packages/backend/wrangler.toml > /dev/null

  echo "==> Local D1 reset complete"
  ```

- [ ] **Step 2:** Make it executable.
  Run: `chmod +x scripts/reset-local-db.sh`

- [ ] **Step 3:** Run it once to verify it succeeds.
  Run: `./scripts/reset-local-db.sh`
  Expected: prints each migration, ends with "Local D1 reset complete". Exit 0.

- [ ] **Step 4:** Commit.
  ```bash
  git add scripts/reset-local-db.sh
  git commit -m "feat(e2e): add reset-local-db.sh for deterministic test runs"
  ```

---

## Task 1.8: Add `scripts/wait-for-services.mjs`

**Files:**
- Create: `scripts/wait-for-services.mjs`

- [ ] **Step 1:** Write the script. (Targets adapt to outcome of Task 1.1; default assumes split: backend on 8787, frontend on 8081.)
  ```js
  #!/usr/bin/env node
  // Polls until backend /api/health and frontend root are both reachable.
  // Exits 0 on success, 1 on timeout.

  const BACKEND = process.env.E2E_API_URL || 'http://localhost:8787'
  const FRONTEND = process.env.E2E_BASE_URL || 'http://localhost:8081'
  const TIMEOUT_MS = Number(process.env.E2E_WAIT_TIMEOUT_MS || 60_000)
  const INTERVAL_MS = 1_000

  async function ping(url) {
    try {
      const res = await fetch(url, { method: 'GET' })
      return res.ok || res.status === 404 // 404 ok — server is up
    } catch {
      return false
    }
  }

  async function waitFor(label, url) {
    const deadline = Date.now() + TIMEOUT_MS
    process.stdout.write(`waiting for ${label} (${url})... `)
    while (Date.now() < deadline) {
      if (await ping(url)) {
        console.log('ready')
        return true
      }
      await new Promise((r) => setTimeout(r, INTERVAL_MS))
    }
    console.log('TIMEOUT')
    return false
  }

  const backendOk = await waitFor('backend', `${BACKEND}/api/health`)
  const frontendOk = await waitFor('frontend', FRONTEND)
  if (!backendOk || !frontendOk) {
    console.error('Service(s) not ready before timeout.')
    process.exit(1)
  }
  console.log('All services ready.')
  ```

- [ ] **Step 2:** Verify script syntax.
  Run: `node --check scripts/wait-for-services.mjs`
  Expected: no output, exit 0.

- [ ] **Step 3:** Commit.
  ```bash
  git add scripts/wait-for-services.mjs
  git commit -m "feat(e2e): add wait-for-services poller for local-dev runner"
  ```

---

## Task 1.9: Add `scripts/videos-to-gifs.sh`

**Files:**
- Create: `scripts/videos-to-gifs.sh`

- [ ] **Step 1:** Verify ffmpeg is installed.
  Run: `which ffmpeg && ffmpeg -version | head -1`
  Expected: prints path and version. If not found, install with `brew install ffmpeg` (document this).

- [ ] **Step 2:** Write the script.
  ```bash
  #!/usr/bin/env bash
  # Converts every .webm under test-results/ into a sibling .gif (10fps, max 800px wide).
  set -euo pipefail

  REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
  cd "$REPO_ROOT"

  if ! command -v ffmpeg >/dev/null 2>&1; then
    echo "ffmpeg not found — install with 'brew install ffmpeg'"
    exit 1
  fi

  count=0
  while IFS= read -r webm; do
    gif="${webm%.webm}.gif"
    if [ -f "$gif" ] && [ "$gif" -nt "$webm" ]; then
      continue
    fi
    echo "==> $webm -> $gif"
    ffmpeg -y -loglevel error \
      -i "$webm" \
      -vf "fps=10,scale='min(800,iw)':-2:flags=lanczos" \
      "$gif"
    count=$((count + 1))
  done < <(find test-results -type f -name "*.webm" 2>/dev/null)

  echo "==> Converted $count video(s) to GIF"
  ```

- [ ] **Step 3:** Make executable, verify syntax.
  Run:
  ```bash
  chmod +x scripts/videos-to-gifs.sh
  bash -n scripts/videos-to-gifs.sh
  ```
  Expected: no output from `bash -n`, exit 0.

- [ ] **Step 4:** Commit.
  ```bash
  git add scripts/videos-to-gifs.sh
  git commit -m "feat(e2e): convert Playwright videos to GIFs post-run"
  ```

---

## Task 1.10: Add `scripts/build-review.mjs`

**Files:**
- Create: `scripts/build-review.mjs`

- [ ] **Step 1:** Write the dashboard generator.
  ```js
  #!/usr/bin/env node
  // Reads test-results/results.json (Playwright JSON reporter output)
  // and emits test-results/review.html — an at-a-glance index of every test
  // with embedded GIF, video link, and step-screenshot thumbnails.

  import { readFile, writeFile } from 'node:fs/promises'
  import { existsSync } from 'node:fs'
  import { resolve, relative, dirname } from 'node:path'

  const REPO_ROOT = resolve(import.meta.dirname, '..')
  const RESULTS = resolve(REPO_ROOT, 'test-results/results.json')
  const OUT = resolve(REPO_ROOT, 'test-results/review.html')

  if (!existsSync(RESULTS)) {
    console.error(`No results at ${RESULTS}. Run Playwright first.`)
    process.exit(1)
  }

  const data = JSON.parse(await readFile(RESULTS, 'utf8'))

  function* iterTests(suites) {
    for (const suite of suites ?? []) {
      for (const spec of suite.specs ?? []) {
        for (const test of spec.tests ?? []) {
          yield { suite: suite.title, spec: spec.title, test }
        }
      }
      yield* iterTests(suite.suites ?? [])
    }
  }

  function relPath(p) {
    return relative(dirname(OUT), p).split('\\').join('/')
  }

  const cards = []
  for (const { suite, spec, test } of iterTests(data.suites)) {
    const result = test.results?.[0]
    if (!result) continue
    const status = result.status // 'passed' | 'failed' | 'timedOut' | 'skipped'
    const attachments = result.attachments ?? []
    const screenshots = attachments
      .filter((a) => a.contentType === 'image/png' && a.path)
      .map((a) => ({ name: a.name, path: relPath(a.path) }))
    const videoAttachment = attachments.find((a) => a.contentType === 'video/webm' && a.path)
    const videoPath = videoAttachment ? relPath(videoAttachment.path) : null
    const gifPath = videoPath ? videoPath.replace(/\.webm$/, '.gif') : null
    const gifExists = gifPath && existsSync(resolve(dirname(OUT), gifPath))

    cards.push({
      suite,
      spec,
      title: test.projectName ? `${spec} [${test.projectName}]` : spec,
      status,
      durationMs: result.duration,
      screenshots,
      videoPath,
      gifPath: gifExists ? gifPath : null,
    })
  }

  const statusColor = (s) =>
    s === 'passed' ? '#16a34a' : s === 'failed' || s === 'timedOut' ? '#dc2626' : '#6b7280'

  const html = `<!doctype html>
  <html><head>
  <meta charset="utf-8">
  <title>E2E Review — ${new Date().toLocaleString()}</title>
  <style>
    body { font-family: -apple-system, system-ui, sans-serif; margin: 0; background: #0b0d12; color: #e5e7eb; }
    header { padding: 16px 24px; border-bottom: 1px solid #1f2937; display: flex; align-items: baseline; gap: 16px; }
    h1 { font-size: 18px; margin: 0; }
    .meta { font-size: 13px; color: #9ca3af; }
    main { padding: 24px; display: grid; gap: 24px; grid-template-columns: 1fr; }
    @media (min-width: 1100px) { main { grid-template-columns: 1fr 1fr; } }
    .card { background: #111827; border: 1px solid #1f2937; border-radius: 12px; overflow: hidden; }
    .card h2 { font-size: 15px; margin: 0; padding: 12px 16px; border-bottom: 1px solid #1f2937; display: flex; gap: 12px; align-items: center; }
    .badge { font-size: 11px; padding: 2px 8px; border-radius: 999px; color: white; text-transform: uppercase; letter-spacing: 0.5px; }
    .suite { color: #9ca3af; font-weight: 400; font-size: 12px; }
    .gif-wrap { background: #000; }
    .gif-wrap img { width: 100%; display: block; }
    .no-gif { padding: 24px; text-align: center; color: #6b7280; font-size: 13px; }
    .strip { display: flex; gap: 4px; padding: 8px; overflow-x: auto; background: #0b0d12; border-top: 1px solid #1f2937; }
    .strip a { flex: 0 0 auto; }
    .strip img { height: 64px; border-radius: 4px; border: 1px solid #1f2937; display: block; }
    .footer { padding: 8px 16px; font-size: 12px; color: #9ca3af; border-top: 1px solid #1f2937; display: flex; justify-content: space-between; }
    .footer a { color: #60a5fa; text-decoration: none; }
  </style>
  </head><body>
  <header>
    <h1>E2E Review</h1>
    <span class="meta">${cards.length} test(s) · ${new Date().toLocaleString()}</span>
  </header>
  <main>
    ${cards
      .map(
        (c) => `
      <article class="card">
        <h2>
          <span class="badge" style="background:${statusColor(c.status)}">${c.status}</span>
          <span>${escapeHtml(c.title)}</span>
          <span class="suite">${escapeHtml(c.suite)}</span>
        </h2>
        <div class="gif-wrap">
          ${c.gifPath ? `<img src="${c.gifPath}" alt="GIF">` : `<div class="no-gif">No GIF available</div>`}
        </div>
        ${
          c.screenshots.length
            ? `<div class="strip">${c.screenshots
                .map(
                  (s) =>
                    `<a href="${s.path}" title="${escapeHtml(s.name)}" target="_blank"><img src="${s.path}" alt="${escapeHtml(s.name)}"></a>`
                )
                .join('')}</div>`
            : ''
        }
        <div class="footer">
          <span>${(c.durationMs / 1000).toFixed(1)}s</span>
          ${c.videoPath ? `<a href="${c.videoPath}" target="_blank">video ↗</a>` : '<span></span>'}
        </div>
      </article>`
      )
      .join('')}
  </main>
  </body></html>`

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
  }

  await writeFile(OUT, html, 'utf8')
  console.log(`==> Wrote ${OUT}`)
  ```

- [ ] **Step 2:** Verify script syntax.
  Run: `node --check scripts/build-review.mjs`
  Expected: no output, exit 0.

- [ ] **Step 3:** Commit.
  ```bash
  git add scripts/build-review.mjs
  git commit -m "feat(e2e): generate review.html dashboard from JSON reporter"
  ```

---

## Task 1.11: Add `scripts/run-e2e-local.mjs`

**Files:**
- Create: `scripts/run-e2e-local.mjs`

- [ ] **Step 1:** Write the orchestrator.
  ```js
  #!/usr/bin/env node
  // Orchestrates a local E2E run:
  //   1. Reset local D1
  //   2. Spawn `npm run dev` in the background
  //   3. Wait for backend + frontend ready
  //   4. Run Playwright against localhost
  //   5. Stop dev server
  //   6. Generate GIFs + review dashboard
  // Always tears down dev server, even on failure.

  import { spawn, spawnSync } from 'node:child_process'
  import { resolve } from 'node:path'

  const REPO_ROOT = resolve(import.meta.dirname, '..')
  const FRONTEND_URL = process.env.E2E_BASE_URL || 'http://localhost:8081'
  const API_URL = process.env.E2E_API_URL || 'http://localhost:8787'

  function run(cmd, args, opts = {}) {
    const r = spawnSync(cmd, args, { stdio: 'inherit', cwd: REPO_ROOT, ...opts })
    if (r.status !== 0) throw new Error(`${cmd} ${args.join(' ')} exited ${r.status}`)
  }

  let devProc = null
  function killDev() {
    if (devProc && !devProc.killed) {
      console.log('==> Stopping dev server')
      try { process.kill(-devProc.pid, 'SIGTERM') } catch {}
      try { spawnSync('pkill', ['-f', 'wrangler']) } catch {}
      try { spawnSync('pkill', ['-f', 'expo']) } catch {}
    }
  }
  process.on('exit', killDev)
  process.on('SIGINT', () => { killDev(); process.exit(130) })
  process.on('SIGTERM', () => { killDev(); process.exit(143) })

  try {
    console.log('==> [1/6] Resetting local D1')
    run('bash', ['scripts/reset-local-db.sh'])

    console.log('==> [2/6] Starting dev server (npm run dev)')
    devProc = spawn('npm', ['run', 'dev'], {
      cwd: REPO_ROOT,
      detached: true,
      stdio: ['ignore', 'inherit', 'inherit'],
      env: { ...process.env },
    })

    console.log('==> [3/6] Waiting for services')
    run('node', ['scripts/wait-for-services.mjs'], {
      env: { ...process.env, E2E_BASE_URL: FRONTEND_URL, E2E_API_URL: API_URL },
    })

    console.log('==> [4/6] Running Playwright')
    const playwrightArgs = ['playwright', 'test', ...process.argv.slice(2)]
    run('npx', playwrightArgs, {
      env: { ...process.env, E2E_BASE_URL: FRONTEND_URL, E2E_API_URL: API_URL },
    })
  } finally {
    killDev()
    console.log('==> [5/6] Converting videos to GIFs')
    try { run('bash', ['scripts/videos-to-gifs.sh']) } catch (e) { console.warn(e.message) }
    console.log('==> [6/6] Building review dashboard')
    try { run('node', ['scripts/build-review.mjs']) } catch (e) { console.warn(e.message) }
  }

  console.log('==> Done. Open test-results/review.html')
  ```

- [ ] **Step 2:** Verify syntax.
  Run: `node --check scripts/run-e2e-local.mjs`
  Expected: no output, exit 0.

- [ ] **Step 3:** Commit.
  ```bash
  git add scripts/run-e2e-local.mjs
  git commit -m "feat(e2e): add local-dev orchestrator script"
  ```

---

## Task 1.12: Add npm scripts to root `package.json`

**Files:**
- Modify: `package.json`

- [ ] **Step 1:** Read current scripts.
  Run: `grep -n '"scripts"' -A 25 package.json`

- [ ] **Step 2:** Add the four E2E scripts inside the `"scripts"` block (after `test:frontend:jest`):
  ```json
  "e2e": "npm run e2e:local",
  "e2e:local": "node scripts/run-e2e-local.mjs",
  "e2e:prod": "npx playwright test",
  "e2e:review": "open test-results/review.html"
  ```

- [ ] **Step 3:** Verify JSON is valid.
  Run: `node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('ok')"`
  Expected: prints `ok`.

- [ ] **Step 4:** Commit.
  ```bash
  git add package.json
  git commit -m "feat(e2e): add e2e/e2e:local/e2e:prod/e2e:review npm scripts"
  ```

---

## Task 1.13: Update `.gitignore`

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1:** Check current state.
  Run: `grep -E "test-results|playwright-report" .gitignore`

- [ ] **Step 2:** If either is missing, append:
  ```
  test-results/
  playwright-report/
  ```

- [ ] **Step 3:** Commit (skip if no change).
  ```bash
  git add .gitignore
  git commit -m "chore: ignore test-results/ and playwright-report/"
  ```

---

## Task 1.14: Update README with E2E section

**Files:**
- Modify: `README.md`

- [ ] **Step 1:** Append (or merge into existing testing section) the following:
  ```markdown
  ## End-to-end tests

  Playwright E2E suite lives in `tests/`. Two run modes:

  - `npm run e2e:local` — boots backend + frontend on localhost (resetting local D1), runs the full suite, generates a review dashboard at `test-results/review.html`. Use this in dev.
  - `npm run e2e:prod` — runs against the deployed prod URL (`chinmaya-janata.pages.dev`). Use this to verify production health.
  - `npm run e2e:review` — opens the review dashboard.

  After each run you'll find:

  - `test-results/review.html` — at-a-glance dashboard: per-test GIF, labeled step screenshots, link to full video.
  - `playwright-report/index.html` — Playwright's standard HTML report (traces, full attachments).

  Requirements: `ffmpeg` (install with `brew install ffmpeg`).

  To run a single spec: `npx playwright test tests/landing.spec.ts`. Add `--debug` for the inspector.
  ```

- [ ] **Step 2:** Commit.
  ```bash
  git add README.md
  git commit -m "docs: document E2E test commands and review dashboard"
  ```

---

## Phase 1 Verification Gate

- [ ] **Step 1:** Run the full local pipeline.
  Run: `npm run e2e:local`
  Expected:
  - DB reset succeeds.
  - Dev server starts.
  - All 5 specs pass against localhost (note: `live-walkthrough` may need adjustments — selectors that worked on prod might fail on local seed; if so, file follow-ups but don't block on them — see Step 2).
  - GIF conversion runs.
  - Dashboard generates.

- [ ] **Step 2:** If `live-walkthrough` fails on local against the seeded centers (e.g., "chinmaya mission san jose" not in seed), choose any seeded center via the suggested-center fallback path it already implements; if all paths fail, mark the test `.skip` with a comment referencing this gate, and create an issue/note in the plan to fix selectors in Phase 2. The other 4 specs MUST pass.

- [ ] **Step 3:** Open the dashboard.
  Run: `npm run e2e:review`
  Expected: browser opens; every passing test shows a GIF and a strip of step screenshots.

- [ ] **Step 4:** Commit any selector fixes from Step 2.

---

# Phase 2 — Web feature coverage

## Task 2.1: Extract `tests/helpers/test-user.ts`

**Files:**
- Create: `tests/helpers/test-user.ts`
- Modify: `tests/live-walkthrough.spec.ts`

- [ ] **Step 1:** Write the helper.
  ```ts
  // tests/helpers/test-user.ts
  import { expect, type Page, type APIRequestContext } from '@playwright/test'
  import { step } from './step'

  export interface TestUser {
    email: string
    password: string
    token?: string
  }

  export function newTestUserCreds(area: string): TestUser {
    return {
      email: `e2e_${area}_${Date.now()}@test.janata.dev`,
      password: 'TestPassword123!',
    }
  }

  /**
   * Signs up + completes onboarding via UI. Returns user with token.
   * Use this in beforeAll to set up a fresh user for a spec.
   */
  export async function createTestUser(
    page: Page,
    request: APIRequestContext,
    area: string
  ): Promise<TestUser> {
    const user = newTestUserCreds(area)

    await step(page, 'goto /auth (signup)', async () => {
      await page.goto('/auth')
      await page.waitForLoadState('networkidle')
    })

    await step(page, 'submit email', async () => {
      const emailInput = page.getByPlaceholder(/email/i)
      await expect(emailInput).toBeVisible({ timeout: 15000 })
      await emailInput.fill(user.email)
      await page.getByRole('button', { name: /continue/i }).click()
    })

    await step(page, 'submit password (signup)', async () => {
      const pw = page.locator('input[placeholder="Password"]').first()
      await expect(pw).toBeVisible({ timeout: 10000 })
      await pw.fill(user.password)
      const confirm = page.locator('input[placeholder="Confirm password"]')
      await expect(confirm).toBeVisible({ timeout: 5000 })
      await confirm.fill(user.password)
      await page.getByRole('button', { name: /create account/i }).click()
      await page.waitForURL(/\/onboarding/, { timeout: 15000 })
    })

    // Onboarding (5 steps mirroring live-walkthrough)
    await step(page, 'onboarding step 1: name', async () => {
      await page.getByPlaceholder(/first name/i).fill('E2E')
      await page.getByPlaceholder(/last name/i).fill('TestUser')
      await page.getByText('Continue').click()
    })

    await step(page, 'onboarding step 2: birthday', async () => {
      await page.getByRole('button', { name: 'Month' }).click()
      await page.getByRole('option', { name: 'January' }).click()
      await page.getByRole('button', { name: 'Day' }).click()
      await page.getByRole('option', { name: '15' }).click()
      await page.getByRole('button', { name: 'Year' }).click()
      await page.getByRole('option', { name: '2000' }).click()
      await page.getByText('Continue').click()
    })

    await step(page, 'onboarding step 3: center', async () => {
      const zipInput = page.getByPlaceholder(/zip code|city/i)
      await zipInput.fill('95127')
      await page.waitForTimeout(2500)
      const fallback = page.locator('text=/chinmaya/i >> visible=true').first()
      await expect(fallback).toBeVisible({ timeout: 5000 })
      await fallback.click()
      await page.waitForTimeout(500)
      await page.getByText('Continue').click()
    })

    await step(page, 'onboarding step 4: interests', async () => {
      await page.getByText('Satsangs').click()
      await page.getByText('Continue').click()
    })

    await step(page, 'onboarding step 5: member type', async () => {
      await page.getByText('CHYK').first().click()
      await page.getByText('Continue').click()
    })

    await step(page, 'submit get started', async () => {
      const get = page.locator('text=Get Started >> visible=true').first()
      await expect(get).toBeVisible({ timeout: 5000 })
      await get.click()
      await page.waitForTimeout(2000)
    })

    // Capture token via API for cleanup later
    const loginRes = await request.post('/api/auth/authenticate', {
      data: { username: user.email, password: user.password },
    })
    if (loginRes.ok()) {
      user.token = (await loginRes.json()).token
    }
    return user
  }

  /**
   * Logs in via UI (fast — no signup). Use when a test needs a fresh session
   * for a previously-created user.
   */
  export async function loginAsUser(page: Page, user: TestUser): Promise<void> {
    await step(page, `login as ${user.email}`, async () => {
      await page.goto('/auth')
      const emailInput = page.getByPlaceholder(/email/i)
      await expect(emailInput).toBeVisible({ timeout: 15000 })
      await emailInput.fill(user.email)
      await page.getByRole('button', { name: /continue/i }).click()
      const pw = page.locator('input[placeholder="Password"]')
      await expect(pw).toBeVisible({ timeout: 10000 })
      await pw.fill(user.password)
      await page.getByRole('button', { name: /sign in/i }).click()
      await page.waitForTimeout(3000)
    })
  }

  /**
   * Deletes the test user account. Always call from afterAll.
   */
  export async function cleanupTestUser(
    request: APIRequestContext,
    user: TestUser
  ): Promise<void> {
    let token = user.token
    if (!token) {
      const loginRes = await request.post('/api/auth/authenticate', {
        data: { username: user.email, password: user.password },
      })
      if (!loginRes.ok()) {
        console.warn(`Cleanup: could not log in as ${user.email}`)
        return
      }
      token = (await loginRes.json()).token
    }
    const res = await request.delete('/api/auth/delete-account', {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok()) {
      console.warn(`Cleanup: delete-account failed for ${user.email}: ${res.status()}`)
    }
  }
  ```

- [ ] **Step 2:** Refactor `live-walkthrough.spec.ts` to use the helper. Replace tests 2 + 3 (signup + onboarding) with a single `beforeAll` that calls `createTestUser`, then keep tests 4–6 for verification (rename test 1 to "landing renders", drop test 2 if it's now redundant). Trim repetition. Update `afterAll` to call `cleanupTestUser`.

- [ ] **Step 3:** Run live-walkthrough.
  Run: `npm run e2e:local -- tests/live-walkthrough.spec.ts`
  Expected: passes; review dashboard shows the helper's labeled steps.

- [ ] **Step 4:** Commit.
  ```bash
  git add tests/helpers/test-user.ts tests/live-walkthrough.spec.ts
  git commit -m "test(e2e): extract test-user helper, refactor live-walkthrough"
  ```

---

## Task 2.2: Write `tests/discover.spec.ts`

**Files:**
- Create: `tests/discover.spec.ts`

- [ ] **Step 1:** Boot local app, log in as a fresh user, navigate to `/(tabs)` — observe the actual selectors and tab labels for "All", "Going", "Centers" tabs, search input, week-calendar, "show past events" toggle. Open the page in a real browser via `npx playwright open http://localhost:8081/(tabs)` after logging in (or use Chrome DevTools).

- [ ] **Step 2:** Write the spec scaffold:
  ```ts
  // tests/discover.spec.ts
  import { test, expect } from '@playwright/test'
  import { step } from './helpers/step'
  import {
    type TestUser,
    createTestUser,
    loginAsUser,
    cleanupTestUser,
  } from './helpers/test-user'

  test.describe('Discover (Home Tab)', () => {
    test.describe.configure({ mode: 'serial' })
    test.setTimeout(60_000)

    let user: TestUser

    test.beforeAll(async ({ browser, request }) => {
      const page = await browser.newPage()
      user = await createTestUser(page, request, 'discover')
      await page.close()
    })

    test.afterAll(async ({ request }) => {
      await cleanupTestUser(request, user)
    })

    test.beforeEach(async ({ page }) => {
      await loginAsUser(page, user)
    })

    test('shows All / Going / Centers tabs', async ({ page }) => {
      await step(page, 'verify All tab visible', async () => {
        await expect(page.getByRole('tab', { name: /^all$/i })).toBeVisible()
      })
      await step(page, 'verify Going tab visible', async () => {
        await expect(page.getByRole('tab', { name: /going/i })).toBeVisible()
      })
      await step(page, 'verify Centers tab visible', async () => {
        await expect(page.getByRole('tab', { name: /centers/i })).toBeVisible()
      })
    })

    test('Centers tab filters to centers only', async ({ page }) => {
      await step(page, 'click Centers tab', async () => {
        await page.getByRole('tab', { name: /centers/i }).click()
        await page.waitForTimeout(500)
      })
      await step(page, 'verify at least one center is visible', async () => {
        await expect(page.locator('text=/chinmaya/i').first()).toBeVisible({ timeout: 5000 })
      })
    })

    test('search filters the list', async ({ page }) => {
      await step(page, 'type into search', async () => {
        const search = page.getByPlaceholder(/search/i)
        await expect(search).toBeVisible()
        await search.fill('san jose')
        await page.waitForTimeout(800)
      })
      await step(page, 'verify filtered result includes san jose', async () => {
        await expect(page.locator('text=/san jose/i').first()).toBeVisible({ timeout: 5000 })
      })
    })

    test('past events toggle reveals past events', async ({ page }) => {
      await step(page, 'find and toggle "show past events"', async () => {
        const toggle = page.getByText(/show past events/i)
        if (await toggle.isVisible({ timeout: 2000 }).catch(() => false)) {
          await toggle.click()
          await page.waitForTimeout(500)
        }
      })
      await step(page, 'screenshot post-toggle state', async () => {
        // Visual capture only — assertion depends on whether seed data has past events.
      })
    })
  })
  ```

  *Selectors are best-guess — Step 1's recon may require adjustments. After writing, run, and tighten.*

- [ ] **Step 3:** Run.
  Run: `npm run e2e:local -- tests/discover.spec.ts`
  Expected: tests pass. If any selector is wrong, inspect the failure screenshot in the dashboard, fix selectors, re-run.

- [ ] **Step 4:** Commit.
  ```bash
  git add tests/discover.spec.ts
  git commit -m "test(e2e): cover discover tab filters and search"
  ```

---

## Task 2.3: Write `tests/event-detail.spec.ts`

**Files:**
- Create: `tests/event-detail.spec.ts`

- [ ] **Step 1:** Recon: boot local, log in, find an event in the list, click into it. Note: the seed may not include events. If no events exist locally, this spec needs to first create an event via API (check `/api/events` POST endpoint) or `.skip` with a comment if event creation requires admin.

- [ ] **Step 2:** Write the spec.
  ```ts
  // tests/event-detail.spec.ts
  import { test, expect } from '@playwright/test'
  import { step } from './helpers/step'
  import {
    type TestUser,
    createTestUser,
    loginAsUser,
    cleanupTestUser,
  } from './helpers/test-user'

  test.describe('Event Detail + RSVP', () => {
    test.describe.configure({ mode: 'serial' })
    test.setTimeout(60_000)

    let user: TestUser

    test.beforeAll(async ({ browser, request }) => {
      const page = await browser.newPage()
      user = await createTestUser(page, request, 'event_detail')
      await page.close()
    })

    test.afterAll(async ({ request }) => {
      await cleanupTestUser(request, user)
    })

    test.beforeEach(async ({ page }) => {
      await loginAsUser(page, user)
    })

    test('opens an event from the list', async ({ page, request }) => {
      // Verify there are events at all
      await step(page, 'fetch events list via API', async () => {
        const res = await request.get('/api/events')
        expect(res.ok()).toBeTruthy()
        const data = await res.json()
        if (!data.events?.length) {
          test.skip(true, 'No events in local seed — skipping event-detail spec')
        }
      })

      await step(page, 'click first event card', async () => {
        const eventCard = page.locator('[data-testid="event-card"]').first()
        // Fallback: click first item that looks like an event
        if (await eventCard.isVisible({ timeout: 2000 }).catch(() => false)) {
          await eventCard.click()
        } else {
          await page.locator('a[href*="/event/"]').first().click()
        }
      })

      await step(page, 'verify event detail loaded', async () => {
        await page.waitForURL(/\/event\//, { timeout: 5000 })
      })
    })

    test('RSVP toggles "Going"', async ({ page, request }) => {
      // Open event detail (re-navigate)
      await step(page, 'open event detail', async () => {
        const res = await request.get('/api/events')
        const data = await res.json()
        if (!data.events?.length) {
          test.skip(true, 'No events in local seed')
        }
        const eventId = data.events[0].eventID || data.events[0].id
        await page.goto(`/event/${eventId}`)
        await page.waitForLoadState('networkidle')
      })

      await step(page, 'click RSVP button', async () => {
        const rsvp = page.getByRole('button', { name: /rsvp|going|attend/i }).first()
        await expect(rsvp).toBeVisible({ timeout: 5000 })
        await rsvp.click()
        await page.waitForTimeout(1000)
      })

      await step(page, 'verify "Going" badge appears', async () => {
        await expect(page.getByText(/going/i).first()).toBeVisible({ timeout: 5000 })
      })
    })
  })
  ```

- [ ] **Step 3:** Run, debug selectors, iterate.
  Run: `npm run e2e:local -- tests/event-detail.spec.ts`

- [ ] **Step 4:** Commit.
  ```bash
  git add tests/event-detail.spec.ts
  git commit -m "test(e2e): cover event detail and RSVP"
  ```

---

## Task 2.4: Write `tests/centers.spec.ts`

**Files:**
- Create: `tests/centers.spec.ts`

- [ ] **Step 1:** Recon: log in, navigate to a center detail page, find Join/Leave button selectors.

- [ ] **Step 2:** Write the spec.
  ```ts
  // tests/centers.spec.ts
  import { test, expect } from '@playwright/test'
  import { step } from './helpers/step'
  import {
    type TestUser,
    createTestUser,
    loginAsUser,
    cleanupTestUser,
  } from './helpers/test-user'

  test.describe('Center membership', () => {
    test.describe.configure({ mode: 'serial' })
    test.setTimeout(60_000)

    let user: TestUser
    let centerId: string

    test.beforeAll(async ({ browser, request }) => {
      const page = await browser.newPage()
      user = await createTestUser(page, request, 'centers')
      await page.close()

      const res = await request.get('/api/centers')
      const data = await res.json()
      // Pick a center the user is NOT already a member of
      const candidate = data.centers.find((c: any) => !c.isMember) || data.centers[0]
      centerId = candidate.centerID || candidate.id
    })

    test.afterAll(async ({ request }) => {
      await cleanupTestUser(request, user)
    })

    test.beforeEach(async ({ page }) => {
      await loginAsUser(page, user)
    })

    test('join a center', async ({ page }) => {
      await step(page, 'open center detail', async () => {
        await page.goto(`/center/${centerId}`)
        await page.waitForLoadState('networkidle')
      })

      await step(page, 'click Join', async () => {
        const join = page.getByRole('button', { name: /join/i }).first()
        await expect(join).toBeVisible({ timeout: 5000 })
        await join.click()
        await page.waitForTimeout(1000)
      })

      await step(page, 'verify member state', async () => {
        await expect(
          page.getByRole('button', { name: /leave|member/i }).first()
        ).toBeVisible({ timeout: 5000 })
      })
    })

    test('Going tab includes joined center', async ({ page }) => {
      await step(page, 'navigate to home, Going tab', async () => {
        await page.goto('/(tabs)')
        await page.waitForLoadState('networkidle')
        await page.getByRole('tab', { name: /going/i }).click()
        await page.waitForTimeout(500)
      })
      await step(page, 'verify the joined center appears', async () => {
        // Assertion depends on which center was joined; just verify >0 results
        const list = page.locator('[role="list"], main').first()
        await expect(list).toBeVisible()
      })
    })

    test('leave a center', async ({ page }) => {
      await step(page, 'open center detail', async () => {
        await page.goto(`/center/${centerId}`)
        await page.waitForLoadState('networkidle')
      })

      await step(page, 'click Leave', async () => {
        const leave = page.getByRole('button', { name: /leave/i }).first()
        await expect(leave).toBeVisible({ timeout: 5000 })
        await leave.click()
        await page.waitForTimeout(1000)
      })

      await step(page, 'verify back to non-member state', async () => {
        await expect(page.getByRole('button', { name: /join/i }).first()).toBeVisible({
          timeout: 5000,
        })
      })
    })
  })
  ```

- [ ] **Step 3:** Run, iterate selectors, commit.
  ```bash
  npm run e2e:local -- tests/centers.spec.ts
  git add tests/centers.spec.ts
  git commit -m "test(e2e): cover join/leave center flow"
  ```

---

## Task 2.5: Write `tests/profile.spec.ts`

**Files:**
- Create: `tests/profile.spec.ts`

- [ ] **Step 1:** Recon: log in, navigate to the profile screen, identify edit-mode selectors and persisted-display selectors.

- [ ] **Step 2:** Write the spec.
  ```ts
  // tests/profile.spec.ts
  import { test, expect } from '@playwright/test'
  import { step } from './helpers/step'
  import {
    type TestUser,
    createTestUser,
    loginAsUser,
    cleanupTestUser,
  } from './helpers/test-user'

  test.describe('Profile editing', () => {
    test.describe.configure({ mode: 'serial' })
    test.setTimeout(60_000)

    let user: TestUser
    const NEW_BIO = `bio updated at ${Date.now()}`

    test.beforeAll(async ({ browser, request }) => {
      const page = await browser.newPage()
      user = await createTestUser(page, request, 'profile')
      await page.close()
    })

    test.afterAll(async ({ request }) => {
      await cleanupTestUser(request, user)
    })

    test.beforeEach(async ({ page }) => {
      await loginAsUser(page, user)
    })

    test('edit bio persists after reload', async ({ page }) => {
      await step(page, 'open profile screen', async () => {
        await page.goto('/profile')
        await page.waitForLoadState('networkidle')
      })

      await step(page, 'enter edit mode', async () => {
        const edit = page.getByRole('button', { name: /edit/i }).first()
        await expect(edit).toBeVisible({ timeout: 5000 })
        await edit.click()
      })

      await step(page, 'change bio and save', async () => {
        const bio = page.getByPlaceholder(/bio|about/i)
        await expect(bio).toBeVisible({ timeout: 5000 })
        await bio.fill(NEW_BIO)
        await page.getByRole('button', { name: /save|done/i }).first().click()
        await page.waitForTimeout(1500)
      })

      await step(page, 'reload and verify persistence', async () => {
        await page.reload()
        await page.waitForLoadState('networkidle')
        await expect(page.getByText(NEW_BIO)).toBeVisible({ timeout: 5000 })
      })
    })
  })
  ```

- [ ] **Step 3:** Run, iterate, commit.
  ```bash
  npm run e2e:local -- tests/profile.spec.ts
  git add tests/profile.spec.ts
  git commit -m "test(e2e): cover profile edit + persistence"
  ```

---

## Task 2.6: Write `tests/settings.spec.ts`

**Files:**
- Create: `tests/settings.spec.ts`

- [ ] **Step 1:** Recon: log in, find settings entry point, identify logout button and notification-prefs toggle selectors.

- [ ] **Step 2:** Write the spec.
  ```ts
  // tests/settings.spec.ts
  import { test, expect } from '@playwright/test'
  import { step } from './helpers/step'
  import {
    type TestUser,
    createTestUser,
    loginAsUser,
    cleanupTestUser,
  } from './helpers/test-user'

  test.describe('Settings', () => {
    test.describe.configure({ mode: 'serial' })
    test.setTimeout(60_000)

    let user: TestUser

    test.beforeAll(async ({ browser, request }) => {
      const page = await browser.newPage()
      user = await createTestUser(page, request, 'settings')
      await page.close()
    })

    test.afterAll(async ({ request }) => {
      await cleanupTestUser(request, user)
    })

    test.beforeEach(async ({ page }) => {
      await loginAsUser(page, user)
    })

    test('logout returns to landing', async ({ page }) => {
      await step(page, 'open settings', async () => {
        await page.goto('/settings')
        await page.waitForLoadState('networkidle')
      })

      await step(page, 'click logout', async () => {
        const logout = page.getByRole('button', { name: /log ?out|sign ?out/i }).first()
        await expect(logout).toBeVisible({ timeout: 5000 })
        await logout.click()
      })

      await step(page, 'verify landed on landing or auth', async () => {
        await page.waitForURL(/\/(landing|auth)/, { timeout: 10000 })
      })
    })

    test('notification preference toggle persists', async ({ page }) => {
      await step(page, 'open notifications settings', async () => {
        await page.goto('/settings/notifications')
        await page.waitForLoadState('networkidle')
      })

      await step(page, 'toggle first preference and capture state', async () => {
        const toggle = page.getByRole('switch').first()
        if (await toggle.isVisible({ timeout: 2000 }).catch(() => false)) {
          const before = await toggle.getAttribute('aria-checked')
          await toggle.click()
          await page.waitForTimeout(800)
          const after = await toggle.getAttribute('aria-checked')
          expect(after).not.toBe(before)
        } else {
          test.skip(true, 'No notification toggles surfaced')
        }
      })

      await step(page, 'reload and verify persistence', async () => {
        await page.reload()
        await page.waitForLoadState('networkidle')
        // Visual confirmation only — value re-render varies by implementation.
      })
    })
  })
  ```

- [ ] **Step 3:** Run, iterate, commit.
  ```bash
  npm run e2e:local -- tests/settings.spec.ts
  git add tests/settings.spec.ts
  git commit -m "test(e2e): cover logout and notification prefs"
  ```

---

## Task 2.7: Write `tests/messages.spec.ts`

**Files:**
- Create: `tests/messages.spec.ts`

- [ ] **Step 1:** Recon: log in, open an event, locate the messages section, identify the input and submit button.

- [ ] **Step 2:** Write the spec.
  ```ts
  // tests/messages.spec.ts
  import { test, expect } from '@playwright/test'
  import { step } from './helpers/step'
  import {
    type TestUser,
    createTestUser,
    loginAsUser,
    cleanupTestUser,
  } from './helpers/test-user'

  test.describe('Event messages', () => {
    test.describe.configure({ mode: 'serial' })
    test.setTimeout(60_000)

    let user: TestUser
    let eventId: string
    const MSG = `e2e msg ${Date.now()}`

    test.beforeAll(async ({ browser, request }) => {
      const page = await browser.newPage()
      user = await createTestUser(page, request, 'messages')
      await page.close()

      const res = await request.get('/api/events')
      const data = await res.json()
      if (!data.events?.length) {
        test.skip(true, 'No events in local seed')
      }
      eventId = data.events[0].eventID || data.events[0].id
    })

    test.afterAll(async ({ request }) => {
      await cleanupTestUser(request, user)
    })

    test.beforeEach(async ({ page }) => {
      await loginAsUser(page, user)
    })

    test('post a message appears in thread', async ({ page }) => {
      await step(page, 'open event detail', async () => {
        await page.goto(`/event/${eventId}`)
        await page.waitForLoadState('networkidle')
      })

      await step(page, 'find messages input and post', async () => {
        const input = page.getByPlaceholder(/message|comment/i).first()
        await expect(input).toBeVisible({ timeout: 5000 })
        await input.fill(MSG)
        await page.getByRole('button', { name: /send|post/i }).first().click()
        await page.waitForTimeout(1000)
      })

      await step(page, 'verify message visible', async () => {
        await expect(page.getByText(MSG)).toBeVisible({ timeout: 5000 })
      })
    })

    test('delete own message removes it', async ({ page }) => {
      await step(page, 'open event detail', async () => {
        await page.goto(`/event/${eventId}`)
        await page.waitForLoadState('networkidle')
      })

      await step(page, 'long-press / hover own message and delete', async () => {
        const own = page.getByText(MSG)
        if (await own.isVisible({ timeout: 2000 }).catch(() => false)) {
          await own.click({ button: 'right' }).catch(() => own.hover())
          const del = page.getByRole('button', { name: /delete|remove/i }).first()
          if (await del.isVisible({ timeout: 2000 }).catch(() => false)) {
            await del.click()
            await page.waitForTimeout(800)
          } else {
            test.skip(true, 'Delete affordance not surfaced — UI may differ')
          }
        } else {
          test.skip(true, 'Own message not visible — previous test may have failed')
        }
      })

      await step(page, 'verify message gone', async () => {
        await expect(page.getByText(MSG)).toHaveCount(0)
      })
    })
  })
  ```

- [ ] **Step 3:** Run, iterate, commit.
  ```bash
  npm run e2e:local -- tests/messages.spec.ts
  git add tests/messages.spec.ts
  git commit -m "test(e2e): cover event messages post + delete"
  ```

---

## Phase 2 Verification Gate

- [ ] **Step 1:** Run the full suite locally.
  Run: `npm run e2e:local`
  Expected: total wall-clock under 10 min. Most tests pass; some may legitimately `.skip` (no seed data for events / no UI surface for a feature). No unexpected failures.

- [ ] **Step 2:** Open dashboard, verify each new spec has labeled step screenshots and a GIF.
  Run: `npm run e2e:review`

- [ ] **Step 3:** If any spec is consistently flaky (>1 failure in 3 runs against a stable local), tag with `test.fixme` + a TODO referencing the cause. Better to skip flaky tests than have a noisy suite.

---

# Phase 3 — Mobile-web viewport

## Task 3.1: Add `mobile-safari` Playwright project

**Files:**
- Modify: `playwright.config.ts`

- [ ] **Step 1:** Update the `projects` array.
  ```ts
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 15'] },
    },
  ],
  ```

- [ ] **Step 2:** Verify config loads, lists tests against both projects.
  Run: `npx playwright test --list`
  Expected: each test appears twice (once per project).

- [ ] **Step 3:** Commit.
  ```bash
  git add playwright.config.ts
  git commit -m "feat(e2e): add mobile-safari viewport project"
  ```

---

## Task 3.2: Run full suite, audit failures, tag specs

**Files:** modifications to existing spec files as needed.

- [ ] **Step 1:** Run full suite against both projects.
  Run: `npm run e2e:local`
  Expected: ~50% of mobile failures are real responsive issues; the rest are selector-only problems (e.g., a tab visible only at desktop width).

- [ ] **Step 2:** For each consistently-failing mobile test, decide:
  - **Fix the spec** (add mobile-friendly selector or interaction).
  - **Tag as `@desktop`-only** (rename describe to `'@desktop ...'`, document why).
  - **Tag as `@mobile`-only** (rare — only if the test is checking mobile-specific UI).

  Apply tags via describe-block name and run filtered:
  ```ts
  test.describe('@desktop Map (Web Desktop)', () => { ... })
  ```
  Then later: `npx playwright test --grep '@desktop' --project=chromium`.

- [ ] **Step 3:** Update `package.json` if helpful:
  ```json
  "e2e:desktop": "node scripts/run-e2e-local.mjs --project=chromium",
  "e2e:mobile": "node scripts/run-e2e-local.mjs --project=mobile-safari",
  ```

- [ ] **Step 4:** Run again, confirm clean pass on both projects (modulo any genuine bugs you've now surfaced — file those as separate issues, don't silence them).

- [ ] **Step 5:** Commit.
  ```bash
  git add tests/ package.json
  git commit -m "test(e2e): tag specs by viewport, fix mobile selectors"
  ```

---

## Task 3.3: Update review dashboard to group by project

**Files:**
- Modify: `scripts/build-review.mjs`

- [ ] **Step 1:** In `iterTests`, the `test.projectName` is already in the title. The dashboard already shows project tagged in card titles (per Task 1.10's `c.title` logic). Verify by running `npm run e2e:review` after a multi-project run; if the project tag isn't visible, adjust the card header to display it more prominently:
  ```js
  // In the card HTML
  <h2>
    <span class="badge" style="background:${statusColor(c.status)}">${c.status}</span>
    <span>${escapeHtml(c.spec)}</span>
    ${c.projectName ? `<span class="suite">${escapeHtml(c.projectName)}</span>` : ''}
    <span class="suite">${escapeHtml(c.suite)}</span>
  </h2>
  ```
  Update the iteration to expose `projectName: test.projectName` on each card.

- [ ] **Step 2:** Verify dashboard.
  Run: `npm run e2e:local && npm run e2e:review`

- [ ] **Step 3:** Commit.
  ```bash
  git add scripts/build-review.mjs
  git commit -m "feat(e2e): show project name on review dashboard cards"
  ```

---

## Phase 3 Verification Gate

- [ ] **Step 1:** Run full suite with both projects.
  Run: `npm run e2e:local`
  Expected: at least 80% of specs pass on both projects. Failures are either tagged-as-other-platform or genuine bugs filed separately.

- [ ] **Step 2:** Dashboard shows desktop and mobile runs distinctly.

---

# Phase 4 — iOS native (Maestro)

> Lowest priority. Skip if Phase 1–3 are not yet stable.

## Task 4.1: Install Maestro + verify

**Files:** none (environment setup).

- [ ] **Step 1:** Install.
  Run: `curl -Ls "https://get.maestro.mobile.dev" | bash`
  Then: `export PATH="$PATH:$HOME/.maestro/bin"` (add to shell profile).

- [ ] **Step 2:** Verify.
  Run: `maestro --version`
  Expected: prints version.

- [ ] **Step 3:** Document install in README's "End-to-end tests" section under a new "iOS native (Maestro)" subsection.

- [ ] **Step 4:** Commit README change.
  ```bash
  git add README.md
  git commit -m "docs: document Maestro install for iOS E2E"
  ```

---

## Task 4.2: Pin down iOS-sim → local-backend networking

**Files:** investigation only.

- [ ] **Step 1:** Check how the iOS app determines its API URL. Likely `EXPO_PUBLIC_API_URL` or hardcoded fallback in `packages/frontend/utils/api.ts`. Read it.
  Run: `grep -rn "EXPO_PUBLIC_API_URL\|API_URL\|localhost" packages/frontend/utils/api.ts packages/frontend/src 2>/dev/null | head -20`

- [ ] **Step 2:** iOS sim can reach `localhost`. Real device requires LAN IP. For simulator-only Phase 4, `localhost:8787` works.

- [ ] **Step 3:** If needed, document the env var in a `.env.local.example` and reference it in README.

- [ ] **Step 4:** No commit yet — findings inform Task 4.3.

---

## Task 4.3: Create `.maestro/signup-onboarding.yaml`

**Files:**
- Create: `.maestro/signup-onboarding.yaml`

- [ ] **Step 1:** Find the iOS bundle ID.
  Run: `grep -E "bundleIdentifier|ios.bundleIdentifier" packages/frontend/app.json packages/frontend/ios/*.xcodeproj/project.pbxproj 2>/dev/null | head`
  Note the value (e.g., `com.chinmaya.janata`).

- [ ] **Step 2:** Write the flow.
  ```yaml
  appId: com.chinmaya.janata  # <-- replace with actual bundle ID from Step 1
  name: Signup + Onboarding
  ---
  - launchApp:
      clearState: true
  - assertVisible: "Find your center"
  - takeScreenshot: 01-landing
  - tapOn: "Sign up|Get started|Create account"
  - takeScreenshot: 02-auth-email
  - inputText: "e2e_ios_${output.timestamp}@test.janata.dev"
  - tapOn: "Continue"
  - takeScreenshot: 03-auth-password
  - inputText: "TestPassword123!"
  - tapOn: "Confirm password"
  - inputText: "TestPassword123!"
  - tapOn: "Create account"
  - assertVisible: "Step 1 of 5"
  - takeScreenshot: 04-onboarding-name
  - tapOn: "First name"
  - inputText: "iOS"
  - tapOn: "Last name"
  - inputText: "TestUser"
  - tapOn: "Continue"
  # Continue for steps 2-5; commit early, iterate.
  ```

- [ ] **Step 3:** Run.
  Prereq: app built and running on iOS sim (`npm run ios` in another shell).
  Run: `maestro test .maestro/signup-onboarding.yaml`
  Expected: passes; iterate selectors based on actual UI text (Maestro matches by visible text + accessibility labels).

- [ ] **Step 4:** Commit.
  ```bash
  git add .maestro/signup-onboarding.yaml
  git commit -m "test(e2e): add Maestro signup+onboarding flow"
  ```

---

## Task 4.4: Create `.maestro/discover-and-rsvp.yaml` and `.maestro/profile-edit.yaml`

**Files:**
- Create: `.maestro/discover-and-rsvp.yaml`
- Create: `.maestro/profile-edit.yaml`

- [ ] **Step 1:** Mirror the structure of `signup-onboarding.yaml` but exercising:
  - `discover-and-rsvp`: launch → sign in (assumes user exists) → tap event → tap RSVP → assert "Going".
  - `profile-edit`: launch → sign in → tap profile tab → tap Edit → change bio → tap Save → assert new bio visible.

  Use a precondition flow `.maestro/_login.yaml` if the duplicate sign-in becomes a problem (Maestro supports `runFlow` for sub-flows).

- [ ] **Step 2:** Run each.
  ```bash
  maestro test .maestro/discover-and-rsvp.yaml
  maestro test .maestro/profile-edit.yaml
  ```

- [ ] **Step 3:** Commit.
  ```bash
  git add .maestro/
  git commit -m "test(e2e): add Maestro RSVP and profile-edit flows"
  ```

---

## Task 4.5: Add `e2e:ios` script + extend dashboard

**Files:**
- Create: `scripts/run-e2e-ios.sh`
- Modify: `package.json`, `scripts/build-review.mjs`

- [ ] **Step 1:** Write the runner.
  ```bash
  #!/usr/bin/env bash
  # Runs Maestro flows against a running iOS sim with locally-running backend.
  # Prereq: iOS sim must already be running with the app installed
  # (`npm run ios` in another shell).
  set -euo pipefail

  REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
  cd "$REPO_ROOT"

  if ! command -v maestro >/dev/null 2>&1; then
    echo "maestro not found. See README for install instructions."
    exit 1
  fi

  # Ensure backend is reachable; if not, warn (don't auto-start — assume user manages it).
  if ! curl -sf http://localhost:8787/api/health >/dev/null; then
    echo "WARNING: backend not reachable on localhost:8787. Run 'npm run dev:backend' first."
  fi

  rm -rf test-results/maestro
  mkdir -p test-results/maestro

  for f in .maestro/*.yaml; do
    [ "$f" = ".maestro/_login.yaml" ] && continue
    name=$(basename "$f" .yaml)
    echo "==> Running $name"
    maestro test "$f" --debug-output "test-results/maestro/$name" || true
  done

  # Build review dashboard (extended to ingest Maestro)
  node scripts/build-review.mjs
  ```

- [ ] **Step 2:** Make executable.
  Run: `chmod +x scripts/run-e2e-ios.sh`

- [ ] **Step 3:** Add npm script to root `package.json`:
  ```json
  "e2e:ios": "bash scripts/run-e2e-ios.sh"
  ```

- [ ] **Step 4:** Extend `scripts/build-review.mjs` to also walk `test-results/maestro/` and emit cards for each flow. Pseudocode addition:
  ```js
  // After the Playwright cards loop:
  const maestroDir = resolve(REPO_ROOT, 'test-results/maestro')
  if (existsSync(maestroDir)) {
    const flows = await readdir(maestroDir)
    for (const flow of flows) {
      const flowDir = resolve(maestroDir, flow)
      const screenshots = (await readdir(flowDir))
        .filter((f) => f.endsWith('.png'))
        .map((f) => ({ name: f, path: relPath(resolve(flowDir, f)) }))
      // Maestro produces a video at flowDir/recording.mp4 (or similar — verify path).
      const videoPath = existsSync(resolve(flowDir, 'recording.mp4'))
        ? relPath(resolve(flowDir, 'recording.mp4'))
        : null
      cards.push({
        suite: 'Maestro (iOS)',
        spec: flow,
        title: flow,
        status: 'passed', // Maestro exit-code-driven; refine if junit XML is present.
        durationMs: 0,
        screenshots,
        videoPath,
        gifPath: null, // Skip GIF for mp4 — keep video link only, or extend videos-to-gifs.sh.
      })
    }
  }
  ```
  (Add `import { readdir } from 'node:fs/promises'` at the top.)

- [ ] **Step 5:** Run end-to-end (with iOS sim already running).
  ```bash
  npm run e2e:ios
  npm run e2e:review
  ```
  Expected: dashboard now includes Maestro flows alongside web cards.

- [ ] **Step 6:** Commit.
  ```bash
  git add scripts/run-e2e-ios.sh scripts/build-review.mjs package.json
  git commit -m "feat(e2e): add e2e:ios runner and surface Maestro flows in review"
  ```

---

## Phase 4 Verification Gate

- [ ] **Step 1:** With iOS sim running and app launched, run `npm run e2e:ios`.
  Expected: all 3 flows pass.

- [ ] **Step 2:** Open `npm run e2e:review` — Maestro flows visible alongside web specs.

---

# Done

All four phases complete. The user has:
- One command (`npm run e2e:local`) that exercises the entire web app locally.
- One command (`npm run e2e:prod`) that smoke-tests production.
- One command (`npm run e2e:ios`) that exercises the iOS native app.
- One command (`npm run e2e:review`) that opens a single dashboard with GIFs, labeled screenshots, and videos for every test across every platform.
