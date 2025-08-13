/**
 * authenticateMethods.js
 * 
 * Om Sri Cinmaya Sadgurave Namaha. Om Sri Gurubyo Namaha.
 * Author: Sahanav Sai Ramesh
 * Date Authored: August 12, 2025
 * Last Date Modified: August 12, 2025
 * Methods for authentication.
 */

/**
 * Checks if a user is authenticated.
 * @param {JSON} req The request of the query
 * @param {JSON} res The result of the query.
 * @param {function} next The function to call next.
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
async function register(req, res)
{
    const {username, password} = req.body;

    if(!username || !password)
    {
        return res.status(400).json({"message": "Username and password are required."});
    }
    try{
        usersBase.findOne({"username": username}, (err, existing) =>
        {
            if(err)
            {
                return res.status(500).json({"message": "Internal server error"});
            }
            if(existing)
            {
                return res.status(409).json({"message": "User already exists"});
            }
        }
    );
    let passwordHash = await cryptography.hash(password, SALT_ROUNDS);
    const newUser = {'username': username, 'passwordHash': password};
    usersBase.insert(newUser, (err, user) =>
    {
        if(err)
        {
            return res.status(500).json({"message": "Internal server error"});
        }
        return res.status(201).json(
            {"message": "User created successfully"}
        );
    })

    }catch(err)
    {
        console.error("Error: Password hashing ", err);
        return res.status(500).json({"message": "Server error during password hashing"});
    }
}
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
            return res.status(500).json({"message": "Internal server error during authentication"});
        }
        if(!user)
        {
            return res.status(401).json({"message": "User does not exist"});
        }
        if(cryptography.compareSync(password, user.passwordHash))
        {
            return res.status(401).json({"message": "Invalid credentials"});
        }
        req.session.userId = user._id;
        req.session.username = user.username;
        res.status(200).json({"message": "Authentication successful!"});
    });
    
}
async function deauthenticate(req, res)
{
    req.session.destroy((err) => {
        return (err) ? res.status(500).json({"message": "Internal server error in logout"}) : res.status(200).json({"message": "Deauthentication successful!"});
    });
}




module.exports = {isAuthenticated, register, authenticate, deauthenticate};
