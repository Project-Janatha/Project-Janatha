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

function escapeHtml(s) {
  return String(s).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
  )
}

const cards = []
for (const { suite, spec, test } of iterTests(data.suites)) {
  // Use the LAST result (post-retries) so the card reflects final outcome.
  const result = test.results?.[test.results.length - 1]
  if (!result) continue
  const status = result.status
  const attachments = result.attachments ?? []
  const screenshots = attachments
    .filter((a) => a.contentType === 'image/png' && a.path && /step-\d/.test(a.path))
    .map((a) => ({ name: a.name, path: relPath(a.path) }))
  const videoAttachment = attachments.find((a) => a.contentType === 'video/webm' && a.path)
  const videoPath = videoAttachment ? relPath(videoAttachment.path) : null
  const gifPath = videoPath ? videoPath.replace(/\.webm$/, '.gif') : null
  const gifExists = gifPath && existsSync(resolve(dirname(OUT), gifPath))

  cards.push({
    suite,
    spec,
    projectName: test.projectName || null,
    status,
    durationMs: result.duration ?? 0,
    screenshots,
    videoPath,
    gifPath: gifExists ? gifPath : null,
  })
}

// Sort: failed first, then by suite name then spec name.
const order = { failed: 0, timedOut: 0, interrupted: 0, passed: 1, skipped: 2 }
cards.sort((a, b) => {
  const oa = order[a.status] ?? 3
  const ob = order[b.status] ?? 3
  if (oa !== ob) return oa - ob
  return (a.suite + a.spec).localeCompare(b.suite + b.spec)
})

const statusColor = (s) =>
  s === 'passed'
    ? '#16a34a'
    : s === 'failed' || s === 'timedOut' || s === 'interrupted'
      ? '#dc2626'
      : '#6b7280'

const passed = cards.filter((c) => c.status === 'passed').length
const failed = cards.filter(
  (c) => c.status === 'failed' || c.status === 'timedOut' || c.status === 'interrupted'
).length
const skipped = cards.filter((c) => c.status === 'skipped').length

const html = `<!doctype html>
<html><head>
<meta charset="utf-8">
<title>E2E Review — ${new Date().toLocaleString()}</title>
<style>
  body { font-family: -apple-system, system-ui, sans-serif; margin: 0; background: #0b0d12; color: #e5e7eb; }
  header { padding: 16px 24px; border-bottom: 1px solid #1f2937; display: flex; align-items: baseline; gap: 16px; flex-wrap: wrap; }
  h1 { font-size: 18px; margin: 0; }
  .meta { font-size: 13px; color: #9ca3af; }
  .pill { font-size: 12px; padding: 2px 10px; border-radius: 999px; background: #1f2937; color: #e5e7eb; }
  .pill.pass { background: #14532d; color: #bbf7d0; }
  .pill.fail { background: #7f1d1d; color: #fecaca; }
  .pill.skip { background: #374151; color: #d1d5db; }
  main { padding: 24px; display: grid; gap: 24px; grid-template-columns: 1fr; }
  @media (min-width: 1100px) { main { grid-template-columns: 1fr 1fr; } }
  .card { background: #111827; border: 1px solid #1f2937; border-radius: 12px; overflow: hidden; }
  .card h2 { font-size: 15px; margin: 0; padding: 12px 16px; border-bottom: 1px solid #1f2937; display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
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
  <span class="pill pass">${passed} passed</span>
  ${failed ? `<span class="pill fail">${failed} failed</span>` : ''}
  ${skipped ? `<span class="pill skip">${skipped} skipped</span>` : ''}
</header>
<main>
  ${cards
    .map(
      (c) => `
    <article class="card">
      <h2>
        <span class="badge" style="background:${statusColor(c.status)}">${c.status}</span>
        <span>${escapeHtml(c.spec)}</span>
        ${c.projectName ? `<span class="suite">${escapeHtml(c.projectName)}</span>` : ''}
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

await writeFile(OUT, html, 'utf8')
console.log(`==> Wrote ${OUT}`)
