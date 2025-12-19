/**
 * @file authenticateMethods.js
 * @description Methods for user authentication and authorization.
 * @author Sahanav Sai Ramesh, Abhiram Ramachandran
 * @date 2025-12-19
 * @module backend/authentication/authenticateMethods
 * @requires ../database/dynamoHelpers.js
 * @requires ../utils/jwt.js
 * @requires bcryptjs
 *
 * Om Sri Cinmaya Sadgurave Namaha. Om Sri Gurubyo Namaha.
 */
// import Datastore from '@seald-io/nedb';
import * as db from '../database/dynamoHelpers.js'
import bcrypt from 'bcryptjs'
import { generateToken, verifyToken } from '../utils/jwt.js'

const SALT_ROUNDS = 10

/**
 * Checks if a user is authenticated. Acts as middleware.
 * @param {Request} req The request of the query
 * @param {Request} res The result of the query.
 * @param {function} next The function to call next, provided that the user is authenticated.
 */
function isAuthenticated(req, res, next) {
  const authHeader = req.headers.authorization
  if (authHeader) {
    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token)
    if (decoded) {
      req.user = decoded
      next()
    } else {
      res.status(403).json({ message: 'Invalid or expired token' })
    }
  } else {
    res.status(401).json({ message: 'Authorization header missing' })
  }
}
/**
 * Checks if user is admin.
 * @param {Request} req The request
 * @returns {boolean} A boolean representing if the user is admin or not.
 */
function isUserAdmin(req) {
  return req.user && req.user.username && req.user.username === constants.ADMIN_NAME
}

/**
 * Registers a new user.
 * @param {Request} req
 * @param {Request} res
 * @returns A response with status.
 */
async function register(req, res) {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' })
  }
  try {
    usersBase.findOne({ username: username }, async (err, existing) => {
      if (err) {
        console.log(err)
        return res.status(500).json({ message: 'Internal server error' })
      }
      if (existing) {
        return res.status(409).json({ message: 'User already exists' })
      }
      let passwordHash = await hash(password, SALT_ROUNDS)
      let userObject = new user.User(username, true)
      const newUser = {
        username: username,
        passwordHash: passwordHash,
        userObject: userObject.toJSON(),
      }
      usersBase.insert(newUser, (err, user) => {
        if (err) {
          console.log(err)
          return res.status(500).json({ message: 'Internal server error' })
        }
        return res.status(201).json({ message: 'User created successfully' })
      })
    })
  } catch (err) {
    console.error('Error: Password hashing ', err)
    return res.status(500).json({ message: 'Server error during password hashing' })
  }
}
/**
 * Authenticates a user.
 * @param {Request} req
 * @param {Request} res
 * @returns A response with status.
 */
async function authenticate(req, res) {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' })
  }
  usersBase.findOne({ username: username }, (err, user) => {
    if (err) {
      console.log(err)
      return res.status(500).json({ message: 'Internal server error during authentication' })
    }
    if (!user) {
      return res.status(401).json({ message: 'User does not exist' })
    }
    if (!compareSync(password, user.passwordHash)) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }
    const token = generateToken(user)
    return res
      .status(200)
      .json({ message: 'Authentication successful!', user: user.userObject, token: token })
  })
}
async function deauthenticate(req, res) {
  return res.status(200).json({ message: 'Deauthentication successful!' })
}
/**
 * Checks user existence.
 * @param {string} username
 * @returns {boolean} A boolean representing the state of the user's existence.
 */
async function checkUserExistence(username) {
  return new Promise((resolve, reject) => {
    usersBase.findOne({ username: username }, async (err, existing) => {
      if (err) {
        console.log(err)
        return reject(res.status(500).json({ message: 'Internal server error' }))
      }
      resolve(!!existing)
    })
  })
}
/**
 * Constructs a User object by username.
 * @param {string} username The user's username.
 * @returns {user.User | null} If the user exists, returns a user constructed with their data. Else, returns null.
 */
async function getUserByUsername(username) {
  const exists = await checkUserExistence(username)
  if (!exists) {
    return null
  }
  return new Promise((resolve) => {
    usersBase.findOne({ username: username }, (err, existing) => {
      if (err || !existing) {
        return resolve(null)
      }
      let constructedUser = new user.User(username)
      constructedUser.buildFromJSON(existing.userObject)
      return resolve(constructedUser)
    })
  })
}
/**
 * Updates a user's data in the database.
 * @param {string} username The username of the user to update the data of.
 * @param {user.User} user The user to update the user data with.
 * @returns {boolean} A boolean representing if the operation was successful.
 */
function updateUserData(username, user) {
  let flag = false
  usersBase.update(
    { username: username },
    { $set: { userObject: user.toJSON() } },
    {},
    (err, numReplaced) => {
      flag = !(err || !numReplaced)
    }
  )
  return flag
}
/**
 * Checks if a centerID exists in the database.
 * @param {number} centerID The Center ID to check.
 * @returns {boolean | null} A boolean representing if the centerID exists, or null for any errors.
 */
