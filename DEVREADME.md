### Conventions:

## Flags
Use in single line comments. //@[FLAG]
*DATABASEPH*: This line is a line that puts items in a test database. Change to production when ready.
*OSSPECIFIC*: This line is specific to a certain operating system (iOS, Android, or Web).

## Merge Strategies
*If two people are working on the same branch:*
```
git config pull.rebase false
git pull origin [BRANCH]
```

*If two people are working on different branches:*
Start a PR. A PR **must be approved by a different developer** than the one who initiates it. That developer must show in their approval or denial message why they took the action they did. 

## Headers
Sample File Header: 
```
/**
 * authenticateMethods.js
 * 
 * Om Sri Cinmaya Sadgurave Namaha. Om Sri Gurubyo Namaha.
 * Author: Sahanav Sai Ramesh
 * Date Authored: August 12, 2025
 * Last Date Modified: August 12, 2025
 * Methods for authentication.
 */
 ```

 Sample Method Header:
 ```
/**
 * Checks if a user is authenticated.
 * @param {JSON} req The request of the query
 * @param {JSON} res The result of the query.
 * @param {function} next The function to call next.
 */
 ```

 **Please ensure your method headers and file headers are compliant before pushing.**