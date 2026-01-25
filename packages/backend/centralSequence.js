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

// AGGRESSIVE CORS - Debug version
app.use((req, res, next) => {
  console.log('Incoming request:', req.method, req.url)
  console.log('Origin:', req.headers.origin)
  next()
})

app.use(
  cors({
    origin: function (origin, callback) {
      console.log('CORS check for origin:', origin)
      // Always allow requests with no origin
      if (!origin) {
        console.log('No origin - allowing')
        return callback(null, true)
      }
      // Allow everything in development
      console.log('Allowing origin:', origin)
      return callback(null, true)
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Set-Cookie'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
)

// Additional manual CORS headers as backup
app.use((req, res, next) => {
  const origin = req.headers.origin
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin)
  }
  res.header('Access-Control-Allow-Credentials', 'true')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With, Accept, Origin'
  )

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204)
  }
  next()
})

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
