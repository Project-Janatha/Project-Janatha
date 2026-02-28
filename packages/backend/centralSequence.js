/**
 * @file centralSequence.js
 * @description The central backend sequence for Janata
 * @author Sahanav Sai Ramesh, Abhiram Ramachandran
 * @date 2025-12-18
 * @module backend/centralSequence
 *
 * Om Sri Cinmaya Sadgurave Namaha. Om Sri Gurubyo Namaha.
 */
//Imports
console.log('Imports')
console.log('Starting express')
import cors from 'cors'
console.log('CORS')
import express from 'express'
import apiRouter from './routes/api.js'
console.log('Express')
import cryptography from 'bcryptjs'
console.log('Bcrypt')
import jwt from 'jsonwebtoken'
console.log('JWT')
import dotenv from 'dotenv'
console.log('Dotenv')
dotenv.config()
import cookieParser from 'cookie-parser'
console.log('Cookie parser')
import fs from 'fs'
console.log('Fs')
//Constants
console.log('Constants')
const PORT = 8008

//App init
console.log('Entering init')
const app = express()
console.log('Entering usages')

const isProduction = process.env.NODE_ENV === 'production'
const allowNoOrigin = process.env.CORS_ALLOW_NO_ORIGIN === 'true'
const rawCorsOrigins = process.env.CORS_ORIGIN || ''
const configuredOrigins = rawCorsOrigins
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

const devFallbackOrigins = [
  'http://localhost:3000',
  'http://localhost:19006',
  'http://localhost:8081',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:19006',
  'http://127.0.0.1:8081',
]

const allowedOrigins =
  configuredOrigins.length > 0 ? configuredOrigins : isProduction ? [] : devFallbackOrigins

if (allowedOrigins.includes('*')) {
  throw new Error('CORS_ORIGIN cannot include "*" when credentials are enabled.')
}

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) {
        return callback(null, allowNoOrigin)
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true)
      }

      return callback(new Error('Not allowed by CORS'))
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Set-Cookie'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
)

//Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
console.log('Entering definitions')

// Mount API routes under /api (includes tester at /api root)
app.use('/api', apiRouter)

console.log('Moving to listening area')
app.listen(PORT, (err) => {
  if (err) {
    console.error(err)
  }
  console.log(`Server is running on port ${PORT}`)
})
