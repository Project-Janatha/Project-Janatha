/**
 * user.js
 *
 * Om Sri Cinmaya Sadgurave Namaha. Om Sri Gurubyo Namaha.
 * Author: Sahanav Sai Ramesh
 * Date Authored: August 30, 2025
 * Last Date Modified: September 3, 2025
 * All the methods concerning a user profile.
 */
import auth from '../authentication/authenticateMethods.js'
import constants from '../constants.js'
import event from '../events/event.js'
import db from '../database/dynamoHelpers.js'

/**
 * Represents a user of the app.
 */
class User {
  /**
   * Creates a user provided a username.
   *
   * @param {string} username The user's username, as stored in users.db.
   * @param {boolean} isCalledAtRegistration A boolean representing if this method is called at registration.
   */
  constructor(username, isCalledAtRegistration = false) {
    if (isCalledAtRegistration || auth.checkUserExistence(username)) {
      this.username = username
      this.firstName = ''
      this.lastName = ''
      this.dateOfBirth = null // Stored as a Date object.
      this.profilePictureURL = this.getDefaultAvatar()
      this.center = -1
      this.points = 0
      this.isVerified = false
      this.verificationLevel = constants.NORMAL_USER
      this.exists = true
      this.isActive = false
      this.id = ''
      this.events = []
    } else {
      console.error('User does not exist!')
      this.exists = false
    }
  }

  /**
   * Generates the default avatar for a user.
   * @returns {string} The URL of the default avatar.
   */
  getDefaultAvatar() {
    if (this.firstName && this.lastName) {
      const initials =
        this.firstName.charAt(0).toUpperCase() + this.lastName.charAt(0).toUpperCase()
      return `https://ui-avatars.com/api/?name=${initials}&background=random&size=256`
    } else {
      return 'https://ui-avatars.com/api/?name=User&background=random&size=256'
    }
  }
  /**
   * Adds points to a user.
   * @param {number} amount The amount of points to add. Must be non-negative.
   * @returns {number} The user's point count, or -1 if an invalid value was attempted.
   */
  addPoints(amount) {
    if (amount >= 0) {
      this.points += amount
      return this.points
    }
    return -1
  }
  /**
   * Sets user's first name.
   * @param {string} firstName The first name to set.
   */
  setFirstName(firstName) {
    this.firstName = firstName
    return true
  }
  /**
   * Sets the center.
   * @param {number} centerId The center ID of the center.
   * @returns {boolean} A boolean representing success.
   */
  setCenter(centerId) {
    center = centerId
    return true
  }
  /**
   *
   * @param {number} verifyLevel The level at which the user should be verified. See constants.js.
   * @param {Request} req A request made by the admin user to verify that admin is making this request.
   * @returns {boolean} A boolean representing if the verification was successful or not.
   */
  verify(verifyLevel, req) {
    if (auth.isUserAdmin(req)) {
      this.verificationLevel = verifyLevel
      this.isVerified = true
      return true
    }
    return false
  }
  /**
   * Changes user to active.
   */
  makeActive() {
    this.isActive = true
  }
  /**
   * Changes user to inactive.
   */
  makeInactive() {
    this.isActive = false
  }
  /**
   * Turns this User into JSON.
   *
   * @returns {JSON} The user represented as JSON.
   */
  toJSON() {
    return {
      username: this.username,
      firstName: this.firstName,
      lastName: this.lastName,
      dateOfBirth: this.dateOfBirth,
      profilePictureURL: this.profilePictureURL,
      center: this.center,
      points: this.points,
      isVerified: this.isVerified,
      verificationLevel: this.verificationLevel,
      exists: this.exists,
      isActive: this.isActive,
      id: this.id,
      events: this.events,
    }
  }
  /**
   * Turns this User into a JSON String.
   *
   * @returns {string} The user as stringified JSON.
   */
  toString() {
    return JSON.stringify(this.toJSON())
  }
  /**
   * Builds this user from JSON.
   * @param {JSON} data The JSON from which to build the user.
   */
  buildFromJSON(data) {
    if (data.exists) {
      this.username = data.username
      this.firstName = data.firstName
      this.lastName = data.lastName
      this.dateOfBirth = data.dateOfBirth
      this.profilePictureURL = data.profilePictureURL
      this.center = data.center
      this.points = data.points
      this.isVerified = data.isVerified
      this.verificationLevel = data.verificationLevel
      this.exists = data.exists
      this.isActive = data.isActive
      this.id = data.id
      this.events = data.events
    }
  }
  /**
   * Retrieves the unique user ID from users.db and sets this User's ID to that.
   * NOTE: This method may have to be changed with the classic variability method used in Center and Event based on how testing and deployment flows.
   * @returns {boolean | string} A boolean representing the success of this operation, or the ID fetched.
   */
  async retrieveID() {
    try {
      const user = await db.getUserByUsername(this.username)
      if (!user) {
        return false
      }
      this.id = user.id
      return this.id
    } catch (err) {
      console.error('Retrieve ID error:', err)
      return false
    }
  }
  /**
   * Removes a user by username.
   * @param {string} uname
   * @returns {boolean | undefined} A boolean representing the success of the operation, or undefined if an error occurred.
   */
  async removeUserByUsername(uname) {
    try {
      const user = await db.getUserByUsername(uname)
      if (!user) {
        return false
      }
      const result = await db.deleteUser(user.id)
      return result.success
    } catch (err) {
      console.error('Remove user by username error:', err)
      return false
    }
  }
}

export default { User }