async function centerIDExists(centerID) {
  return new Promise((resolve) => {
    if (isNaN(centerID)) {
      return resolve(false)
    }
    usersBase.findOne({ centerID: centerID }, (err, center) => {
      if (err) {
        return resolve(false)
      }
      resolve(!!center)
    })
  })
}
/**
 * Gets a Center by centerID.
 * @param {number} centerID The ID of the center to get
 * @returns {center.Center | null} A constructed Center object, or null if an error occurred/the center does not exist.
 */
async function getCenterByCenterID(centerID) {
  const exists = await centerIDExists(centerID)
  if (!exists) {
    return null
  }
  return new Promise((resolve) => {
    usersBase.findOne({ centerID: centerID }, (err, centered) => {
      if (err || !centered) {
        return resolve(null)
      }
      let c = new center.Center(new location.Location(0, 0), 'Hello World!')
      c.buildFromJSON(centered.centerObject)
      resolve(c)
    })
  })
}
/**
 * Stores a Center by centerID.
 * @param {number} centerID The generated centerID of the center.
 * @param {center.Center} centerObject The object representing the center.
 * @returns {boolean} A boolean representing the success or failure of the operation.
 */
async function storeCenter(centerID, centerObject) {
  if (centerObject.centerID != centerID || isNaN(centerID) || centerID == null) {
    return false
  }
  const exists = await centerIDExists(centerID)
  if (exists) {
    return false
  }
  let center = { centerID: centerID, centerObject: centerObject.toJSON() }
  return new Promise((resolve) => {
    usersBase.insert(center, (err, c) => {
      if (err || !c) {
        resolve(false)
      } else {
        resolve(true)
      }
    })
  })
}

/**
 * Updates a center in the database.
 * @param {number} centerID The center ID to update.
 * @param {center.Center} centerObject The Center to update data with.
 * @returns {boolean} A boolean representing the success or failure of the operation.
 */
function updateCenter(centerID, centerObject) {
  if (centerObject.centerID != centerID) {
    return false
  }
  usersBase.update(
    { centerID: centerID },
    { $set: { centerObject: centerObject.toJSON() } },
    {},
    (err, numUpdated) => {
      if (err) {
        return false
      }
      if (numUpdated) {
        return true
      }
    }
  )
  return false
}
/**
 * Removes a center.
 * @param {number} centerID The center ID of the center.
 * @param {Request} req A request from the admin, confirming that sufficient permissions exist.
 * @returns {boolean | undefined} A boolean representing the success of the operation. If an error occurred, returns undefined.
 */
function removeCenter(centerID, req) {
  if (isUserAdmin(req)) {
    usersBase.remove({ centerID: centerID }, {}, (err, num) => {
      if (err) {
        return undefined
      }
      if (num) {
        return true
      }
    })
  }
  return false
}
/**
 * Gets a list of all centers.
 *
 * @returns {boolean | JSON[]} Returns a boolean representing the success of the operation, or the array of all centers as JSON.
 */
function getAllCenters() {
  usersBase.find({ centerID: { $exists: true } }, (err, docs) => {
    if (err) {
      return false
    }
    return docs
  })
}

/**
 * Complete user onboarding profile
 * Called after user completes all onboarding steps
 */
async function completeOnboarding(req, res) {
  const { userId, firstName, lastName, dateOfBirth, centerID, profileComplete } = req.body

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' })
  }

  try {
    // Get existing user
    const user = await db.getUserById(userId)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Update user with onboarding data
    const updates = {
      firstName: firstName || '',
      lastName: lastName || '',
      dateOfBirth: dateOfBirth || null,
      centerID: centerID || null,
      profileComplete: profileComplete || false,
    }

    const result = await db.updateUser(userId, updates)

    if (result.success) {
      return res.status(200).json({
        message: 'Profile completed successfully',
        user: result.user,
      })
    } else {
      return res.status(500).json({
        message: 'Failed to update profile',
        error: result.error,
      })
    }
  } catch (err) {
    console.error('Onboarding completion error:', err)
    return res.status(500).json({ message: 'Server error' })
  }
}

/**
 * Update user profile (partial update during onboarding)
 */
async function updateProfile(req, res) {
  const { userId, ...updates } = req.body

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' })
  }

  try {
    const result = await db.updateUser(userId, updates)

    if (result.success) {
      return res.status(200).json({
        message: 'Profile updated',
        user: result.user,
      })
    } else {
      return res.status(500).json({
        message: 'Failed to update profile',
        error: result.error,
      })
    }
  } catch (err) {
    console.error('Profile update error:', err)
    return res.status(500).json({ message: 'Server error' })
  }
}

export default {
  isAuthenticated,
  register,
  authenticate,
  deauthenticate,
  checkUserExistence,
  getUserByUsername,
  updateUserData,
  centerIDExists,
  getCenterByCenterID,
  getAllCenters,
  storeCenter,
  updateCenter,
  removeCenter,
  isUserAdmin,
  completeOnboarding,
  updateProfile,
}
