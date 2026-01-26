/**
 * center.js
 * 
 * Om Sri Cinmaya Sadgurave Namaha. Om Sri Gurubyo Namaha.
 * Author: Sahanav Sai Ramesh
 * Date Authored: August 30, 2025
 * Last Date Modified: August 30, 2025
 * All the methods concerning a center profile.
 */
import location from '../location/location.js';
import auth from '../authentication/authenticateMethods.js';
import constants from '../constants.js';
import { v4 as uuidv4 } from 'uuid';
/**
 * Represents a center on the app.
 */
class Center{
  
  /**
   * Constructs a new Center object.
   * @param {location.Location} loc The Location representing the latitudinal-longitudinal pair of the center.
   * @param {string} name The name of the center.
   */
  constructor(loc, name)
  {
    this.location = loc;
    this.name = name;
    this.centerID = -1;
    this.memberCount = 0;
    this.isVerified = false;
  }
  /**
   * Returns this Center as a JSON object.
   * 
   * @returns {JSON} This Center as a JSON object.
   */
  toJSON()
  {
    return {
      'location': this.location.toJSON(),
      'name': this.name,
      'centerID': this.centerID,
      'memberCount': this.memberCount,
      'isVerified': this.isVerified
    }
  }
  /**
   * Builds this Center from a JSON object.
   * @param data The data from which to build this Center object.
   */
  buildFromJSON(data)
  {
    this.location = new Location(0,0);
    this.location.buildFromJSON(data.location);
    this.name = data.name;
    this.centerID = data.centerID;
    this.memberCount = data.memberCount;
    this.isVerified = data.isVerified;
  }
  /**
   * Verifies this center.
   * @param {JSON} req A request made by the admin user to verify that admin is making this request. 
   * @returns {boolean} A boolean representing if the verification was successful or not.
   */
  verify(req)
  {
    if(auth.isUserAdmin(req))
    {
      this.isVerified = true;
      return true;
    }
      return false;
  }
  /**
   * Assigns a unique center ID to this center.
   *
   * @returns {string} The unique center ID assigned (UUID).
   */
  assignCenterID()
  {
    // generate until a unique centerID is found
    const generate = async () => {
      let proposed = uuidv4();
      while (await auth.centerIDExists(proposed)) {
        proposed = uuidv4();
      }
      this.centerID = proposed;
      return proposed;
    };
    return generate();
  }


}

export default {Center};