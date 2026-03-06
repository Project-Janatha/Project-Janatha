import express from 'express'
import fs from 'fs'
import db from '../database/dynamoHelpers.js'
import authMethods from '../authentication/authenticateMethods.js'
import event from '../events/event.js'
import eventMethods from '../events/eventStorage.js'
import user from '../profiles/user.js'
import center from '../profiles/center.js'
import location from '../location/location.js'
import { v4 as uuidv4 } from 'uuid'

const router = express.Router()

// API root endpoint - TESTER HTML
router.get('/', (req, res) => {
  console.log('Sending Tester!')
  res.set('Content-Type', 'text/html')
  return res.status(200).send(fs.readFileSync('./packages/backend/testerIndex.html'))
})

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Backend is running',
    timestamp: new Date().toISOString(),
  })
})

// User existence check
router.post('/userExistence', async (req, res) => {
  try {
    const { username } = req.body
    const exists = await authMethods.checkUserExistence(username)
    res.json({ existence: exists })
  } catch (error) {
    console.error('Error checking user existence:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Authentication routes
router.post('/auth/authenticate', authMethods.authenticate)
router.post('/auth/register', authMethods.register)
router.post('/auth/deauthenticate', authMethods.deauthenticate)
router.get('/auth/verify', authMethods.isAuthenticated, (req, res) => {
  // If we get here, token is valid (middleware already verified it)
  res.status(200).json({
    message: 'Token is valid',
    user: req.user,
  })
})
router.post(
  '/auth/complete-onboarding',
  authMethods.isAuthenticated,
  authMethods.completeOnboarding
)
router.put('/auth/update-profile', authMethods.isAuthenticated, authMethods.updateProfile)
router.delete('/auth/delete-account', authMethods.isAuthenticated, authMethods.deleteAccount)

// Legacy auth routes (for backward compatibility)
router.post('/register', authMethods.register)
router.post('/authenticate', authMethods.authenticate)
router.post('/deauthenticate', authMethods.deauthenticate)

// Center routes
router.get('/centers', async (req, res) => {
  try {
    const centers = await authMethods.getAllCenters()
    res.json({ centers })
  } catch (error) {
    console.error('Error getting centers:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/addCenter', async (req, res) => {
  try {
    let c = new center.Center(
      new location.Location(req.body.latitude, req.body.longitude),
      req.body.centerName
    )
    // Set optional new fields if provided
    if (req.body.address) c.address = req.body.address
    if (req.body.website) c.website = req.body.website
    if (req.body.phone) c.phone = req.body.phone
    if (req.body.image) c.image = req.body.image
    if (req.body.pointOfContact) c.pointOfContact = req.body.pointOfContact
    if (req.body.acharya) c.acharya = req.body.acharya
    let id = await c.assignCenterID()
    let success = await authMethods.storeCenter(id, c)
    if (!success) {
      return res.status(500).json({ message: 'Internal server error OR center ID not unique' })
    }
    return res.status(200).json({ message: 'Operation successful', id: id })
  } catch (error) {
    console.error('Error adding center:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/verifyCenter', async (req, res) => {
  try {
    const centerID = req.body.centerID
    let c = await authMethods.getCenterByCenterID(centerID)
    if (c && c.verify(req)) {
      return res.status(200).json({ message: 'Successful verification!' })
    }
    return res
      .status(401)
      .json({ message: 'User is not authorized to verify or verification failed.' })
  } catch (error) {
    console.error('Error verifying center:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/removeCenter', async (req, res) => {
  try {
    const centerID = req.body.centerID
    if (authMethods.removeCenter(centerID, req)) {
      return res.status(200).json({ message: 'Successful removal!' })
    }
    return res.status(401).json({ message: 'Insufficient permissions' })
  } catch (error) {
    console.error('Error removing center:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/fetchAllCenters', async (req, res) => {
  try {
    let li = await authMethods.getAllCenters()
    if (!li) {
      return res.status(500).json({ message: 'Internal server error.' })
    }
    // If username provided, compute isMember flag for each center
    const username = req.body.username
    if (username) {
      const u = await authMethods.getUserByUsername(username)
      const memberships = (u && u.centerMemberships) ? u.centerMemberships : []
      li = li.map((c) => ({ ...c, isMember: memberships.includes(c.centerID) }))
    }
    return res.status(200).json({ message: 'Successful', centersList: li })
  } catch (error) {
    console.error('Error fetching centers:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/fetchCenter', async (req, res) => {
  try {
    const { centerID, username } = req.body
    const c = await authMethods.getCenterByCenterID(centerID)
    if (!c) return res.status(400).json({ message: 'Malformed centerID' })

    const centerJSON = c.toJSON()
    if (username) {
      const u = await authMethods.getUserByUsername(username)
      const memberships = (u && u.centerMemberships) ? u.centerMemberships : []
      centerJSON.isMember = memberships.includes(centerID)
    }
    return res.status(200).json({ message: 'Success', center: centerJSON })
  } catch (error) {
    console.error('Error fetching center:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// User routes
router.post('/verifyUser', async (req, res) => {
  try {
    const dbUser = await db.getUserByUsername(req.body.usernameToVerify)
    if (!dbUser) {
      return res.status(404).json({ message: 'User not found.' })
    }
    let u = new user.User(req.body.usernameToVerify, true)
    u.buildFromJSON(dbUser)
    let status = u.verify(req.body.verificationLevel, req)
    await authMethods.updateUserData(req.body.usernameToVerify, u)
    if (status) {
      return res.status(200).json({ message: 'Verification successful.' })
    }
    return res.status(401).json({ message: 'Insufficient permission to authorize.' })
  } catch (err) {
    console.error('Verify user error:', err)
    return res.status(500).json({ message: 'Internal Server Error' })
  }
})

router.post('/userUpdate', async (req, res) => {
  try {
    const result = await authMethods.updateUserData(
      req.body.username,
      new user.User(req.body.username).buildFromJSON(req.body.userJSON)
    )
    return result
      ? res.status(200).json({ message: 'Operation successful.' })
      : res.status(400).json({ message: 'userJSON is malformed.' })
  } catch (error) {
    console.error('Error updating user:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/updateRegistration', async (req, res) => {
  try {
    const u = new user.User(req.body.username)
    u.buildFromJSON(req.body.userJSON)
    const ok = await authMethods.updateUserData(req.body.username, u)
    if (ok) {
      return res.status(200).json({ message: 'User updated' })
    }
    return res.status(400).json({ message: 'Update failed' })
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error' })
  }
})

router.post('/removeUser', async (req, res) => {
  try {
    const u = new user.User(req.body.username)
    const ok = await u.removeUserByUsername(req.body.username)
    if (ok) {
      return res.status(200).json({ message: 'User removed' })
    }
    return res.status(400).json({ message: 'Removal failed' })
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error' })
  }
})

router.post('/getUserEvents', async (req, res) => {
  try {
    const u = await authMethods.getUserByUsername(req.body.username)
    if (!u || !u.exists) {
      return res.status(404).json({ message: 'User not found' })
    }
    return res.status(200).json({ message: 'Success', events: u.events })
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error' })
  }
})

// Event routes
router.post('/addevent', async (req, res) => {
  try {
    const data = req.body
    const centerID = data.centerID // UUID string — do not parseInt
    const exists = await authMethods.centerIDExists(centerID)
    if (!exists) {
      return res.status(404).send({ message: 'Center not found.' })
    }
    let ev = new event.Event(
      new location.Location(parseFloat(data.latitude), parseFloat(data.longitude)),
      new Date(data.date),
      centerID // Store only the ID
    )
    // Set optional new fields if provided
    if (data.description) ev.description = data.description
    if (data.title) ev.title = data.title
    if (data.address) ev.address = data.address
    if (data.pointOfContact) ev.pointOfContact = data.pointOfContact
    if (data.image) ev.image = data.image
    if (data.endDate) ev.endDate = new Date(data.endDate)
    let id = ev.assignID()
    for (let i = 0; i < (data.endorsers || []).length; i++) {
      const endorser = data.endorsers[i]
      if (await authMethods.checkUserExistence(endorser)) {
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

router.post('/removeEvent', async (req, res) => {
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

router.post('/fetchEvent', async (req, res) => {
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

router.post('/updateEvent', async (req, res) => {
  try {
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

router.post('/getEventUsers', async (req, res) => {
  const body = req.body
  if (!body || typeof body.id === 'undefined') {
    return res.status(400).json({ message: 'Bad request - missing id' })
  }

  try {
    const doc = await eventMethods.getEventByID(body.id)
    if (!doc) {
      return res.status(404).json({ message: 'Event not found' })
    }

    // buildFromJSON handles both flat records and legacy nested eventObject
    const ev = new event.Event()
    ev.buildFromJSON(doc)

    const users = await ev.getAttendingUsers()
    return res.status(200).json({ message: 'Success', users })
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message })
  }
})

router.post('/fetchEventsByCenter', async (req, res) => {
  try {
    const events = await db.getEventsByCenterId(req.body.centerID)
    return res.status(200).json({ message: 'Success', events: events })
  } catch (err) {
    console.error('Fetch events by center error:', err)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

// Center membership routes
router.post('/joinCenter', authMethods.isAuthenticated, async (req, res) => {
  try {
    const { centerID } = req.body
    if (!centerID) {
      return res.status(400).json({ message: 'centerID is required' })
    }
    const exists = await authMethods.centerIDExists(centerID)
    if (!exists) {
      return res.status(404).json({ message: 'Center not found' })
    }
    const userData = await db.getUserById(req.user.id)
    if (!userData) {
      return res.status(404).json({ message: 'User not found' })
    }
    const memberships = userData.centerMemberships || []
    if (memberships.includes(centerID)) {
      return res.status(200).json({ message: 'Already a member' })
    }
    memberships.push(centerID)
    await db.updateUser(req.user.id, { centerMemberships: memberships })
    // Increment memberCount on the center
    const centerData = await db.getCenterById(centerID)
    if (centerData) {
      await db.updateCenter(centerID, { memberCount: (centerData.memberCount || 0) + 1 })
    }
    return res.status(200).json({ message: 'Joined center successfully' })
  } catch (err) {
    console.error('Join center error:', err)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

router.post('/leaveCenter', authMethods.isAuthenticated, async (req, res) => {
  try {
    const { centerID } = req.body
    if (!centerID) {
      return res.status(400).json({ message: 'centerID is required' })
    }
    const userData = await db.getUserById(req.user.id)
    if (!userData) {
      return res.status(404).json({ message: 'User not found' })
    }
    const memberships = (userData.centerMemberships || []).filter(id => id !== centerID)
    await db.updateUser(req.user.id, { centerMemberships: memberships })
    // Decrement memberCount on the center
    const centerData = await db.getCenterById(centerID)
    if (centerData) {
      await db.updateCenter(centerID, { memberCount: Math.max(0, (centerData.memberCount || 0) - 1) })
    }
    return res.status(200).json({ message: 'Left center successfully' })
  } catch (err) {
    console.error('Leave center error:', err)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

// Message routes
router.post('/addMessage', authMethods.isAuthenticated, async (req, res) => {
  try {
    const { eventID, text, image } = req.body
    if (!eventID || !text) {
      return res.status(400).json({ message: 'eventID and text are required' })
    }
    const result = await db.createMessage({
      eventID,
      authorUsername: req.user.username,
      text,
      image: image || null,
    })
    if (result.success) {
      return res.status(201).json({ message: 'Message created', messageID: result.messageID })
    }
    return res.status(500).json({ message: 'Failed to create message' })
  } catch (err) {
    console.error('Add message error:', err)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

router.post('/fetchEventMessages', authMethods.isAuthenticated, async (req, res) => {
  try {
    const { eventID } = req.body
    if (!eventID) {
      return res.status(400).json({ message: 'eventID is required' })
    }
    const messages = await db.getMessagesByEventId(eventID)
    return res.status(200).json({ message: 'Success', messages })
  } catch (err) {
    console.error('Fetch messages error:', err)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

router.post('/deleteMessage', authMethods.isAuthenticated, async (req, res) => {
  try {
    const { messageID } = req.body
    if (!messageID) {
      return res.status(400).json({ message: 'messageID is required' })
    }
    const msg = await db.getMessageById(messageID)
    if (!msg) {
      return res.status(404).json({ message: 'Message not found' })
    }
    // Only author or admin may delete
    if (msg.authorUsername !== req.user.username && !authMethods.isUserAdmin(req)) {
      return res.status(403).json({ message: 'Forbidden' })
    }
    const result = await db.deleteMessage(messageID)
    if (result.success) {
      return res.status(200).json({ message: 'Message deleted' })
    }
    return res.status(500).json({ message: 'Failed to delete message' })
  } catch (err) {
    console.error('Delete message error:', err)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

// All events (for discover feed)
router.get('/events', async (req, res) => {
  try {
    const events = await db.getAllEvents()
    return res.status(200).json({ events })
  } catch (err) {
    console.error('Get all events error:', err)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

// Toggle event attendance (add or remove current user)
router.post('/attendEvent', authMethods.isAuthenticated, async (req, res) => {
  try {
    const { eventID } = req.body
    if (!eventID) return res.status(400).json({ message: 'eventID is required' })

    const doc = await db.getEventById(String(eventID))
    if (!doc) return res.status(404).json({ message: 'Event not found' })

    const username = req.user.username
    const usersAttending = doc.usersAttending || []
    const isAttending = usersAttending.includes(username)
    const newUsersAttending = isAttending
      ? usersAttending.filter((u) => u !== username)
      : [...usersAttending, username]

    await db.updateEvent(String(eventID), {
      usersAttending: newUsersAttending,
      peopleAttending: newUsersAttending.length,
    })

    return res.status(200).json({
      message: isAttending ? 'Unregistered' : 'Registered',
      isRegistered: !isAttending,
      usersAttending: newUsersAttending,
    })
  } catch (err) {
    console.error('Attend event error:', err)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

// Fun route
router.post('/brewCoffee', async (req, res) => {
  return res.status(418).json({
    message:
      'This server is a teapot, and cannot brew coffee. It not just cannot, but it will not. How dare you disgrace this server with a request to brew coffee? This is a server that brews tea. Masala Chai >>> Filter Coffee.',
  })
})

export default router
