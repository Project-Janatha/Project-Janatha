/**
 * @file centralSequence.js
 * @description The central backend sequence for Janata
 * @author Sahanav Sai Ramesh, Abhiram Ramachandran
 * @date 2025-12-18
 * @module backend/centralSequence
 * @requires express
 * @requires cors
 * @requires bcryptjs
 * @requires jsonwebtoken
 * @requires dotenv
 * @requires cookie-parser
 * @requires ../authentication/authenticateMethods.js
 * @requires ../events/event.js
 * @requires ../events/eventStorage.js
 * @requires ../profiles/user.js
 * @requires ../profiles/center.js
 * @requires ../constants.js
 * @requires ../location/location.js
 *
 * Om Sri Cinmaya Sadgurave Namaha. Om Sri Gurubyo Namaha.
 */

//Imports
console.log('Imports')
console.log('Starting express')
import cors from 'cors'
console.log('CORS')
import express from 'express'
console.log('Express')
// import Datastore from '@seald-io/nedb';
// console.log("nedb");
import cryptography from 'bcryptjs'
console.log('Bcrypt')
// import session from 'express-session';
import jwt from 'jsonwebtoken'
console.log('JWT')
import dotenv from 'dotenv'
console.log('Dotenv')
dotenv.config()
import cookieParser from 'cookie-parser'
console.log('Cookie parser')
console.log('Session')
import fs from 'fs'
console.log('Fs')
console.log('Custom imports')
import auth from './authentication/authenticateMethods.js'
console.log('Authenticate meth')
import event from './events/event.js'
import eventMethods from './events/eventStorage.js'
import user from './profiles/user.js'
import center from './profiles/center.js'
import constants from './constants.js'
import location from './location/location.js'

//Constants
console.log('Constants')
const PORT = 8008
const SALT_ROUNDS = 12

