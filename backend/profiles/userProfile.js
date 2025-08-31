/**
 * userProfile.js
 * 
 * Om Sri Cinmaya Sadgurave Namaha. Om Sri Gurubyo Namaha.
 * Author: Sahanav Sai Ramesh
 * Date Authored: August 30, 2025
 * Last Date Modified: August 30, 2025
 * All the methods concerning a user profile.
 */
import auth from '../authentication/authenticateMethods.js';
import constants from '../constants.js';

/**
 * Represents a user of the app.
 */
class User 
{
  /**
 * Creates a user provided a username.
 * 
 * @param {string} username The user's username, as stored in users.db.
 */
  constructor(username)
  {
    if(auth.checkUserExistence(username))
    {
      this.username = username;
      this.center = -1;
      this.points = 0;
      this.isVerified = false;
      this.verificationLevel = constants.NORMAL_USER;
      this.exists = true;
      this.isActive = false;
    }else{
      console.error('User does not exist!');
      this.exists = false;
    }
  }
  /**
   * Adds points to a user.
   * @param {number} amount The amount of points to add. Must be non-negative.
   * @returns {number} The user's point count, or -1 if an invalid value was attempted.
   */
  addPoints(amount)
  {
    if(amount >= 0)
    {
      this.points += amount;
      return this.points;
    }
    return -1;
  }
  /**
   * Sets the center.
   * @param {number} centerId The center ID of the center.
   * @returns {boolean} A boolean representing success. 
   */
  setCenter(centerId)
  {
    center = centerId;
    return true;
  }
  /**
   * 
   * @param {number} verifyLevel The level at which the user should be verified. See constants.js.
   * @param {JSON} req A request made by the admin user to verify that admin is making this request. 
   * @returns {boolean} A boolean representing if the verification was successful or not.
   */
  verify(verifyLevel, req)
  {
    if(auth.isUserAdmin(req))
    {
      this.verificationLevel = verifyLevel;
      this.isVerified = true;
      return true;
    }
      return false;
  }
  /**
   * Changes user to active.
   */
  makeActive()
  {
    this.isActive = true;
  }
  /**
   * Changes user to inactive.
   */
  makeInactive()
  {
    this.isActive = false;
  }
  /**
   * Turns this User into JSON.
   * 
   * @returns {JSON} The user represented as JSON.
   */
  toJSON()
  {
    return {
      "username": this.username,
      "center": this.center,
      "points": this.points,
      "isVerified": this.isVerified,
      "verificationLevel": this.verificationLevel,
      "exists": this.exists,
      "isActive": this.isActive
    };
  }
  /**
   * Turns this User into a JSON String.
   * 
   * @returns {string} The user as stringified JSON.
   */
  toString()
  {
    return JSON.stringify(this.toJSON());
  }
}