/**
 * migrate-flatten.js
 *
 * One-time migration script to flatten all nested userObject / centerObject / eventObject
 * fields into top-level DynamoDB attributes.
 *
 * Run against LOCAL tables first to verify, then against prod:
 *
 *   # Local:
 *   node -r dotenv/config scripts/migrate-flatten.js dotenv_config_path=.env.local
 *
 *   # Prod (real AWS): set real env vars and run without DYNAMODB_ENDPOINT
 *
 * Safe to run multiple times — skips records that are already flat.
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, ScanCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb'

const clientConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'local',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'local',
  },
}
if (process.env.DYNAMODB_ENDPOINT) {
  clientConfig.endpoint = process.env.DYNAMODB_ENDPOINT
}

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient(clientConfig), {
  marshallOptions: { removeUndefinedValues: true, convertEmptyValues: false },
})

const USERS_TABLE = process.env.USERS_TABLE || 'ChinmayaJanata-Users'
const CENTERS_TABLE = process.env.CENTERS_TABLE || 'ChinmayaJanata-Centers'
const EVENTS_TABLE = process.env.EVENTS_TABLE || 'ChinmayaJanata-Events'

async function scanAll(tableName) {
  const items = []
  let lastKey
  do {
    const result = await docClient.send(new ScanCommand({
      TableName: tableName,
      ExclusiveStartKey: lastKey,
    }))
    items.push(...(result.Items || []))
    lastKey = result.LastEvaluatedKey
  } while (lastKey)
  return items
}

async function updateItem(tableName, key, updates, removeKeys) {
  const setExprs = []
  const removeExprs = []
  const names = {}
  const values = {}

  Object.entries(updates).forEach(([k, v], i) => {
    names[`#f${i}`] = k
    values[`:v${i}`] = v
    setExprs.push(`#f${i} = :v${i}`)
  })

  removeKeys.forEach((k, i) => {
    names[`#r${i}`] = k
    removeExprs.push(`#r${i}`)
  })

  let expr = ''
  if (setExprs.length > 0) expr += `SET ${setExprs.join(', ')} `
  if (removeExprs.length > 0) expr += `REMOVE ${removeExprs.join(', ')}`

  await docClient.send(new UpdateCommand({
    TableName: tableName,
    Key: key,
    UpdateExpression: expr.trim(),
    ExpressionAttributeNames: names,
    ExpressionAttributeValues: Object.keys(values).length > 0 ? values : undefined,
  }))
}

async function migrateUsers() {
  console.log('\n--- Migrating Users ---')
  const users = await scanAll(USERS_TABLE)
  let migrated = 0

  for (const user of users) {
    if (!user.userObject) {
      continue // Already flat
    }
    const obj = user.userObject
    const updates = {}

    // Rename profilePictureURL -> profileImage
    if (obj.profilePictureURL !== undefined && !user.profileImage) {
      updates.profileImage = obj.profilePictureURL
    }
    // Rename center -> centerID
    if (obj.center !== undefined && !user.centerID) {
      updates.centerID = obj.center
    }
    // Flatten remaining fields (skip already-set top-level ones)
    const fieldMap = {
      username: 'username', firstName: 'firstName', lastName: 'lastName',
      dateOfBirth: 'dateOfBirth', points: 'points', isVerified: 'isVerified',
      verificationLevel: 'verificationLevel', exists: 'exists', isActive: 'isActive',
      id: 'id', events: 'events',
    }
    for (const [src, dst] of Object.entries(fieldMap)) {
      if (obj[src] !== undefined && user[dst] === undefined) {
        updates[dst] = obj[src]
      }
    }
    // Add new fields with defaults if missing
    if (user.centerMemberships === undefined) updates.centerMemberships = []
    if (user.email === undefined && !updates.email) updates.email = ''
    if (user.profileComplete === undefined) updates.profileComplete = false
    if (user.phoneNumber === undefined) updates.phoneNumber = ''
    if (user.interests === undefined) updates.interests = []
    if (user.bio === undefined) updates.bio = ''

    await updateItem(USERS_TABLE, { id: user.id }, updates, ['userObject'])
    console.log(`  Migrated user: ${user.id} (${user.username || ''})`)
    migrated++
  }
  console.log(`  Done. ${migrated} records migrated, ${users.length - migrated} already flat.`)
}

async function migrateCenters() {
  console.log('\n--- Migrating Centers ---')
  const centers = await scanAll(CENTERS_TABLE)
  let migrated = 0

  for (const center of centers) {
    if (!center.centerObject) {
      continue // Already flat
    }
    const obj = center.centerObject
    const updates = {}

    const fields = ['location', 'name', 'centerID', 'memberCount', 'isVerified']
    for (const f of fields) {
      if (obj[f] !== undefined && center[f] === undefined) {
        updates[f] = obj[f]
      }
    }
    // Add new fields with defaults if missing
    if (center.address === undefined) updates.address = ''
    if (center.website === undefined) updates.website = ''
    if (center.phone === undefined) updates.phone = ''
    if (center.image === undefined) updates.image = ''
    if (center.pointOfContact === undefined) updates.pointOfContact = ''
    if (center.acharya === undefined) updates.acharya = ''

    await updateItem(CENTERS_TABLE, { centerID: center.centerID }, updates, ['centerObject'])
    console.log(`  Migrated center: ${center.centerID}`)
    migrated++
  }
  console.log(`  Done. ${migrated} records migrated, ${centers.length - migrated} already flat.`)
}

async function migrateEvents() {
  console.log('\n--- Migrating Events ---')
  const events = await scanAll(EVENTS_TABLE)
  let migrated = 0

  for (const evt of events) {
    if (!evt.eventObject) {
      continue // Already flat
    }
    const obj = evt.eventObject
    const updates = {}

    const fields = [
      'location', 'date', 'endorsers', 'id', 'tier',
      'peopleAttending', 'usersAttending', 'description',
    ]
    for (const f of fields) {
      if (obj[f] !== undefined && evt[f] === undefined) {
        updates[f] = obj[f]
      }
    }
    // Normalize center: extract centerID from embedded object if not already a top-level string
    if (!evt.centerID) {
      if (obj.center && typeof obj.center === 'object' && obj.center.centerID) {
        updates.centerID = obj.center.centerID
      } else if (obj.center && typeof obj.center === 'string') {
        updates.centerID = obj.center
      }
    }
    // Add new fields with defaults if missing
    if (evt.title === undefined) updates.title = ''
    if (evt.address === undefined) updates.address = ''
    if (evt.pointOfContact === undefined) updates.pointOfContact = ''
    if (evt.image === undefined) updates.image = ''
    if (evt.endDate === undefined) updates.endDate = null

    await updateItem(EVENTS_TABLE, { eventID: evt.eventID }, updates, ['eventObject'])
    console.log(`  Migrated event: ${evt.eventID}`)
    migrated++
  }
  console.log(`  Done. ${migrated} records migrated, ${events.length - migrated} already flat.`)
}

async function main() {
  console.log('Starting migration...')
  console.log('Tables:', USERS_TABLE, CENTERS_TABLE, EVENTS_TABLE)
  if (process.env.DYNAMODB_ENDPOINT) {
    console.log('Endpoint:', process.env.DYNAMODB_ENDPOINT)
  }

  await migrateUsers()
  await migrateCenters()
  await migrateEvents()

  console.log('\nMigration complete.')
}

main().catch(err => {
  console.error('Migration failed:', err)
  process.exit(1)
})
