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
    this.address = '';
    this.website = '';
    this.phone = '';
    this.image = '';
    this.pointOfContact = '';
    this.acharya = '';
  }
  /**
   * Returns this Center as a flat JSON object (no nested centerObject wrapper).
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
      'isVerified': this.isVerified,
      'address': this.address,
      'website': this.website,
      'phone': this.phone,
      'image': this.image,
      'pointOfContact': this.pointOfContact,
      'acharya': this.acharya,
    }
  }
  /**
   * Builds this Center from a flat DynamoDB record (or legacy nested centerObject).
   * @param data The data from which to build this Center object.
   */
  buildFromJSON(data)
  {
    // Support both flat top-level fields and legacy nested centerObject
    const src = data.centerObject || data;
    this.location = new location.Location(0, 0);
    this.location.buildFromJSON(src.location || {});
    this.name = src.name || '';
    this.centerID = src.centerID;
    this.memberCount = src.memberCount || 0;
    this.isVerified = src.isVerified || false;
    this.address = src.address || '';
    this.website = src.website || '';
    this.phone = src.phone || '';
    this.image = src.image || '';
    this.pointOfContact = src.pointOfContact || '';
    this.acharya = src.acharya || '';
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
