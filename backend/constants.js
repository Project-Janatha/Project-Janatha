/**
 * constants.js
 * 
 * Om Sri Cinmaya Sadgurave Namaha. Om Sri Gurubyo Namaha.
 * 
 * Author: Sahanav Sai Ramesh
 * Date Created: August 12, 2025
 * Date Last Modified: August 12, 2025
 * 
 * Backend constants.
 */
//Imports
const Datastore = require('nedb');

//Start constants
const usersBase = new Datastore({"filename": "users.db", "autoload":true});


//Export
module.exports = {usersBase};
