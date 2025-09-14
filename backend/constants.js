/**
 * constants.js
 * 
 * Om Sri Cinmaya Sadgurave Namaha. Om Sri Gurubyo Namaha.
 * 
 * Author: Sahanav Sai Ramesh
 * Date Created: August 12, 2025
 * Date Last Modified: September 2, 2025
 * 
 * Backend constants.
 */
//Imports
import Datastore from 'nedb';

//Start constants
//Databases
const usersBase = new Datastore({"filename": "users.db", "autoload":true});
const eventsBase = new Datastore({'filename': 'events.db', 'autoload': true});

//Admin constants
const ADMIN_NAME = "Brahman";

//User-Based constants
const NORMAL_USER = 45;
const SEVAK = 54;
const SENIOR_SEVAK = 63;
const BRAHMACHARI = 108;
const SWAMI = 1008;
const GLOBAL_HEAD = 1000008;
const ADMIN_CUTOFF = 107;

//Center-Based constants
const CENTER_ID_VARIABILITY = 9108100899;

//Event-Based constants
const EVENT_ID_VARIABILITY = 910810089910081000008;
const TIER_DESCALE = 1081008;
//Event Categories
const SATSANG = 91;
const BHIKSHA = 92;


//Export
export default {usersBase, eventsBase, ADMIN_NAME, ADMIN_CUTOFF, NORMAL_USER, SEVAK, SENIOR_SEVAK, BRAHMACHARI, SWAMI, GLOBAL_HEAD, CENTER_ID_VARIABILITY, EVENT_ID_VARIABILITY, TIER_DESCALE, SATSANG, BHIKSHA};
