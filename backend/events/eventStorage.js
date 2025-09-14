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

import event from './event.js';
import constants from '../constants.js';
import user from '../profiles/user.js';
import center from '../profiles/center.js';
//TODO: create getEventsByCenterID

/**
 * Stores an event in the database.
 * @param {event.Event} eventToStore The event to store in the database.
 * @returns {boolean} A boolean representing the success or failure of the operation.
 */
async function storeEvent(eventToStore) {
  const db = constants.eventsBase;
  const payload = { 'eventID': eventToStore.id, 'eventObject': eventToStore.toJSON() };
  const unique = await checkEventUniqueness(payload.eventID);
  if (!unique) {
    return false;
  }
  db.insert(payload, (err, ev) => {
    if (err || !ev) {
      return false;
    }
    return true;
  });
}
/**
 * Updates an Event entry in the database.
 * @param {event.Event} eventObject The object to insert.
 * @returns {boolean | undefined} A boolean representing the success or failure of the operation, or undefined if an error occurred.
 */
function updateEvent(eventObject) {
  return new Promise(async (resolve) => {
    const exists = await checkEventUniqueness(eventObject.id);
    if (exists) {
      // if uniqueness check says id is unique, it means event doesn't exist
      return resolve(false);
    }
    constants.eventsBase.update({ 'eventID': eventObject.id }, { 'eventObject': eventObject.toJSON() }, {}, (err, num) => {
      if (err) {
        return resolve(false);
      }
      if (num) {
        return resolve(true);
      }
      return resolve(false);
    });
  });
}

/**
 * Checks if an ID is unique in the database.
 * @param {number} id The ID to check.
 * @returns {boolean | undefined} A boolean representing if the entry was unique, or undefined if an error occurred.
 */
async function checkEventUniqueness(id) {
  return new Promise((resolve) => {
    constants.eventsBase.findOne({ 'eventID': id }, (err, ev) => {
      if (err) {
        return resolve(false);
      }
      return resolve(!ev);
    });
  });
}
/**
 * Gets an event by the event ID.
 * @param {string} id The ID of the event to get.
 * @returns {event.Event | null} The resulting event or null if no event was found.
 */
function getEventByID(id) {
  return new Promise((resolve) => {
    constants.eventsBase.findOne({ 'eventID': id }, (err, doc) => {
      if (err) {
        return resolve(null);
      }
      return resolve(doc || null);
    });
  });
}
/**
 * Removes an event by ID.
 * @param {number} id The ID of the event to remove.
 * @returns {boolean | undefined} A boolean representing the success of the operation, or undefined if an error occurred.
 */
function removeEventByID(id) {
  return new Promise((resolve) => {
    constants.eventsBase.remove({ 'eventID': id }, {}, (err, num) => {
      if (err) {
        return resolve(false);
      }
      return resolve(!!num);
    });
  });
}
export default {checkEventUniqueness, updateEvent, storeEvent, getEventByID, removeEventByID};