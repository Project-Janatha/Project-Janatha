### DIRECTORIES
## This file serves as a way in which all libraries can be documented by directory.

# Folders
// Any front end folder here that works as a functional group.


# Files

**Backend:**
backend/centralSequence.js: The central backend sequence.
backend/constants.js: Backend constants. 
    *@EXPORT usersBase: the database with users in it*
backend/testerIndex.html: Tester HTML file.
backend/authentication/authenticateMethods.js: Methods for authentication
    *@EXPORT isAuthenticated(req, res, next): Checks if a user is authenticated.* 
    *register(req, res): Registers a new user.*
    *authenticate(req, res): Authenticates a user.* 
    *deauthenticate(req, res): Deauthenticates a user.*

**Frontend:**
frontend/location: Location services
    location/locationServices.js: gets current position upon asking for permission
        *@EXPORT getCurrentPosition(): returns array containing user lat and lng*

TODO: Update directories with new file structure
TODO: Find good file tree extension to make this easier