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
    return res.status(200).send({'existence': auth.checkUserExistence(req.username)});
});
/**
 * Pathways required for:
 *  Center Addition
 *  Center Fetch
 *  Center Removal
 *  Verification of User and Center
 *  Event Removal
 *  Event Fetch
 *  Event Updates
 *  Update Registration
 *  User Removal
 *  User Updates
 *  Get User Events
 *  Fetch All Centers
 *  Fetch All Events Affiliated with CenterID
 */

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


console.log("Moving to listening area");
app.listen(PORT, (err) => {
    if(err)
    {
        console.error(err);
    }
    console.log(`Server is running on port ${PORT}`);
});