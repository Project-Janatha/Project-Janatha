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

/**
 * Stores an event in the database.
 * @param {event.Event} eventToStore The event to store in the database.
 * @returns {boolean} A boolean representing the success or failure of the operation.
 */
function storeEvent(eventToStore)
{
  let db = constants.eventsBase;

  let payload = {'eventID': eventToStore.id, 'eventObject': eventToStore.toJSON()};
  if(!checkEventUniqueness(payload.eventID))
  {
    return false;
  }
  db.insert(payload, (err, ev) => {
    if(err)
    {
      return false;
    }
    if(ev)
    {
      return true;
    }
  });
  return false;
}
/**
 * Updates an Event entry in the database.
 * @param {event.Event} eventObject The object to insert.
 * @returns {boolean | undefined} A boolean representing the success or failure of the operation, or undefined if an error occurred.
 */
function updateEvent(eventObject)
{
  if(checkEventUniqueness(eventObject.id))
  {
    return false;
  }
  constants.eventsBase.update({'eventID': eventObject.id}, {'eventObject': eventObject.toJSON()}, {}, (err, num) =>
  {
    if(err)
    {
      return undefined;
    }
    if(num)
    {
      return true;
    }
  });
  return false;
}

/**
 * Checks if an ID is unique in the database.
 * @param {number} id The ID to check.
 * @returns {boolean | undefined} A boolean representing if the entry was unique, or undefined if an error occurred.
 */
function checkEventUniqueness(id)
{
  constants.eventsBase.findOne({'eventID': id}, (err, ev) =>{
    if(err)
    {
      return undefined;
    }
    if(ev)
    {
      return false;
    }
  });
  return true;
}
/**
 * Gets an event by the event ID.
 * @param {string} id The ID of the event to get.
 * @returns {event.Event | null} The resulting event or null if no event was found.
 */
function getEventByID(id)
{
  constants.eventsBase.findOne({'eventID': id}, (err, doc) => {
    if(err)
    {
      return null;
    }
    if(doc){
      return doc;
    }
  });
  return null;
}
export default {checkEventUniqueness, updateEvent, storeEvent, getEventByID};