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
    try {
      process.kill(-devProc.pid, 'SIGTERM')
    } catch {}
    try {
      spawnSync('pkill', ['-f', 'wrangler dev'])
    } catch {}
    try {
      spawnSync('pkill', ['-f', 'expo start'])
    } catch {}
    try {
      spawnSync('pkill', ['-f', 'concurrently'])
    } catch {}
  }
}
process.on('exit', killDev)
process.on('SIGINT', () => {
  killDev()
  process.exit(130)
})
process.on('SIGTERM', () => {
  killDev()
  process.exit(143)
})

let playwrightExitCode = 0
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
  const r = spawnSync('npx', playwrightArgs, {
    stdio: 'inherit',
    cwd: REPO_ROOT,
    env: { ...process.env, E2E_BASE_URL: FRONTEND_URL, E2E_API_URL: API_URL },
  })
  playwrightExitCode = r.status ?? 1
} finally {
  killDev()
  console.log('==> [5/6] Converting videos to GIFs')
  try {
    run('bash', ['scripts/videos-to-gifs.sh'])
  } catch (e) {
    console.warn(e.message)
  }
  console.log('==> [6/6] Building review dashboard')
  try {
    run('node', ['scripts/build-review.mjs'])
  } catch (e) {
    console.warn(e.message)
  }
}

console.log('==> Done. Open test-results/review.html')
process.exit(playwrightExitCode)
