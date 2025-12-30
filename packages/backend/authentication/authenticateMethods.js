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
import { v4 as uuidv4 } from 'uuid'
import jwt from 'jsonwebtoken'
import { hash, compareSync } from 'bcryptjs'
import user from '../profiles/user.js'
import center from '../profiles/center.js'
import location from '../location/location.js'
import constants from '../constants.js'

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
    const existing = await db.getUserByUsername(username)
    if (existing) {
      return res.status(409).json({ message: 'User already exists' })
    }

    let passwordHash = await hash(password, SALT_ROUNDS)
    let userObject = new user.User(username, true)
    const userId = uuidv4()

    const newUser = {
      id: userId,
      username: username,
      password: passwordHash,
      profileComplete: false,
      firstName: '',
      lastName: '',
      dateOfBirth: null,
      centerID: null,
      userObject: userObject.toJSON(),
    }

    const result = await db.createUser(newUser)

    if (result.success) {
      const token = jwt.sign({ username: username, userId: userId }, constants.JWT_SECRET, {
        expiresIn: '24h',
      })

      return res.status(201).json({
        message: 'User created successfully',
        token: token,
        userId: userId,
        username: username,
      })
    } else {
      return res.status(500).json({ message: 'Registration failed', error: result.error })
    }
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
  try {
    const user = await db.getUserByUsername(username)
    if (!user) {
      return res.status(401).json({ message: 'User does not exist' })
    }
    if (!compareSync(password, user.password)) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }
    const token = generateToken(user)
    return res.status(200).json({ message: 'Authentication successful!', user: user, token: token })
  } catch (err) {
    console.error('Authentication error:', err)
    return res.status(500).json({ message: 'Internal server error during authentication' })
  }
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
  try {
    const user = await db.getUserByUsername(username)
    return !!user
  } catch (err) {
    console.error('Check user existence error:', err)
    return false
  }
}
/**
 * Constructs a User object by username.
 * @param {string} username The user's username.
 * @returns {user.User | null} If the user exists, returns a user constructed with their data. Else, returns null.
 */
async function getUserByUsername(username) {
  try {
    const existing = await db.getUserByUsername(username)
    if (!existing) {
      return null
    }
    let constructedUser = new user.User(username)
    if (existing.userObject) {
      constructedUser.buildFromJSON(existing.userObject)
    }
    return constructedUser
  } catch (err) {
    console.error('Get user by username error:', err)
    return null
  }
}
/**
 * Updates a user's data in the database.
 * @param {string} username The username of the user to update the data of.
 * @param {user.User} user The user to update the user data with.
 * @returns {boolean} A boolean representing if the operation was successful.
 */
async function updateUserData(username, user) {
  try {
    const existing = await db.getUserByUsername(username)
    if (!existing) {
      return false
    }
    const updates = {
      userObject: user.toJSON(),
    }
    const result = await db.updateUser(existing.id, updates)
    return result.success
  } catch (err) {
    console.error('Update user data error:', err)
    return false
  }
}

/**
 * Checks if a centerID exists in the database.
 * @param {string} centerID The Center UUID to check.
 * @returns {boolean} A boolean representing if the centerID exists.
 */
async function centerIDExists(centerID) {
  try {
    const center = await db.getCenterById(centerID)
    return !!center
  } catch (err) {
    console.error('Check center ID error:', err)
    return false
  }
}

/**
 * Gets a Center by centerID.
 * @param {string} centerID The UUID of the center to get
 * @returns {center.Center | null} A constructed Center object, or null if an error occurred/the center does not exist.
 */
async function getCenterByCenterID(centerID) {
  try {
    const dbCenter = await db.getCenterById(centerID)

    if (!dbCenter) {
      return null
    }

    const c = new center.Center(new location.Location(0, 0), 'Hello World!')
    if (dbCenter.centerObject) {
      c.buildFromJSON(dbCenter.centerObject)
    }
    return c
  } catch (err) {
    console.error('Get center by ID error:', err)
    return null
  }
}

/**
 * Stores a Center by centerID.
 * @param {string} centerID The UUID of the center.
 * @param {center.Center} centerObject The object representing the center.
 * @returns {boolean} A boolean representing the success or failure of the operation.
 */
async function storeCenter(centerID, centerObject) {
  try {
    if (centerObject.centerID != centerID || !centerID) {
      return false
    }

    const exists = await centerIDExists(centerID)
    if (exists) {
      return false
    }

    const centerData = {
      centerID: centerID,
      centerObject: centerObject.toJSON(),
    }

    const result = await db.createCenter(centerData)
    return result.success
  } catch (err) {
    console.error('Store center error:', err)
    return false
  }
}

/**
 * Updates a center in the database.
 * @param {string} centerID The center UUID to update.
 * @param {center.Center} centerObject The Center to update data with.
 * @returns {boolean} A boolean representing the success or failure of the operation.
 */
async function updateCenter(centerID, centerObject) {
  try {
    if (centerObject.centerID != centerID) {
      return false
    }

    const updates = {
      centerObject: centerObject.toJSON(),
    }

    const result = await db.updateCenter(centerID, updates)
    return result.success
  } catch (err) {
    console.error('Update center error:', err)
    return false
  }
}

/**
 * Removes a center.
 * @param {string} centerID The center UUID of the center.
 * @param {Request} req A request from the admin, confirming that sufficient permissions exist.
 * @returns {boolean} A boolean representing the success of the operation.
 */
async function removeCenter(centerID, req) {
  try {
    if (!isUserAdmin(req)) {
      return false
    }

    const result = await db.deleteCenter(centerID)
    return result.success
  } catch (err) {
    console.error('Remove center error:', err)
    return false
  }
}

/**
 * Gets a list of all centers.
 *
 * @returns {boolean | JSON[]} Returns a boolean representing the success of the operation, or the array of all centers as JSON.
 */
async function getAllCenters() {
  try {
    const centers = await db.getAllCenters()
    return centers || []
  } catch (err) {
    console.error('Get all centers error:', err)
    return false
  }
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
