### DIRECTORIES

## This file serves as a way in which all libraries can be documented by directory.

# Folders

// Any front end folder here that works as a functional group.

# Files

**Backend:**
backend/centralSequence.js: The central backend sequence.
backend/constants.js: Backend constants.
_@EXPORT usersBase: the database with users in it_
backend/testerIndex.html: Tester HTML file.
backend/authentication/authenticateMethods.js: Methods for authentication
_@EXPORT isAuthenticated(req, res, next): Checks if a user is authenticated._
_register(req, res): Registers a new user._
_authenticate(req, res): Authenticates a user._
_deauthenticate(req, res): Deauthenticates a user._

**Frontend:**
frontend/location: Location services  
 location/locationServices.js: gets current position upon asking for permission  
 _@EXPORT getCurrentPosition(): returns array containing user lat and lng_

TODO: Update directories with new file structure
TODO: Find good file tree extension to make this easier
