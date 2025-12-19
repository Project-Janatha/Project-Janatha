# Chinmaya Janata Development Guidelines

We are glad that you have decided to do Seva for Mission by helping us work on this project! To ensure this project can be better maintained in the future, please ensure that you adhere to the guidelines listed below before pushing your changes to the codebase.

## Merge Strategies

_If two people are working on the same branch:_

```sh
git config pull.rebase false
git pull origin [BRANCH]
```

_If two people are working on different branches:_
Start a PR. A PR **must be approved by a different developer** than the one who initiates it. That developer must show in their approval or denial message why they took the action they did.

## Commit Messages

Commit messages must be clear in explaining whatever changes that you made to the codebase. Please ensure that you changes are **non-breaking** before pushing them.

## Flags

Use in single line comments. `//@[FLAG]`  
`_DATABASEPH_` This line is a line that puts items in a test database. Change to production when ready.

- NOTE: Needs to be updated for Dynamo changes

`_OSSPECIFIC_` This line is specific to a certain operating system (iOS, Android, or Web).

## Headers

Please ensure that you maintain appropriate documentation by adding headers to every file and function

### Javascript

Sample File Header:

```js
/**
 * @file file.js
 * @author Sahanav Sai Ramesh
 * @description Brief description of the file
 * @date YYYY-MM-DD
 * @module dir/file.js
 * @requires dependencies
 * ...
 *
 * Om Sri Cinmaya Sadgurave Namaha. Om Sri Gurubyo Namaha.
 * Last Date Modified: August 12, 2025
 */
```

Sample Method Header:

```js
/**
 * Brief description of the function or method
 * @param {type} arg1 A parameter passed to the function
 * ...
 * @return {type} Data returned by the function and the purpose of said data
 */
```

**Please ensure your method headers and file headers are compliant before pushing.**

## Imports

**Ensure all imports are done with ES syntax.**
