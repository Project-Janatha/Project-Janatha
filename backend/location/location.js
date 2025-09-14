/**
 * location.js
 * 
 * Om Sri Cinmaya Sadgurave Namaha. Om Sri Gurubyo Namaha.
 * Author: Sahanav Sai Ramesh
 * Date Authored: August 30, 2025
 * Last Date Modified: August 30, 2025
 * Location storage method.
 */

/**
 * Represents a location.
 */
class Location{
  /**
   * Constructs the location.
   * @param {number} lat The latitude of the location.
   * @param {number} long The longitude of the location.
   */
  constructor(lat, long)
  {
    this.latitude = lat;
    this.longitude = long;
  }
  /**
   * Converts this location to JSON.
   * 
   * @returns {JSON} This location as JSON.
   */
  toJSON()
  {
    return {
      "latitude": this.latitude,
      "longitude": this.longitude
    };
  }

  /**
   * Converts this location to a JSON string.
   * 
   * @returns {string} This location as a JSON string.
   */
  toJSONString()
  {
    return JSON.stringify(this.toJSON());
  }

  /**
   * Converts this location to a parenthetical ordered pair string.
   * 
   * @returns {string} This location as a parenthetical ordered pair.
   */
  toOrderedPair()
  {
    return `(${this.latitude}, ${this.longitude})`;
  }
  /**
   * Builds this location from JSON.
   * @param {JSON} data The data to build this object from.
   */
  buildFromJSON(data)
  {
    this.latitude = data.latitude;
    this.longitude = data.longitude;
  }
}
export default {Location};