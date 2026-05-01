#!/usr/bin/env node
/**
 * Build migrations/0012_correct_event_data_2026.sql by joining the 0010
 * seed migration (id, title) with the scraped JSON (title, source_url).
 *
 * Run: node scripts/scraped-events/build-0012-migration.cjs > migrations/0012_correct_event_data_2026.sql
 */
const fs = require('fs')
const path = require('path')

const repoRoot = path.resolve(__dirname, '../..')
const seedSql = fs.readFileSync(path.join(repoRoot, 'migrations/0010_seed_chinmaya_events_2026.sql'), 'utf-8')
const scraped = JSON.parse(fs.readFileSync(path.join(repoRoot, 'scripts/scraped-events/2026-04-30_chinmaya-events.json'), 'utf-8'))

// Parse the seed migration: each VALUES tuple starts with `(\n  'e-...id', 'Title',`
const idTitlePattern = /\(\s*'(e-[^']+)',\s*'((?:[^']|'')*)'/g
const idByTitle = new Map()
const normalize = (s) => s.replace(/[–—]/g, '-').replace(/\s+/g, ' ').trim().toLowerCase()
let m
while ((m = idTitlePattern.exec(seedSql)) !== null) {
  const id = m[1]
  // Un-escape SQL doubled apostrophes
  const title = m[2].replace(/''/g, "'")
  idByTitle.set(normalize(title), id)
}

// Walk the JSON and emit UPDATE statements for events with a source_url.
const lines = []
lines.push('-- 0012_correct_event_data_2026.sql')
lines.push('-- Two corrections to the events seeded in 0010:')
lines.push('--')
lines.push("--   1. The 33rd Chinmaya Mahasamadhi Aradhana Camp had a placeholder")
lines.push("--      address (Sheraton Parsippany Hotel, Parsippany, NJ, US) with no")
lines.push("--      street/zip and 0,0 coordinates. Backfilling the canonical hotel")
lines.push("--      address (199 Smith Rd, Parsippany, NJ 07054) and lat/lng.")
lines.push('--')
lines.push("--   2. Each scraped event had a source_url in the inventory JSON")
lines.push("--      (scripts/scraped-events/2026-04-30_chinmaya-events.json) but the")
lines.push("--      original 0010 seed dropped it. 0011 added the external_url column;")
lines.push("--      this migration populates it for every event we have a source for.")
lines.push('')
lines.push("-- Mahasamadhi camp address fix")
lines.push(
  "UPDATE events SET " +
  "address = '199 Smith Rd, Parsippany, NJ - 07054, US', " +
  "latitude = 40.8617, longitude = -74.4087, " +
  "updated_at = datetime('now') " +
  "WHERE id = 'e-mahasamadhi-2026';"
)
lines.push('')
lines.push("-- Backfill external_url for every scraped event with a source URL")

let matched = 0
let missing = []
for (const ev of scraped.events) {
  if (!ev.source_url) continue
  const id = idByTitle.get(normalize(ev.title))
  if (!id) {
    missing.push(ev.title)
    continue
  }
  const url = ev.source_url.replace(/'/g, "''")
  lines.push(`UPDATE events SET external_url = '${url}', updated_at = datetime('now') WHERE id = '${id}';`)
  matched++
}

if (missing.length > 0) {
  console.error(`WARNING: ${missing.length} scraped events have no matching seed row:`)
  for (const t of missing) console.error(`  - ${t}`)
}
console.error(`Matched ${matched} of ${scraped.events.length} scraped events.`)

process.stdout.write(lines.join('\n') + '\n')
