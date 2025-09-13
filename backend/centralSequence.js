/**
 * centralSequence.js
 * 
 * Om Sri Cinmaya Sadgurave Namaha. Om Sri Gurubyo Namaha.
 * 
 * Author: Sahanav Sai Ramesh
 * 
 * The central backend sequence.
 */

//Imports
console.log("Imports");
console.log("Starting express");
import cors from 'cors';
console.log("CORS");
import express from 'express';
console.log("Express");
import Datastore from '@seald-io/nedb';
console.log("nedb");
import cryptography from 'bcryptjs';
console.log("Bcrypt");
import session from 'express-session';
console.log("Session");
import fs from 'fs';
console.log("Fs");
console.log("Custom imports");
import auth from './authentication/authenticateMethods.js';
console.log("Authenticate meth");
import event from './events/event.js';
import eventMethods from './events/eventStorage.js';
import user from './profiles/user.js';
import center from './profiles/center.js';
import constants from './constants.js';
import location from './location/location.js';



//Constants
console.log("Constants");
const PORT = 8008;
const SALT_ROUNDS = 12;

//App init
console.log("Entering init");
const app = express();
console.log("Entering usages");
app.use(cors({
  origin: true, // ONLY FOR DEV PURPOSES. Change this to your frontend URL in production
  credentials: true, // Required for cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({extended:true}));
console.log("Entering session usage");
app.use(session({
    "secret": "OmSriCinmayaSadguraveNamahaOmSriSainathayaNamahaOmSriGurubyoNamaha"+(((((Math.random())*Math.random())+2)*Math.random())*(Math.random()*Math.pow(SALT_ROUNDS, 38)*Math.pow(Math.random()+1, Math.random()))), //funny random generation method
    'resave': false,
    'saveUninitialized': false,
    'cookie':
    {
        'maxAge': 1000 * 60 * 60 * 24 * 3,
        'secure': false //change in prod
    }
}));


console.log("Entering definitions");
/**
 * Note to frontend developers:
 * 
 * You may modify this to serve your webpage, or you may not in order to reduce load on the backend.
 */
app.get("/", (req, res) => {
    console.log("Sending Tester!");
    res.set("Content-Type", "text/html");
    return res.status(200).send(fs.readFileSync("./backend/testerIndex.html"));
});
/**
 * Registration pathway.
 * 
 * Requires:
 * {'username': string, 'password': string}
 */
app.post("/register", async (req, res) => {
    console.log("Registration triggered");
    return await auth.register(req, res);
});
/**
 * Authentication pathway.
 * 
 * Requires:
 * {'username': string, 'password': string}
 */
app.post("/authenticate", async (req, res) =>
{
    console.log("Authentication triggered");
    return await auth.authenticate(req, res);
});
/**
 * Deauthentication pathway.
 * 
 * Requires:
 * {'username': string}
 */
app.post("/deauthenticate", async (req, res) => {
    return await auth.deauthenticate(req, res);
});
/**
 * User existence pathway.
 * 
 * Requires:
 * {'username': string}
 */
app.post('/userExistence', async (req, res) => {
    (res.status(200).json({'existence': await auth.checkUserExistence(req.body.username)}));
});
/**
 * Center addition pathway.
 * 
 * Requires:
 * {'latitude': number, 'longitude': number, 'centerName': string}
 */
app.post('/addCenter', async (req, res) => {
    let c = new center.Center(new location.Location(req.body.latitude, req.body.longitude), req.body.centerName);
    let id = c.assignCenterID();
    let success = auth.storeCenter(id, c);
    if(!success)
    {
        return res.status(500).json({'message': "Internal server error OR center ID not unique"});
    }else{
        return res.status(200).json({'message': 'Operation successful', 'id': id});
    }
});
/**
 * Verifies a User. This is an Admin Only request.
 * 
 * Requires:
 * {'usernameToVerify': string, 'usernameCalling': string, 'verificationLevel': number}
 * 
 */
app.post('/verifyUser', async (req, res) =>
{
    constants.usersBase.findOne({'username': req.body.usernameToVerify}, (err, us) =>
    {
        if(err)
        {
            return res.status(500).send({'message': 'Internal Server Error'});
        }
        if(!user)
        {
            return res.status(404).json({'message': 'User not found.'});
        }
        let u = new user.User(req.body.usernameToVerify);
        u.buildFromJSON(us.userObject);
        let status = u.verify(req.body.verificationLevel, req);
        auth.updateUserData(req.body.username, u);
        if(status)
        {
            return res.status(200).json({'message': 'Verification successful.'});
        }else{
            return res.status(401).send({'message': 'Insufficient permission to authorize.'});
        }
    });
});
/**
 * Verifies a center. Admin Only request.
 * 
 * Requires:
 * {'centerID': number}
 */
app.post('/verifyCenter', async (req, res) => {
    let c = auth.getCenterByCenterID((req.body.centerID instanceof number) ? req.body.centerID : parseInt(req.body.centerID));

    if(c.verify(req))
    {
        return res.status(200).json({'message': 'Successful verification!'});
    }else{
        return res.status(401).json({'message': 'User is not authorized to verify or verification failed at another point.'});
    }
});
/**
 * Removes a center. Admin Only request.
 * 
 * Requires:
 *  {'centerID': number}
 */
app.post('/removeCenter', async (req, res) => {
    if(auth.removeCenter((req.body.centerID instanceof number) ? req.body.centerID : parseInt(req.body.centerID), req))
    {
        return res.status(200).json({'message': 'Successful removal!'});
    }else{
        return res.status(401).json({'message': 'Insufficient permissions'});
    }
});
/**
 * Updates a user in the database.
 * Requires:
 * {'userJSON': JSON, 'username': string}
 * userJSON must be valid JSON that can be built into a User properly, or this will throw.
 */
app.post('/userUpdate', async (req, res) =>
{
    return (auth.updateUserData(req.body.username, (new user.User(req.body.username)).buildFromJSON(req.body.userJSON))) ? res.status(200).json({'message': 'Operation successful.'}) : res.status(400).json({'message': "userJSON is malformed."})
});
/**
 * Attempts to force this server to brew Coffee.
 * 
 * Requires:
 * {}
 */
app.post('/brewCoffee', async (req, res) => {
    return res.status(418).json({'message': 'This server is a teapot, and cannot brew coffee. It not just cannot, but it will not. How dare you disgrace this server with a request to brew coffee? This is a server that brews tea. Masala Chai >>> Filter Coffee.'});
});
/**
 * Fetches all centers.
 * 
 * Requires:
 * {}
 */
app.post('/fetchAllCenters', async (req, res) =>
{
    let li = auth.getAllCenters();
    if(li)
    {
        return res.status(200).json({'message': 'Successful', 'centersList': li});
    }
    return res.status(500).json({'message': 'Internal server error.'});
});
/**
 * Fetches a Center by Center ID.
 * 
 * Requires:
 * {'centerID': number}
 */
app.post('/fetchCenter', async (req, res) => {
    let c = auth.getCenterByCenterID((req.body.centerID instanceof number) ? req.body.centerID : parseInt(req.body.centerID));
    return c ? res.status(200).json({'message': "Success", 'center': c.toJSON()}) : res.status(400).json({'message': 'Malformed centerID'});
});
/**
 * Removes an event by ID.
 * 
 * Requires:
 * {'id': number}
 */
app.post('/removeEvent', async (req, res) => {
    if(eventMethods.removeEventByID(req.body.id))
    {
        return res.sendStatus(200);
    }
    return res.sendStatus(500);
});
/**
 * Event adding pathway.
 * 
 * Requires:
 * {'latitude': number, 'longitude': number, 'date': Date, 'centerID': string, 'endorsers': string[]}
 */
app.post('/addevent', async (req, res) =>{
    if(!auth.centerIDExists(req.data.centerID))
    {
        res.status(404).send({'message': "Center not found."});
    }else{
        let ev = event.Event(new location.Location(parseInt(req.data.latitude), parseInt(req.data.longitude)), new Date(req.data.date), auth.getCenterByCenterID(req.data.centerID));
        let id = ev.assignID();
        for(let i in req.data.endorsers)
        {
            if(auth.checkUserExistence(req.data.endorsers[i]))
            {
                ev.addSelfToUserByUsername(req.data.endorsers[i]);
            }
        }
        let tier = ev.calculateTier();
        eventMethods.storeEvent(ev);
        res.status(200).send({'id': id, 'tier': tier});
    }
});

//Should I make an endpoint that only fetches some centers in a certain latitude-longitude range?
//If so, please make this boolean true.
//Different features I'm on the fence about will be around here, so you can always flip this boolean if you think I should do whatever the feature is around here.
const SAHANAV_SHOULD_IMPLEMENT_FEATURE = false;
/**
 * Pathways required for:
 *  Event Fetch
 *  Event Updates
 *  Update Registration
 *  User Removal
 *  User Updates
 *  Get User Events
 *  Fetch All Events Affiliated with CenterID
 */
console.log("Moving to listening area");
app.listen(PORT, (err) => {
    if(err)
    {
        console.error(err);
    }
    console.log(`Server is running on port ${PORT}`);
});