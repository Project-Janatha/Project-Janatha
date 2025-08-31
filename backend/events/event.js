/**
 * event.js
 * 
 * Om Sri Cinmaya Sadgurave Namaha. Om Sri Gurubyo Namaha.
 * Author: Sahanav Sai Ramesh
 * Date Authored: August 30, 2025
 * Last Date Modified: August 30, 2025
 * All the methods concerning an event.
 */
import location from '../location/location.js';
import center from '../profiles/center.js';
import user from '../profiles/user.js';
/**
 * Represents an Event.
 */
class Event{

  /**
   * Constructs an event.
   * @param {location.Location} loc The location of the Event.
   * @param {Date} date The Date at which the Event takes place.
   * @param {center.Center} cen The Center with which the Event is affiliated.
   */
  constructor(loc, date, cen)
  {
    this.location = loc;
    this.date = date;
    this.center = cen;
    this.endorsers = []; //An array of user.Users containing all the event endorsers. Must have status of greater than 
    this.id = 0; //A number that represents the unique ID of this event.
    this.tier = 0; //The calculated tier of the event.
    this.peopleAttending = 0; //A number that represents how many people are going to the event.
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
   * @returns The tier of the event.
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
    
  }
}
export {Event};