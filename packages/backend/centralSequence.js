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
app.use(
  cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
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
