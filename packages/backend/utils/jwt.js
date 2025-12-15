/**
 * @file jwt.js
 * @description Utility functions for generating and verifying JSON Web Tokens (JWT).
 * @author Abhiram Ramachandran
 * @date 14 December 2025
 * @module utils/jwt
 * @requires jsonwebtoken
 * @requires dotenv
 *
 * Om Sri Chinmaya Sadgurave Namaha. Om Sri Gurubyo Namaha.
 */
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')

// Load environment variables from .env file
dotenv.config()

// Secret key for JWT signing and verification
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key'

/**
 * Generates a JWT for a given user ID. (30 days expiration)
 * @param {string} userId - The user ID to include in the token payload.
 * @returns {string} The generated JWT.
 */
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' })
}

/**
 * Verifies a JWT and returns the decoded payload.
 * @param {string} token
 * @returns {object|null} The decoded token payload if valid, otherwise null.
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (err) {
    return null
  }
}

// Export the functions
module.exports = {
  generateToken,
  verifyToken,
}
