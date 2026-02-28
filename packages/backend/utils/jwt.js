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
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config()

// Secret key for JWT signing and verification
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key'

/**
 * Generates a JWT token for a user.
 * @param {Object} user - The user object.
 * @returns {string} - The generated JWT token.
 */
export const generateToken = (user) => {
  return jwt.sign({ id: user.id || user._id, username: user.username }, JWT_SECRET, {
    expiresIn: '30d',
  })
}

/**
 * Generates a refresh token for a user.
 * @param {Object} user - The user object.
 * @returns {string} - The generated refresh token.
 */
export const generateRefreshToken = (user) => {
  const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || JWT_SECRET
  return jwt.sign({ id: user.id || user._id, username: user.username, type: 'refresh' }, REFRESH_SECRET, {
    expiresIn: '90d',
  })
}

/**
 * Verifies a refresh token.
 * @param {string} token - The refresh token to verify.
 * @returns {Object|null} - The decoded token payload if valid and is a refresh token, otherwise null.
 */
export const verifyRefreshToken = (token) => {
  const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || JWT_SECRET
  try {
    const decoded = jwt.verify(token, REFRESH_SECRET)
    if (decoded.type !== 'refresh') {
      return null
    }
    return decoded
  } catch (error) {
    return null
  }
}

/**
 * Verifies a JWT token.
 * @param {string} token - The JWT token to verify.
 * @returns {Object|null} - The decoded token payload if valid, otherwise null.
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}
