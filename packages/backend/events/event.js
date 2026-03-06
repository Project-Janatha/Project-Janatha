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
   * @param {string} cen The centerID (UUID string) of the center with which the Event is affiliated.
   */
  constructor(loc, date, cen)
  {
    this.location = loc || new location.Location(0, 0);
    this.date = date || new Date();
    this.centerID = cen || null; // Store only the ID, not the full center object
    this.endorsers = []; // Array of endorser usernames
    this.id = 0;
    this.tier = 0;
    this.peopleAttending = 0;
    this.usersAttending = [];
    this.description = '';
    this.title = '';
    this.address = '';
    this.pointOfContact = '';
    this.image = '';
    this.endDate = null;
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
   *
   * @returns {number} The tier of the event.
   */
  calculateTier()
  {
    let tier = 0;
    let brahmachariAndAbove = 0;
    for(let i = 0; i < this.endorsers.length; i++)
    {
      tier += this.endorsers[i].points * this.endorsers[i].verificationLevel;
      if(this.endorsers[i].verificationLevel >= constants.BRAHMACHARI)
      {
        brahmachariAndAbove++;
      }
    }
    tier += this.peopleAttending * constants.NORMAL_USER;
    tier *= brahmachariAndAbove + 1;
    tier /= constants.TIER_DESCALE;
    this.tier = tier;
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
   * Turns this Event object into flat JSON (no nested eventObject wrapper).
   * Stores only centerID, not the full embedded center object.
   *
   * @returns {JSON} This Event as JSON.
   */
  toJSON()
  {
    const endorserJSON = [];
    for (let i = 0; i < this.endorsers.length; i++) {
      if (this.endorsers[i] && typeof this.endorsers[i].toJSON === 'function') {
        endorserJSON.push(this.endorsers[i].toJSON());
      } else {
        endorserJSON.push(this.endorsers[i]);
      }
    }
    return {
      'location': this.location.toJSON(),
      'date': this.date instanceof Date ? this.date.toISOString() : this.date,
      'centerID': this.centerID,
      'endorsers': endorserJSON,
      'id': this.id,
      'tier': this.tier,
      'peopleAttending': this.peopleAttending,
      'usersAttending': this.usersAttending,
      'description': this.description,
      'title': this.title,
      'address': this.address,
      'pointOfContact': this.pointOfContact,
      'image': this.image,
      'endDate': this.endDate instanceof Date ? this.endDate.toISOString() : this.endDate,
    };
  }
  /**
   * Builds this object from flat JSON data (or legacy nested eventObject).
   * @param {JSON} data The data from which the Event should be built.
   */
  buildFromJSON(data)
  {
    // Support both flat top-level fields and legacy nested eventObject
    const src = data.eventObject || data;
    const loc = new location.Location(0, 0);
    loc.buildFromJSON(src.location || {});
    this.location = loc;
    this.date = src.date ? new Date(src.date) : new Date();
    // Normalize center: accept centerID string or extract from embedded center object
    if (src.centerID) {
      this.centerID = src.centerID;
    } else if (src.center && typeof src.center === 'object' && src.center.centerID) {
      this.centerID = src.center.centerID;
    } else if (src.center && typeof src.center === 'string') {
      this.centerID = src.center;
    } else {
      this.centerID = null;
    }
    this.endorsers = src.endorsers || [];
    this.id = src.id !== undefined ? src.id : 0;
    this.tier = src.tier !== undefined ? parseFloat(src.tier) : 0;
    this.peopleAttending = src.peopleAttending !== undefined ? parseInt(src.peopleAttending) : 0;
    this.usersAttending = src.usersAttending || [];
    this.description = src.description || '';
    this.title = src.title || '';
    this.address = src.address || '';
    this.pointOfContact = src.pointOfContact || '';
    this.image = src.image || '';
    this.endDate = src.endDate ? new Date(src.endDate) : null;
  }
  /**
   * Assigns a new unique ID to this object.
   *
   * @returns The ID assigned.
   */
  assignID()
  {
    let me = Math.round(Math.random()*constants.EVENT_ID_VARIABILITY);
    while(!store.checkEventUniqueness(me))
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
    return (async () => {
      let u = await auth.getUserByUsername(uname);
      if (u && !(this.id in u.events)) {
        u.events.push(this.id);
        this.peopleAttending++;
        // record username in attendees list if not already present
        if (!this.usersAttending.includes(uname)) {
          this.usersAttending.push(uname);
        }
        this.calculateTier();
        return u;
      }
      return null;
    })();
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
      // ensure we record username in this event's attendee list
      if (u.username && !this.usersAttending.includes(u.username)) {
        this.usersAttending.push(u.username);
      }
      this.calculateTier();
      return u;
    }
    return null;
  }

  /**
   * Retrieves all User objects attending this event.
   * @returns {Promise<user.User[]>} Promise resolving to an array of User objects (or empty array).
   */
  async getAttendingUsers() {
    const users = [];
    for (let i = 0; i < this.usersAttending.length; i++) {
      try {
        const uname = this.usersAttending[i];
        const u = await auth.getUserByUsername(uname);
        if (u) {
          users.push(u);
        }
      } catch (err) {
        // skip problematic entries
        continue;
      }
    }
    return users;
  }
}
export default {Event};
