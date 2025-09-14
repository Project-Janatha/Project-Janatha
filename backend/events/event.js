/**
 * event.js
 * 
 * Om Sri Cinmaya Sadgurave Namaha. Om Sri Gurubyo Namaha.
 * Author: Sahanav Sai Ramesh
 * Date Authored: August 30, 2025
 * Last Date Modified: September 3, 2025
 * All the methods concerning an event.
 */
import location from '../location/location.js';
import center from '../profiles/center.js';
import user from '../profiles/user.js';
import constants from '../constants.js';
import store from './eventStorage.js';
import auth from '../authentication/authenticateMethods.js';
/**
 * Represents an Event.
 */
class Event{

  /**
   * Constructs an event.
   * @param {location.Location} loc The location of the Event.
   * @param {Date} date The Date at which the Event takes place.
   * @param {string} cen The Center ID of the Center with which the Event is affiliated.
   */
  constructor(loc, date, cen)
  {
    this.location = loc;
    this.date = date;
    this.center = cen;
    this.endorsers = []; //An array of strings containing all the event endorser usernames. Must have status of greater than constants.SEVAK
    this.id = 0; //TODO make a method for this. A number that represents the unique ID of this event.
    this.tier = 0; //The calculated tier of the event.
    this.peopleAttending = 0; //A number that represents how many people are going to the event.
    this.usersAttending = []; 
    this.description = "";
  }
  /**
   * Adds an endorser to this event.
   * @param {user.User} user A User that endorses this event. Must have a verificationLevel of >= 54.
   * @returns {boolean} A boolean that represents the success or failure of the operation.
   */
  addEndorser(user)
  {
    if(user.verificationLevel >= 54)
    {
      this.endorsers.push(user);
    }
  }
  /**
   * Calculates the Tier of an event in accordance with the Tier Ranking system.
   * The Tier Ranking System does the following:
   * Takes the sum of all this.endorsers.points*this.endorsers.verificationLevel
   * Adds to it the amount of people within the event multiplied by the numerical ranking constants.NORMAL_USER.
   * Multiplies it by the 1 + amount of people with numerical ranking constants.BRAHMACHARI or above.
   * 
   * @returns {number} The tier of the event.
   */
  calculateTier()
  {
    let tier = 0;
    let brahmachariAndAbove = 0;
    for(let i = 0; i < this.endorsers.length; i++)
    {
      tier += this.endorsers[i].points*this.endorsers.verificationLevel;
      if(this.endorsers[i].verificationLevel >= constants.BRAHMACHARI)
      {
        brahmachariAndAbove++;
      }
    }
    brahmachariAndAbove;
    tier += this.peopleAttending*constants.NORMAL_USER;
    tier *= brahmachariAndAbove+1;
    tier /= constants.TIER_DESCALE;
    return tier;
    
  }
  /**
   * Sets the description of this Event.
   * @param {string} desc The description to set.
   */
  setDescription(desc)
  {
    this.description = desc;
  }
  /**
   * Turns this Event object into JSON.
   * 
   * @returns {JSON} This Event as JSON.
   */
  toJSON()
  {
    let endorserJSON = [];
    for(i in this.endorsers)
    {
      endorserJSON += this.endorsers[i].toJSON();
    }
    return {
      'location': this.location.toJSON(),
      'date': this.date.toISOString(),
      'center': this.center.toJSON(),
      'endorsers': endorserJSON,
      'id': this.id,
      'tier': this.tier,
      'peopleAttending': this.peopleAttending,
      'usersAttending': this.usersAttending,
      'description': this.description
    };
  }
/**
 * Builds this object from JSON data.
 * @param {JSON} data The data from which the Event should be built.
 */
  buildFromJSON(data)
  {
    let loc = new location.Location(0,0);
    loc.buildFromJSON(data.location);
    this.location = loc;
    this.date = new Date(data.date);
    this.center = data.center;
    this.endorsers = data.endorsers;
    this.id = parseInt(data.id);
    this.tier = parseInt(data.tier);
    this.peopleAttending = parseInt(data.peopleAttending);
    this.usersAttending = data.usersAttending;
    this.description = data.description;
  }
  /**
   * Assigns a new unique ID to this object.
   * 
   * @returns The ID assigned.
   */
  assignID()
  {
    let me = Math.round(Math.random()*constants.EVENT_ID_VARIABILITY);
    while(!store.checkEventUniqueness(id))
    {
      me = Math.round(Math.random()*constants.EVENT_ID_VARIABILITY);
    }
    this.id = me;
    return me;
  }
  /**
   * Adds an event to the user.
   * @param {string} uname The username of the user to add.
   * @returns {user.User | null} The User with the event added
   */
  addSelfToUserByUsername(uname)
  {
    let u = auth.getUserByUsername(uname);
    if(u && !(this.id in u.events))
    {
        u.events.push(this.id);
        this.peopleAttending++;
        this.calculateTier();
        return u;
    }
    return null;
  }
    /**
   * Adds an event to the user.
   * @param {user.User} u The User to add.
   * @returns {user.User | null} The User with the event added
   */
  addSelfToUser(u)
  {
    if(u && !(this.id in u.events))
    {
      u.events.push(this.id);
      this.peopleAttending++;
      return u;
    }
    return null;
  }
}
export default {Event};