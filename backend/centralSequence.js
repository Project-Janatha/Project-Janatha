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
const express = require('express');
const Datastore = require('nedb');
const cryptography = require('bcryptjs');
const session = require('express-session');
const auth = require('authentication/authenticateMethods');

//Constants
const port = 8000;
const SALT_ROUNDS = 10;

//App init
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
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



app.get("/", (req, res) => {
    
});

app.post("/register", async (req, res) => {
    return await auth.register(req, res);
});
app.post("/authenticate", async (req, res) =>
{
    return await auth.authenticate(req, res);
});
app.post("/deauthenticate", async (req, res) => {
    return await auth.deauthenticate(req, res);
});