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
const express = require('express');
console.log("Express")
const Datastore = require('nedb');
console.log("nedb")
const cryptography = require('bcryptjs');
console.log("Bcrypt")
const session = require('express-session');
console.log("Session")
const fs = require('fs');
console.log("Fs");
console.log("Custom imports");
const auth = require('./authentication/authenticateMethods');
console.log("Authenticate meth");


//Constants
console.log("Constants");
const PORT = 8008;
const SALT_ROUNDS = 10;

//App init
console.log("Entering init");
const app = express();
console.log("Entering usages");
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
    return res.status(200).send(fs.readFileSync("./testerIndex.html"));
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