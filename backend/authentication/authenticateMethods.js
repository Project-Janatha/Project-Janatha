/**
 * authenticateMethods.js
 * 
 * Om Sri Cinmaya Sadgurave Namaha. Om Sri Gurubyo Namaha.
 * Author: Sahanav Sai Ramesh
 * Date Authored: August 12, 2025
 * Last Date Modified: August 30, 2025
 * Methods for authentication.
 */
import Datastore from '@seald-io/nedb';
import { hash, compareSync } from 'bcryptjs';
import constants from '../constants.js';
import user from '../profiles/user.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import center from '../profiles/center.js';
import location from '../location/location.js';
const SALT_ROUNDS = 10;

//Start constants
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbDir = path.join(__dirname, '..', 'db');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir);
}

const usersBase = new Datastore({
    "filename": path.join(dbDir, "users.db"), 
    "autoload":true
});
//const constantFile = require('../constants');


/**
 * Checks if a user is authenticated. Acts as middleware.
 * @param {Request} req The request of the query
 * @param {Request} res The result of the query.
 * @param {function} next The function to call next, provided that the user is authenticated.
 */
function isAuthenticated(req, res, next)
{
    if(req.session.userId)
    {
        next();
    }else{
        res.status(403).json({"message": "User not authenticated"});
    }
}
/**
 * Checks if user is admin.
 * @param {Request} req The request
 * @returns {boolean} A boolean representing if the user is admin or not.
 */
function isUserAdmin(req) {
    return req.session.userId && req.session.username && (req.session.username === constants.ADMIN_NAME);
}

/**
 * Registers a new user.
 * @param {Request} req 
 * @param {Request} res 
 * @returns A response with status.
 */
async function register(req, res)
{
    const {username, password} = req.body;

    if(!username || !password)
    {
        return res.status(400).json({"message": "Username and password are required."});
    }
    try{
        usersBase.findOne({"username": username}, async (err, existing) =>
        {
            if(err)
            {
                console.log(err);
                return res.status(500).json({"message": "Internal server error"});
            }
            if(existing)
            {
                return res.status(409).json({"message": "User already exists"});
            }
            let passwordHash = await hash(password, SALT_ROUNDS);
            let userObject = new user.User(username, true);
            const newUser = {'username': username, 'passwordHash': passwordHash, 'userObject': userObject.toJSON()};
            usersBase.insert(newUser, (err, user) =>
    {
        if(err)
        {
            console.log(err);
            return res.status(500).json({"message": "Internal server error"});
        }
        return res.status(201).json({"message": "User created successfully"});
    })

        }
    );
    
    }catch(err)
    {
        console.error("Error: Password hashing ", err);
        return res.status(500).json({"message": "Server error during password hashing"});
    }
}
/**
 * Authenticates a user.
 * @param {Request} req 
 * @param {Request} res 
 * @returns A response with status.
 */
async function authenticate(req, res)
{
    const {username, password} = req.body;

    if(!username || !password)
    {
        return res.status(400).json({"message": "Username and password are required."});
    }
    usersBase.findOne({"username": username}, (err, user) => {
        if(err)
        {
            console.log(err);
            return res.status(500).json({"message": "Internal server error during authentication"});
        }
        if(!user)
        {
            return res.status(401).json({"message": "User does not exist"});
        }
        if(!compareSync(password, user.passwordHash))
        {
            return res.status(401).json({"message": "Invalid credentials"});
        }
        req.session.userId = user._id;
        req.session.username = user.username;
        return res.status(200).json({"message": "Authentication successful!", 'user': user.userObject});
    });
    
}
async function deauthenticate(req, res)
{
    req.session.destroy((err) => {
        console.log(err);
        return (err) ? res.status(500).json({"message": "Internal server error in logout"}) : res.status(200).json({"message": "Deauthentication successful!"});
    });
}
/**
 * Checks user existence.
 * @param {string} username 
 * @returns {boolean} A boolean representing the state of the user's existence.
 */
async function checkUserExistence(username)
{
    return new Promise((resolve, reject) => {
        usersBase.findOne({"username": username}, async (err, existing) =>
            {
                if(err)
                {
                    console.log(err);
                    return reject(res.status(500).json({"message": "Internal server error"}));
                }
                resolve(!!existing);
            }); 
                
        });
}
/**
 * Constructs a User object by username.
 * @param {string} username The user's username.
 * @returns {user.User | null} If the user exists, returns a user constructed with their data. Else, returns null.
 */
