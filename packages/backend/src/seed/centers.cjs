const fs = require('fs')
const csv = fs.readFileSync(__dirname + '/../../../../data/centers.csv', 'utf-8')

function parseCSVLine(line) {
  const result = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  result.push(current.trim())
  return result
}

function standardizeName(name, city, state) {
  // Leave "Chinmayam" as is
  if (name.toLowerCase().includes('chinmayam')) return name

  // Already starts with Chinmaya or Chinmaya Mission
  if (
    name.toLowerCase().startsWith('chinmaya') ||
    name.toLowerCase().startsWith('chinmayamission')
  ) {
    return name
  }

  // Name already contains "Chinmaya" anywhere (e.g. "Central Chinmaya Mission Trust")
  // — treat as canonical and leave alone.
  if (name.toLowerCase().includes('chinmaya')) return name

  // Sanskrit-named centers without a Chinmaya prefix in the data file
  // (e.g. "Sandeepany Himalayas (Sidhbari)"). Leave alone.
  if (name.toLowerCase().startsWith('sandeepany')) return name

  // Bala Vihar -> Chinmaya Mission
  if (name.toLowerCase().includes('bal vihar') || name.toLowerCase().includes('bala vihar')) {
    return 'Chinmaya Mission ' + city
  }

  // Vaishnav Temple -> Chinmaya Mission
  if (name.toLowerCase().includes('vaishnav')) {
    return 'Chinmaya Mission ' + city
  }

  // CMLA -> Chinmaya Mission
  if (name.toLowerCase().startsWith('cmla')) {
    return 'Chinmaya Mission ' + city
  }

  // Yuva -> Chinmaya Yuva
  if (name.toLowerCase().includes('yuva') || name.toLowerCase().includes('youth')) {
    return 'Chinmaya Yuva ' + city
  }

  // If no recognizable name, use city
  if (!name || name.trim() === '') {
    return 'Chinmaya Mission ' + city
  }

  // Default: prepend Chinmaya Mission
  return 'Chinmaya Mission ' + name
}

const lines = csv.trim().split('\n')
const headers = parseCSVLine(lines[0])

// Track seen names to combine duplicates
const seenNames = {}

// Upsert so admin-curated columns (image, website, acharya, point_of_contact)
// survive a reseed. Only the fields sourced from CSV are overwritten.
let sql = `-- Seed centers from CSV (standardized names)\n`
sql += `-- Run: npx wrangler d1 execute chinmaya-janata-db --local --file=packages/backend/src/seed/centers.sql\n\n`

const csvIds = []

for (let i = 1; i < lines.length; i++) {
  const values = parseCSVLine(lines[i])
  if (values.length < 2) continue

  const id = values[0]
  const name = values[1].replace(/"/g, '').replace(/'/g, "''")
  const city = values[6] || ''
  const state = values[7] || ''
  const lat = parseFloat(values[13]) || 0
  const lng = parseFloat(values[14]) || 0
  const address = (values[16] || '').replace(/"/g, '').replace(/'/g, "''")
  const phone = values[10] || ''

  const stdName = standardizeName(name, city, state)

  const nameKey = stdName.toLowerCase()
  if (seenNames[nameKey]) {
    console.log(`Skipping duplicate: ${stdName} (already exists as ${seenNames[nameKey]})`)
    continue
  }
  seenNames[nameKey] = stdName

  // Convert CSV's integer id to the production UUID format so dev and prod
  // share center IDs. Production uses c0000001-0000-0000-0000-{12-digit
  // padded int}; the lone outlier (c-piercy-001) is prod-only and not in CSV.
  const centerId = `c0000001-0000-0000-0000-${String(id).padStart(12, '0')}`
  csvIds.push(centerId)

  // Deterministic placeholder photo per center until coordinators upload real ones.
  // Same seed -> same image forever. Only used when image is currently NULL.
  const placeholder = `https://picsum.photos/seed/cm-${id}/600/400`

  sql += `INSERT INTO centers (id, name, latitude, longitude, address, phone, is_verified, image) VALUES ('${centerId}', '${stdName}', ${lat}, ${lng}, '${address}', '${phone}', 1, '${placeholder}')\n`
  sql += `  ON CONFLICT(id) DO UPDATE SET name=excluded.name, latitude=excluded.latitude, longitude=excluded.longitude, address=excluded.address, phone=excluded.phone, is_verified=excluded.is_verified, image=COALESCE(centers.image, excluded.image), updated_at=datetime('now');\n`
}

// Remove any centers no longer in the CSV.
// Only delete rows that follow the integer-padded UUID pattern. Manually
// inserted outliers (e.g. prod's c-piercy-001) are left alone.
sql += `\nDELETE FROM centers WHERE id LIKE 'c0000001-0000-0000-0000-%' AND id NOT IN (${csvIds.map((id) => `'${id}'`).join(', ')});\n`

fs.writeFileSync(__dirname + '/centers.sql', sql)
console.log('Generated centers.sql with ' + Object.keys(seenNames).length + ' unique centers')
