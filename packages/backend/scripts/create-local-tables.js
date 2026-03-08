/**
 * create-local-tables.js
 *
 * One-time script to create all DynamoDB tables in a local DynamoDB instance.
 * Run this after starting DynamoDB Local:
 *
 *   docker run -p 8000:8000 amazon/dynamodb-local
 *   node -r dotenv/config packages/backend/scripts/create-local-tables.js dotenv_config_path=packages/backend/.env.local
 *
 * Or from the backend directory:
 *   node -r dotenv/config scripts/create-local-tables.js dotenv_config_path=.env.local
 */

import { DynamoDBClient, CreateTableCommand, ListTablesCommand } from '@aws-sdk/client-dynamodb'

const endpoint = process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000'
const region = process.env.AWS_REGION || 'us-east-1'

const client = new DynamoDBClient({
  region,
  endpoint,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'local',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'local',
  },
})

const USERS_TABLE = process.env.USERS_TABLE || 'ChinmayaJanata-Users'
const CENTERS_TABLE = process.env.CENTERS_TABLE || 'ChinmayaJanata-Centers'
const EVENTS_TABLE = process.env.EVENTS_TABLE || 'ChinmayaJanata-Events'
const MESSAGES_TABLE = process.env.MESSAGES_TABLE || 'ChinmayaJanata-Messages'

const tableDefinitions = [
  {
    TableName: USERS_TABLE,
    KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'username', AttributeType: 'S' },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'username-index',
        KeySchema: [{ AttributeName: 'username', KeyType: 'HASH' }],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
      },
    ],
    BillingMode: 'PROVISIONED',
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
  },
  {
    TableName: CENTERS_TABLE,
    KeySchema: [{ AttributeName: 'centerID', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'centerID', AttributeType: 'S' }],
    BillingMode: 'PROVISIONED',
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
  },
  {
    TableName: EVENTS_TABLE,
    KeySchema: [{ AttributeName: 'eventID', KeyType: 'HASH' }],
    AttributeDefinitions: [
      { AttributeName: 'eventID', AttributeType: 'S' },
      { AttributeName: 'centerID', AttributeType: 'S' },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'centerID-index',
        KeySchema: [{ AttributeName: 'centerID', KeyType: 'HASH' }],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
      },
    ],
    BillingMode: 'PROVISIONED',
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
  },
  {
    TableName: MESSAGES_TABLE,
    KeySchema: [{ AttributeName: 'messageID', KeyType: 'HASH' }],
    AttributeDefinitions: [
      { AttributeName: 'messageID', AttributeType: 'S' },
      { AttributeName: 'eventID', AttributeType: 'S' },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'eventID-index',
        KeySchema: [{ AttributeName: 'eventID', KeyType: 'HASH' }],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
      },
    ],
    BillingMode: 'PROVISIONED',
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
  },
]

async function main() {
  console.log(`Connecting to DynamoDB at ${endpoint}`)

  // List existing tables
  const existing = await client.send(new ListTablesCommand({}))
  const existingNames = new Set(existing.TableNames || [])

  for (const def of tableDefinitions) {
    if (existingNames.has(def.TableName)) {
      console.log(`  SKIP  ${def.TableName} (already exists)`)
      continue
    }
    try {
      await client.send(new CreateTableCommand(def))
      console.log(`  OK    ${def.TableName}`)
    } catch (err) {
      console.error(`  FAIL  ${def.TableName}:`, err.message)
    }
  }

  console.log('Done.')
}

main().catch(console.error)
