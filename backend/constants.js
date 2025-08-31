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
import Datastore from 'nedb';

//Start constants
const usersBase = new Datastore({"filename": "users.db", "autoload":true});

//Admin constants
const ADMIN_NAME = "Brahman";

//User-Based constants
const NORMAL_USER = 45;
const SEVAK = 54;
const SENIOR_SEVAK = 63;
const BRAHMACHARI = 108;
const SWAMI = 1008;
const GLOBAL_HEAD = 1000008;



//Export
export default {usersBase, ADMIN_NAME, NORMAL_USER, SEVAK, SENIOR_SEVAK, BRAHMACHARI, SWAMI, GLOBAL_HEAD};
