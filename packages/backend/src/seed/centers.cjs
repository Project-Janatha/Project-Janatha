const fs = require('fs');
const csv = fs.readFileSync(__dirname + '/../../../../centers.csv', 'utf-8');

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

const lines = csv.trim().split('\n');
const headers = parseCSVLine(lines[0]);

let sql = `-- Seed centers from CSV\n`;
sql += `-- Run: npx wrangler d1 execute chinmaya-janata-db --local --file=packages/backend/src/seed/centers.sql\n\n`;
sql += `DELETE FROM centers;\n\n`;

for (let i = 1; i < lines.length; i++) {
  const values = parseCSVLine(lines[i]);
  if (values.length < 2) continue;
  
  const id = values[0];
  const name = values[1].replace(/"/g, '').replace(/'/g, "''");
  const lat = parseFloat(values[13]) || 0;
  const lng = parseFloat(values[14]) || 0;
  const address = (values[16] || '').replace(/"/g, '').replace(/'/g, "''");
  const phone = values[10] || '';
  
  sql += `INSERT INTO centers (id, name, latitude, longitude, address, phone, is_verified) VALUES ('${id}', '${name}', ${lat}, ${lng}, '${address}', '${phone}', 1);\n`;
}

fs.writeFileSync(__dirname + '/centers.sql', sql);
console.log('Generated centers.sql with ' + (lines.length - 1) + ' centers');
