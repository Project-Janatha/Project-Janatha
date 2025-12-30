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
    return { success: true, user: result.Attributes }
  } catch (err) {
    console.error('Error updating user:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Deletes a user by UUID - primary key.
 * @param {string} userId
 * @returns {{success: boolean, error?: string}} Indicates success or failure of the operation.
 */
export async function deleteUser(userId) {
  try {
    await constants.docClient.send(
      new DeleteCommand({
        TableName: constants.USERS_TABLE,
        Key: { id: userId },
      })
    )
    return { success: true }
  } catch (err) {
    console.error('Error deleting user:', err)
    return { success: false, error: err.message }
  }
}

// Event-related DynamoDB helper functions
/**
 * Creates an event with UUID
 * @param {Object} eventItem
 * @returns {{success: boolean, eventID?: string, error?: string}}
 */
export async function createEvent(eventItem) {
  try {
    if (!eventItem.eventID) {
      eventItem.eventID = uuidv4()
    }

    await constants.docClient.send(
      new PutCommand({
        TableName: constants.EVENTS_TABLE,
        Item: {
          ...eventItem,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        ConditionExpression: 'attribute_not_exists(eventID)',
      })
    )
    return { success: true, eventID: eventItem.eventID }
  } catch (err) {
    if (err.name === 'ConditionalCheckFailedException') {
      return { success: false, error: 'Event already exists' }
    }
    console.error('Error creating event:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Get event by ID
 * @param {string} eventID
 * @returns {Object | null}
 */
export async function getEventById(eventID) {
  try {
    const command = new GetCommand({
      TableName: constants.EVENTS_TABLE,
      Key: { eventID: eventID }, // Match schema
    })
    const result = await constants.docClient.send(command)
    return result.Item || null
  } catch (err) {
    console.error('Error retrieving event by ID:', err)
    return null
  }
}

/**
 * Update event
 * @param {string} eventID
 * @param {Object} updates
 * @returns {boolean}
 */
export async function updateEvent(eventID, updates) {
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

    await constants.docClient.send(
      new UpdateCommand({
        TableName: constants.EVENTS_TABLE,
        Key: { eventID: eventID },
        UpdateExpression: `SET ${updateExpressions.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
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

/**
 * Delete event
 * @param {string} eventID
 * @returns {boolean}
 */
export async function deleteEvent(eventID) {
  try {
    await constants.docClient.send(
      new DeleteCommand({
        TableName: constants.EVENTS_TABLE,
        Key: { eventID: eventID },
      })
    )
    return true
  } catch (err) {
    console.error('Error deleting event:', err)
    return false
  }
}

/**
 * Get events by center ID using GSI
 * @param {number} centerID
 * @returns {Array}
 */
export async function getEventsByCenterId(centerID) {
  try {
    const command = new QueryCommand({
      TableName: constants.EVENTS_TABLE,
      IndexName: 'centerID-index',
      KeyConditionExpression: 'centerID = :cid',
      ExpressionAttributeValues: { ':cid': centerID },
    })
    const result = await constants.docClient.send(command)
    return result.Items || []
  } catch (err) {
    console.error('Error getting events by center:', err)
    return []
  }
}

// Center-related DynamoDB helper functions

/**
 * Creates a new center in the DynamoDB table with UUID.
 * @param {Object} centerItem
 * @returns {{success: boolean, centerID?: string, error?: string}}
 */
export async function createCenter(centerItem) {
  try {
    if (!centerItem.centerID) {
      centerItem.centerID = uuidv4() // Generate UUID
    }

    await constants.docClient.send(
      new PutCommand({
        TableName: constants.CENTERS_TABLE,
        Item: {
          ...centerItem,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        ConditionExpression: 'attribute_not_exists(centerID)',
      })
    )
    return { success: true, centerID: centerItem.centerID }
  } catch (err) {
    if (err.name === 'ConditionalCheckFailedException') {
      return { success: false, error: 'Center already exists' }
    }
    console.error('Error creating center:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Gets a center by centerID (UUID).
 * @param {string} centerID
 * @returns {Object | null}
 */
export async function getCenterById(centerID) {
  try {
    const command = new GetCommand({
      TableName: constants.CENTERS_TABLE,
      Key: { centerID: centerID }, // Now a string UUID
    })
    const result = await constants.docClient.send(command)
    return result.Item || null
  } catch (err) {
    console.error('Error retrieving center:', err)
    return null
  }
}

/**
 * Updates a center's information.
 * @param {string} centerID
 * @param {Object} updates
 * @returns {{success: boolean, center?: Object, error?: string}}
 */
export async function updateCenter(centerID, updates) {
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
        TableName: constants.CENTERS_TABLE,
        Key: { centerID: centerID }, // String UUID
        UpdateExpression: `SET ${updateExpressions.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW',
      })
    )
    return { success: true, center: result.Attributes }
  } catch (err) {
    console.error('Error updating center:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Deletes a center by centerID (UUID).
 * @param {string} centerID
 * @returns {{success: boolean, error?: string}}
 */
export async function deleteCenter(centerID) {
  try {
    await constants.docClient.send(
      new DeleteCommand({
        TableName: constants.CENTERS_TABLE,
        Key: { centerID: centerID }, // String UUID
      })
    )
    return { success: true }
  } catch (err) {
    console.error('Error deleting center:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Gets all centers.
 * @returns {Array}
 */
export async function getAllCenters() {
  try {
    const command = new ScanCommand({
      TableName: constants.CENTERS_TABLE,
    })
    const result = await constants.docClient.send(command)
    return result.Items || []
  } catch (err) {
    console.error('Error getting all centers:', err)
    return []
  }
}

/**
 * Get all events (for admin dashboard, etc.)
 * @returns {Array}
 */
export async function getAllEvents() {
  try {
    const command = new ScanCommand({
      TableName: constants.EVENTS_TABLE,
    })
    const result = await constants.docClient.send(command)
    return result.Items || []
  } catch (err) {
    console.error('Error getting all events:', err)
    return []
  }
}
