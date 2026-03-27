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

  // Piercy = Saandeepany
  if (city === 'Piercy') return 'Chinmaya Saandeepany'

  // Already starts with Chinmaya or Chinmaya Mission
  if (
    name.toLowerCase().startsWith('chinmaya') ||
    name.toLowerCase().startsWith('chinmayamission')
  ) {
    return name
  }

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

let sql = `-- Seed centers from CSV (standardized names)\n`
sql += `-- Run: npx wrangler d1 execute chinmaya-janata-db --local --file=packages/backend/src/seed/centers.sql\n\n`
sql += `DELETE FROM centers;\n\n`

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

  // Standardize the name
  const stdName = standardizeName(name, city, state)

  // Check for duplicates (skip if same name already added)
  const nameKey = stdName.toLowerCase()
  if (seenNames[nameKey]) {
    console.log(`Skipping duplicate: ${stdName} (already exists as ${seenNames[nameKey]})`)
    continue
  }
  seenNames[nameKey] = stdName

  sql += `INSERT INTO centers (id, name, latitude, longitude, address, phone, is_verified) VALUES ('${id}', '${stdName}', ${lat}, ${lng}, '${address}', '${phone}', 1);\n`
}

fs.writeFileSync(__dirname + '/centers.sql', sql)
console.log('Generated centers.sql with ' + Object.keys(seenNames).length + ' unique centers')
