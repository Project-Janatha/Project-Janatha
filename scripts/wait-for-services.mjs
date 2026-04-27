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
