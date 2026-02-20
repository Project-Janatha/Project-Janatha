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
