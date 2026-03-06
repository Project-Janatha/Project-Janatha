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
      this.profileImage = this.getDefaultAvatar()
      this.centerID = -1
      this.centerMemberships = [] // List of centerIDs the user has joined
      this.points = 0
      this.isVerified = false
      this.verificationLevel = constants.NORMAL_USER
      this.exists = true
      this.isActive = false
      this.id = ''
      this.events = []
      this.email = ''
      this.profileComplete = false
      this.phoneNumber = ''
      this.interests = []
      this.bio = ''
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
   * Sets the home center.
   * @param {string} centerId The center ID of the center.
   * @returns {boolean} A boolean representing success.
   */
  setCenter(centerId) {
    this.centerID = centerId
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
   * Turns this User into JSON (flat — all fields at top level, no nested userObject).
   *
   * @returns {JSON} The user represented as JSON.
   */
  toJSON() {
    return {
      username: this.username,
      firstName: this.firstName,
      lastName: this.lastName,
      dateOfBirth: this.dateOfBirth,
      profileImage: this.profileImage,
      centerID: this.centerID,
      centerMemberships: this.centerMemberships,
      points: this.points,
      isVerified: this.isVerified,
      verificationLevel: this.verificationLevel,
      exists: this.exists,
      isActive: this.isActive,
      id: this.id,
      events: this.events,
      email: this.email,
      profileComplete: this.profileComplete,
      phoneNumber: this.phoneNumber,
      interests: this.interests,
      bio: this.bio,
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
   * Builds this user from a flat DynamoDB record (or legacy nested userObject).
   * @param {JSON} data The JSON from which to build the user.
   */
  buildFromJSON(data) {
    // Support both flat top-level fields and legacy nested userObject
    const src = data.userObject || data
    if (src.exists !== false) {
      this.username = src.username || this.username
      this.firstName = src.firstName || ''
      this.lastName = src.lastName || ''
      this.dateOfBirth = src.dateOfBirth || null
      // Support legacy profilePictureURL field name
      this.profileImage = src.profileImage || src.profilePictureURL || this.getDefaultAvatar()
      // Support legacy 'center' field name
      this.centerID = src.centerID !== undefined ? src.centerID : (src.center !== undefined ? src.center : -1)
      this.centerMemberships = src.centerMemberships || []
      this.points = src.points || 0
      this.isVerified = src.isVerified || false
      this.verificationLevel = src.verificationLevel || constants.NORMAL_USER
      this.exists = src.exists !== undefined ? src.exists : true
      this.isActive = src.isActive || false
      this.id = src.id || ''
      this.events = src.events || []
      this.email = src.email || ''
      this.profileComplete = src.profileComplete || false
      this.phoneNumber = src.phoneNumber || ''
      this.interests = src.interests || []
      this.bio = src.bio || ''
    }
  }
  /**
   * Retrieves the unique user ID from users.db and sets this User's ID to that.
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
