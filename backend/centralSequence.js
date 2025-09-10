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


//Constants
console.log("Constants");
const PORT = 8008;
const SALT_ROUNDS = 10;

//App init
console.log("Entering init");
const app = express();
console.log("Entering usages");
app.use(cors({
  origin: 'http://localhost:8081', // Your Expo web client URL
  credentials: true, // Required for cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({extended:true}));
console.log("Entering session usage");
app.use(session({
    "secret": "OmSriCinmayaSadguraveNamahaOmSriSainathayaNamahaOmSriGurubyoNamaha"+(((((Math.random())*Math.random())+2)*Math.random())*(Math.random()*Math.pow(SALT_ROUNDS, 35)*Math.pow(Math.random(), Math.random()))), //funny random generation method
    'resave': false,
    'saveUninitialized': false,
    'cookie':
    {
        'maxAge': 1000 * 60 * 60 * 24 * 3,
        'secure': false //change in prod
    }
}));


console.log("Entering definitions");
app.get("/", (req, res) => {
    console.log("Sending Tester!");
    res.set("Content-Type", "text/html");
    return res.status(200).send(fs.readFileSync("./backend/testerIndex.html"));
});

app.post("/register", async (req, res) => {
    console.log("Registration triggered");
    return await auth.register(req, res);
});
app.post("/authenticate", async (req, res) =>
{
    console.log("Authentication triggered");
    return await auth.authenticate(req, res);
});
app.post("/deauthenticate", async (req, res) => {
    return await auth.deauthenticate(req, res);
});

console.log("Moving to listening area");
app.listen(PORT, (err) => {
    if(err)
    {
        console.error(err);
    }
    console.log(`Server is running on port ${PORT}`);
});