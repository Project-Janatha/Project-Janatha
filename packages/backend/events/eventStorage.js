/**
 * eventStorage.js
 *
 * Om Sri Cinmaya Sadgurave Namaha. Om Sri Gurubyo Namaha.
 *
 * Author: Sahanav Sai Ramesh
 * Date Authored: 9/2/2025
 * Last Date Modified: 9/3/2025
 *
 * Storage of the Event structure in databases.
 */

import event from './event.js'
import db from '../database/dynamoHelpers.js'
import user from '../profiles/user.js'
import center from '../profiles/center.js'
//TODO: create getEventsByCenterID

/**
 * Stores an event in the database.
 * @param {event.Event} eventToStore The event to store in the database.
 * @returns {boolean} A boolean representing the success or failure of the operation.
 */
async function storeEvent(eventToStore) {
  try {
    const existing = await db.getEventById(eventToStore.id)
    if (existing) {
      return false
    }

    const eventData = {
      eventID: eventToStore.id,
      eventObject: eventToStore.toJSON(),
      centerID: eventToStore.center?.centerID || null,
    }

    const result = await db.createEvent(eventData)
    return result.success
  } catch (err) {
    console.error('Store event error:', err)
    return false
  }
}
/**
 * Updates an Event entry in the database.
 * @param {event.Event} eventObject The object to insert.
 * @returns {boolean | undefined} A boolean representing the success or failure of the operation, or undefined if an error occurred.
 */
async function updateEvent(eventObject) {
  try {
    const existing = await db.getEventById(eventObject.id)
    if (!existing) {
      return false
    }

    const updates = {
      eventObject: eventObject.toJSON(),
    }

    const result = await db.updateEvent(eventObject.id, updates)
    return result.success
  } catch (err) {
    console.error('Update event error:', err)
    return false
  }
}

/**
 * Checks if an ID is unique in the database.
 * @param {number} id The ID to check.
 * @returns {boolean | undefined} A boolean representing if the entry was unique, or undefined if an error occurred.
 */
async function checkEventUniqueness(id) {
  try {
    const event = await db.getEventById(id)
    return !event
  } catch (err) {
    console.error('Check event uniqueness error:', err)
    return false
  }
}
/**
 * Gets an event by the event ID.
 * @param {string} id The ID of the event to get.
 * @returns {event.Event | null} The resulting event or null if no event was found.
 */
async function getEventByID(id) {
  try {
    const doc = await db.getEventById(id)
    return doc || null
  } catch (err) {
    console.error('Get event by ID error:', err)
    return null
  }
}
/**
 * Removes an event by ID.
 * @param {number} id The ID of the event to remove.
 * @returns {boolean | undefined} A boolean representing the success of the operation, or undefined if an error occurred.
 */
async function removeEventByID(id) {
  try {
    const result = await db.deleteEvent(id)
    return result.success
  } catch (err) {
    console.error('Remove event by ID error:', err)
    return false
  }
}
export default { checkEventUniqueness, updateEvent, storeEvent, getEventByID, removeEventByID }