function getUserByUsername(username)
{
    if(checkUserExistence(username))
    {
        let constructedUser = user.User(username);
        usersBase.findOne({'username': username}, async (err, existing) => {
            if(err)
            {
                return null;
            }else{
                constructedUser.buildFromJSON(existing.userObject);
            }
        });
        return constructedUser;
    }
    return null;
}
/**
 * Updates a user's data in the database.
 * @param {string} username The username of the user to update the data of.
 * @param {user.User} user The user to update the user data with.
 * @returns {boolean} A boolean representing if the operation was successful.
 */
function updateUserData(username, user)
{
    let flag = false;
    usersBase.update({'username': username}, {$set: {'userObject': user.toJSON()}}, {}, (err, numReplaced) => {
        flag = !(err || !numReplaced);
    });
    return flag;
}
/**
 * Checks if a centerID exists in the database. 
 * @param {number} centerID The Center ID to check.
 * @returns {boolean | null} A boolean representing if the centerID exists, or null for any errors.
 */
function centerIDExists(centerID)
{
    usersBase.findOne({'centerID': centerID}, async (err, center) => {
        if(isNaN(centerID) || err)
        {
            return null;
        }
        if(center)
        {
            return true;
        }
        
    });
    return false;
}
/**
 * Gets a Center by centerID.
 * @param {number} centerID The ID of the center to get
 * @returns {center.Center | null} A constructed Center object, or null if an error occurred/the center does not exist.
 */
function getCenterByCenterID(centerID)
{
    if(centerIDExists(centerID))
    {
        usersBase.findOne({'centerID': centerID}, async (err, centered) => {
            if(err)
            {
                return null;
            }
            if(center)
            {
                let c = new center.Center(new location.Location(0,0), 'Hello World!');
                return c.buildFromJSON(centered.centerObject);
            }
        })
    }
    return null;
}
/**
 * Stores a Center by centerID.
 * @param {number} centerID The generated centerID of the center.
 * @param {center.Center} centerObject The object representing the center.
 * @returns {boolean} A boolean representing the success or failure of the operation.
 */
function storeCenter(centerID, centerObject)
{
    if(centerObject.centerID != centerID || centerIDExists(centerID) || isNaN(centerID) || centerID == null)
    {
        return false;
    }
    let center = {'centerID': centerID, 'centerObject': centerObject.toJSON()};
    usersBase.insert(center, async (err, c) => {
        if(err)
        {
            return false;
        }
        if(c)
        {
            return true;
        }
    });
    return false;
}
/**
 * Updates a center in the database.
 * @param {number} centerID The center ID to update.
 * @param {center.Center} centerObject The Center to update data with.
 * @returns {boolean} A boolean representing the success or failure of the operation.
 */
function updateCenter(centerID, centerObject)
{
    if(centerObject.centerID != centerID)
    {
        return false;
    }
    usersBase.update({'centerID': centerID}, {$set: {'centerObject': centerObject.toJSON()}}, {}, (err, numUpdated) => {
        if(err)
        {
            return false;
        }
        if(numUpdated)
        {
            return true;
        }
    });
    return false;
}
/**
 * Removes a center.
 * @param {number} centerID The center ID of the center.
 * @param {Request} req A request from the admin, confirming that sufficient permissions exist.
 * @returns {boolean | undefined} A boolean representing the success of the operation. If an error occurred, returns undefined.
 */
function removeCenter(centerID, req)
{

    if(isUserAdmin(req))
    {
    usersBase.remove({'centerID': centerID}, {}, (err, num) =>
    {
        if(err)
        {
            return undefined;
        }
        if(num)
        {
            return true;
        }
    });
    }
    return false;
}
/**
 * Gets a list of all centers.
 * 
 * @returns {boolean | JSON[]} Returns a boolean representing the success of the operation, or the array of all centers as JSON.
 */
function getAllCenters()
{
    usersBase.find({'centerID': {$exists: true}}, (err, docs) => 
    {
        if(err)
        {
            return false;
        }
        return docs;
    });
}




export default {isAuthenticated, register, authenticate, deauthenticate, checkUserExistence, getUserByUsername, updateUserData, centerIDExists, getCenterByCenterID, getAllCenters, storeCenter, updateCenter, removeCenter, isUserAdmin};
