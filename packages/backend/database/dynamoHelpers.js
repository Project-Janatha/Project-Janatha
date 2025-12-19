/**
 * @file dynamoHelpers.js
 * @author Abhiram Ramachandran
 * @date 2025-12-18
 * @description Helper functions for DynamoDB operations.
 * @module backend/database/dynamoHelpers
 * @requires ../constants.js
 * @requires uuid
 * @requires @aws-sdk/lib-dynamodb
 *
 * Om Sri Chinmaya Sadgurave Namaha. Om Sri Gurubyo Namaha.
 */
import constants from '../constants.js'
import { v4 as uuidv4 } from 'uuid'
import {
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb'

// User-related DynamoDB helper functions
/**
 * Creates a new user in the DynamoDB table.
 * @param {User} userItem
 * @returns {{success: boolean, error?: string, id?: string}} An object indicating success or failure of the operation and the user ID if successful.
 */
export async function createUser(userItem) {
  try {
    if (!userItem.id) {
      userItem.id = uuidv4()
    }
    await constants.docClient.send(
      new PutCommand({
        TableName: constants.USERS_TABLE,
        Item: {
          ...userItem,
          username: userItem.username.toLowerCase(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        ConditionExpression: 'attribute_not_exists(username)',
      })
    )
    return { success: true, id: userItem.id }
  } catch (err) {
    if (err.name === 'ConditionalCheckFailedException') {
      console.log('User already exists.')
      return { success: false, error: 'User already exists' }
    }
    console.error('Error creating user:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Gets a user by their email/username using a GSI.
 * @param {string} username
 * @returns {Object | null} The user object if found, else null.
 */
export async function getUserByUsername(username) {
  try {
    const command = new QueryCommand({
      TableName: constants.USERS_TABLE,
      IndexName: 'username-index',
      KeyConditionExpression: 'username = :u',
      ExpressionAttributeValues: { ':u': username.toLowerCase() },
    })
    const result = await constants.docClient.send(command)
    return result.Items && result.Items.length > 0 ? result.Items[0] : null
  } catch (err) {
    console.error('Error retrieving user:', err)
    return null
  }
}

/**
 * Gets a user by UUID - primary key.
 * @param {string} userId
 * @returns {Object | null} The user object if found, else null.
 */
export async function getUserById(userId) {
  try {
    const command = new GetCommand({
      TableName: constants.USERS_TABLE,
      Key: { id: userId },
    })
    const result = await constants.docClient.send(command)
    return result.Item || null
  } catch (err) {
    console.error('Error retrieving user by ID:', err)
    return null
  }
}

/**
 * Updates a user's data.
 * @param {string} userId
 * @param {Object} updates
 * @returns {{success: boolean, user?: Object, error?: string}} An object indicating success or failure of the operation.
 */
export async function updateUser(userId, updates) {
  try {
    updates.updatedAt = new Date().toISOString()

    const updateExpressions = []
    const expressionAttributeNames = {}
    const expressionAttributeValues = {}

    Object.keys(updates).forEach((key, index) => {
      updateExpressions.push(`#field${index} = :val${index}`)
      expressionAttributeNames[`#field${index}`] = key
      expressionAttributeValues[`:val${index}`] = updates[key]
    })
    const result = await constants.docClient.send(
      new UpdateCommand({
        TableName: constants.USERS_TABLE,
        Key: { id: userId },
        UpdateExpression: `SET ${updateExpressions.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW',
      })
    )
    return true
  } catch (err) {
    console.error('Error updating user:', err)
    return false
  }
}

export async function deleteUser(username) {
  try {
    await constants.docClient.send(
      new DeleteCommand({
        TableName: constants.USERS_TABLE,
        Key: { username: username },
      })
    )
    return true
  } catch (err) {
    console.error('Error deleting user:', err)
    return false
  }
}

// Event-related DynamoDB helper functions
export async function createEvent(eventItem) {
  try {
    await constants.docClient.send(
      new PutCommand({
        TableName: constants.EVENTS_TABLE,
        Item: eventItem,
        ConditionExpression: 'attribute_not_exists(eventId)',
      })
    )
    return true
  } catch (err) {
    console.error('Error creating event:', err)
    return false
  }
}

export async function getEventById(eventId) {
  try {
    const command = new GetCommand({
      TableName: constants.EVENTS_TABLE,
      Key: { eventId: eventId },
    })
    const result = await constants.docClient.send(command)
    return result.Item || null
  } catch (err) {
    console.error('Error retrieving event by ID:', err)
    return null
  }
}

export async function updateEvent(eventId, updateExpression, expressionAttributeValues) {
  try {
    await constants.docClient.send(
      new UpdateCommand({
        TableName: constants.EVENTS_TABLE,
        Key: { eventId: eventId },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'UPDATED_NEW',
      })
    )
    return true
  } catch (err) {
    console.error('Error updating event:', err)
    return false
  }
}

export async function deleteEvent(eventId) {
  try {
    await constants.docClient.send(
      new DeleteCommand({
        TableName: constants.EVENTS_TABLE,
        Key: { eventId: eventId },
      })
    )
    return true
  } catch (err) {
    console.error('Error deleting event:', err)
    return false
  }
}