//App init
console.log('Entering init')
const app = express()
console.log('Entering usages')
app.use(
  cors({
    origin: true, // ONLY FOR DEV PURPOSES. Change this to your frontend URL in production
    credentials: true, // Required for cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

//Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
console.log('Entering JWT usage')
// app.use(session({
//     "secret": "OmSriCinmayaSadguraveNamahaOmSriSainathayaNamahaOmSriGurubyoNamaha"+(((((Math.random())*Math.random())+2)*Math.random())*(Math.random()*Math.pow(SALT_ROUNDS, 38)*Math.pow(Math.random()+1, Math.random()))), //funny random generation method
//     'resave': false,
//     'saveUninitialized': false,
//     'cookie':
//     {
//         'maxAge': 1000 * 60 * 60 * 24 * 3,
//         'secure': false //change in prod
//     }
// }));
app.use(cookieParser())

console.log('Entering definitions')
/**
 * Note to frontend developers:
 *
 * You may modify this to serve your webpage, or you may not in order to reduce load on the backend.
 */
app.get('/', (req, res) => {
  console.log('Sending Tester!')
  res.set('Content-Type', 'text/html')
  return res.status(200).send(fs.readFileSync('./backend/testerIndex.html'))
})
/**
 * Registration pathway.
 *
 * Requires:
 * {'username': string, 'password': string}
 */
app.post('/register', async (req, res) => {
  console.log('Registration triggered')
  return await auth.register(req, res)
})
/**
 * Authentication pathway.
 *
 * Requires:
 * {'username': string, 'password': string}
 */
app.post('/authenticate', async (req, res) => {
  console.log('Authentication triggered')
  return await auth.authenticate(req, res)
})
/**
 * Deauthentication pathway.
 *
 * Requires:
 * {'username': string}
 */
app.post('/deauthenticate', async (req, res) => {
  return await auth.deauthenticate(req, res)
})
/**
 * User existence pathway.
 *
 * Requires:
 * {'username': string}
 */
app.post('/userExistence', async (req, res) => {
  res.status(200).json({ existence: await auth.checkUserExistence(req.body.username) })
})
/**
 * Center addition pathway.
 *
 * Requires:
 * {'latitude': number, 'longitude': number, 'centerName': string}
 */
app.post('/addCenter', async (req, res) => {
  let c = new center.Center(
    new location.Location(req.body.latitude, req.body.longitude),
    req.body.centerName
  )
  let id = await c.assignCenterID()
  let success = await auth.storeCenter(id, c)
  if (!success) {
    return res.status(500).json({ message: 'Internal server error OR center ID not unique' })
  } else {
    return res.status(200).json({ message: 'Operation successful', id: id })
  }
})
/**
 * Verifies a User. This is an Admin Only request.
 *
 * Requires:
 * {'usernameToVerify': string, 'usernameCalling': string, 'verificationLevel': number}
 *
 */
app.post('/verifyUser', async (req, res) => {
  constants.usersBase.findOne({ username: req.body.usernameToVerify }, (err, us) => {
    if (err) {
      return res.status(500).json({ message: 'Internal Server Error' })
    }
    if (!us) {
      return res.status(404).json({ message: 'User not found.' })
    }
    let u = new user.User(req.body.usernameToVerify)
    u.buildFromJSON(us.userObject)
    let status = u.verify(req.body.verificationLevel, req)
    auth.updateUserData(req.body.username, u)
    if (status) {
      return res.status(200).json({ message: 'Verification successful.' })
    } else {
      return res.status(401).json({ message: 'Insufficient permission to authorize.' })
    }
  })
})
/**
 * Verifies a center. Admin Only request.
 *
 * Requires:
 * {'centerID': number}
 */
app.post('/verifyCenter', async (req, res) => {
  let centerID =
    req.body.centerID instanceof number ? req.body.centerID : parseInt(req.body.centerID)
  let c = await auth.getCenterByCenterID(centerID)
  if (c && c.verify(req)) {
    return res.status(200).json({ message: 'Successful verification!' })
  } else {
    return res.status(401).json({
      message: 'User is not authorized to verify or verification failed at another point.',
    })
  }
})
/**
 * Removes a center. Admin Only request.
 *
 * Requires:
 *  {'centerID': number}
 */
app.post('/removeCenter', async (req, res) => {
  if (
    auth.removeCenter(
      req.body.centerID instanceof number ? req.body.centerID : parseInt(req.body.centerID),
      req
    )
  ) {
    return res.status(200).json({ message: 'Successful removal!' })
  } else {
    return res.status(401).json({ message: 'Insufficient permissions' })
  }
})
/**
 * Updates a user in the database.
 * Requires:
 * {'userJSON': JSON, 'username': string}
 * userJSON must be valid JSON that can be built into a User properly, or this will throw.
 */
app.post('/userUpdate', async (req, res) => {
  return auth.updateUserData(
    req.body.username,
    new user.User(req.body.username).buildFromJSON(req.body.userJSON)
  )
    ? res.status(200).json({ message: 'Operation successful.' })
    : res.status(400).json({ message: 'userJSON is malformed.' })
})
/**
 * Fetch users attending an event by event ID.
 *
 * Requires:
 * {'id': number}
 */
app.post('/getEventUsers', async function (req, res) {
  const body = req.body
  if (!body || typeof body.id === 'undefined') {
    return res.status(400).json({ message: 'Bad request - missing id' })
  }

  try {
    const doc = await eventMethods.getEventByID(body.id)
    if (!doc) {
      return res.status(404).json({ message: 'Event not found' })
    }

    // build Event instance from stored object if necessary
    let ev
    if (doc.eventObject && doc.eventObject.id) {
      ev = new event.Event()
      ev.buildFromJSON(doc.eventObject)
    } else if (doc.eventObject) {
      ev = new event.Event()
      ev.buildFromJSON(doc.eventObject)
    } else {
      return res.status(500).json({ message: 'Malformed event document' })
    }

    const users = await ev.getAttendingUsers()
    return res.status(200).json({ message: 'Success', users })
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message })
  }
})
/**
 * Attempts to force this server to brew Coffee.
 *
 * Requires:
 * {}
 */
app.post('/brewCoffee', async (req, res) => {
  return res.status(418).json({
    message:
      'This server is a teapot, and cannot brew coffee. It not just cannot, but it will not. How dare you disgrace this server with a request to brew coffee? This is a server that brews tea. Masala Chai >>> Filter Coffee.',
  })
})
/**
 * Fetches all centers.
 *
 * Requires:
 * {}
 */
app.post('/fetchAllCenters', async (req, res) => {
  let li = auth.getAllCenters()
  if (li) {
    return res.status(200).json({ message: 'Successful', centersList: li })
  }
  return res.status(500).json({ message: 'Internal server error.' })
})
/**
 * Fetches a Center by Center ID.
 *
 * Requires:
 * {'centerID': number}
 */
app.post('/fetchCenter', async (req, res) => {
  let centerID =
    req.body.centerID instanceof number ? req.body.centerID : parseInt(req.body.centerID)
  let c = await auth.getCenterByCenterID(centerID)
  return c
    ? res.status(200).json({ message: 'Success', center: c.toJSON() })
    : res.status(400).json({ message: 'Malformed centerID' })
})
/**
 * Removes an event by ID.
 *
 * Requires:
 * {'id': number}
 */
app.post('/removeEvent', async (req, res) => {
  try {
    const removed = await eventMethods.removeEventByID(req.body.id)
    if (removed) {
      return res.sendStatus(200)
    }
    return res.sendStatus(500)
  } catch (err) {
    return res.sendStatus(500)
  }
})
/**
 * Fetch an event by ID.
 *
 * Requires:
 * {'id': number}
 */
app.post('/fetchEvent', async (req, res) => {
  try {
    const ev = await eventMethods.getEventByID(req.body.id)
    if (!ev) {
      return res.status(404).json({ message: 'Event not found' })
    }
    return res.status(200).json({ message: 'Success', event: ev })
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error' })
  }
})

/**
 * Update an event.
 *
 * Requires:
 * {'eventJSON': JSON, 'id': number}
 */
app.post('/updateEvent', async (req, res) => {
  try {
    // Expect eventJSON to be a serializable event structure
    const evt = new event.Event(new location.Location(0, 0), new Date(), null)
    evt.buildFromJSON(req.body.eventJSON)
    const ok = await eventMethods.updateEvent(evt)
    if (ok) {
      return res.status(200).json({ message: 'Event updated' })
    }
    return res.status(400).json({ message: 'Update failed' })
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error' })
  }
})

/**
 * Update registration (user profile update triggered by user).
 *
 * Requires:
 * {'username': string, 'userJSON': JSON}
 */
app.post('/updateRegistration', async (req, res) => {
  try {
    const u = new user.User(req.body.username)
    u.buildFromJSON(req.body.userJSON)
    const ok = auth.updateUserData(req.body.username, u)
    if (ok) {
      return res.status(200).json({ message: 'User updated' })
    }
    return res.status(400).json({ message: 'Update failed' })
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error' })
  }
})

/**
 * Remove a user by username.
 *
 * Requires:
 * {'username': string}
 */
app.post('/removeUser', async (req, res) => {
  try {
    const u = new user.User(req.body.username)
    const ok = u.removeUserByUsername(req.body.username)
    if (ok) {
      return res.status(200).json({ message: 'User removed' })
    }
    return res.status(400).json({ message: 'Removal failed' })
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error' })
  }
})

/**
 * Get events associated with a user.
 *
 * Requires:
 * {'username': string}
 */
app.post('/getUserEvents', async (req, res) => {
  try {
    const u = await auth.getUserByUsername(req.body.username)
    if (!u || !u.exists) {
      return res.status(404).json({ message: 'User not found' })
    }
    return res.status(200).json({ message: 'Success', events: u.events })
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error' })
  }
})

/**
 * Fetch all events affiliated with a center ID.
 *
 * Requires:
 * {'centerID': number}
 */
app.post('/fetchEventsByCenter', async (req, res) => {
  try {
    // eventMethods currently lacks a direct method for this; attempt to fetch all and filter.
    const all = constants.eventsBase // direct access to events DB
    all.find({ 'eventObject.center.centerID': req.body.centerID }, (err, docs) => {
      if (err) {
        return res.status(500).json({ message: 'Internal server error' })
      }
      return res.status(200).json({ message: 'Success', events: docs })
    })
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error' })
  }
})
/**
 * Event adding pathway.
 *
 * Requires:
 * {'latitude': number, 'longitude': number, 'date': Date, 'centerID': string, 'endorsers': string[]}
 */
app.post('/addevent', async (req, res) => {
  try {
    const data = req.body
    const centerID = data.centerID instanceof Number ? data.centerID : parseInt(data.centerID)
    const exists = await auth.centerIDExists(centerID)
    if (!exists) {
      return res.status(404).send({ message: 'Center not found.' })
    }
    const centerObj = await auth.getCenterByCenterID(centerID)
    if (!centerObj) {
      return res.status(404).send({ message: 'Center not found.' })
    }
    let ev = new event.Event(
      new location.Location(parseFloat(data.latitude), parseFloat(data.longitude)),
      new Date(data.date),
      centerObj
    )
    let id = ev.assignID()
    for (let i = 0; i < (data.endorsers || []).length; i++) {
      const endorser = data.endorsers[i]
      if (await auth.checkUserExistence(endorser)) {
        await ev.addSelfToUserByUsername(endorser)
      }
    }
    let tier = ev.calculateTier()
    const stored = await eventMethods.storeEvent(ev)
    if (!stored) {
      return res.status(500).send({ message: 'Failed to store event.' })
    }
    return res.status(200).send({ id: id, tier: tier })
  } catch (err) {
    return res.status(500).send({ message: 'Internal server error' })
  }
})

//Should I make an endpoint that only fetches some centers in a certain latitude-longitude range?
//If so, please make this boolean true.
//Different features I'm on the fence about will be around here, so you can always flip this boolean if you think I should do whatever the feature is around here.
const SAHANAV_SHOULD_IMPLEMENT_FEATURE = false

console.log('Moving to listening area')
app.listen(PORT, (err) => {
  if (err) {
    console.error(err)
  }
  console.log(`Server is running on port ${PORT}`)
})
