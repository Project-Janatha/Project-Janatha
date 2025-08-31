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
   * @returns {number} The unique center ID assigned.
   */
  assignCenterID()
  {
    let proposed = Math.round(Math.random()*constants.CENTER_ID_VARIABILITY);
    while(auth.centerIDExists(proposed) || auth.centerIDExists(proposed) == null)
    {
      proposed = Math.round(Math.random()*constants.CENTER_ID_VARIABILITY);
    }
    this.centerID = proposed;
  }
  

}

export default {Center};