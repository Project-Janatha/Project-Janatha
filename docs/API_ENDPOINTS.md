# API Endpoints

All endpoints are served under the `/api` base path.

## Health

- `GET /api/health` — Health check and version info

## Auth

- `POST /api/auth/register` — Register a new user account
- `POST /api/auth/authenticate` — Log in and receive JWT tokens
- `POST /api/auth/deauthenticate` — Log out (client-side token discard)
- `GET /api/auth/verify` — Verify a JWT token and return user data (auth required)
- `POST /api/auth/complete-onboarding` — Complete user profile onboarding (auth required)
- `PUT /api/auth/update-profile` — Update user profile fields (auth required)
- `DELETE /api/auth/delete-account` — Permanently delete user account (auth required)

## Users

- `POST /api/userExistence` — Check if a username exists
- `POST /api/verifyUser` — Admin: set user verification level (auth required, admin only)
- `POST /api/userUpdate` — Update a user's profile by username (auth required)
- `POST /api/updateRegistration` — Update a user's registration info
- `POST /api/removeUser` — Remove a user account (auth required)
- `POST /api/getUserEvents` — Get all events a user is attending (auth required)

## Centers

- `GET /api/centers` — List all centers
- `POST /api/addCenter` — Create a new center
- `POST /api/verifyCenter` — Admin: verify a center (auth required, admin only)
- `POST /api/removeCenter` — Admin: remove a center (auth required, admin only)
- `POST /api/fetchAllCenters` — List all centers (legacy POST variant)
- `POST /api/fetchCenter` — Get a single center by ID

## Events

- `POST /api/addevent` — Create a new event (auth required)
- `POST /api/removeEvent` — Remove an event (auth required)
- `POST /api/fetchEvent` — Get a single event by ID
- `POST /api/updateEvent` — Update event fields (auth required)
- `POST /api/getEventUsers` — Get all users attending an event
- `POST /api/attendEvent` — Register attendance for an event (auth required)
- `POST /api/unattendEvent` — Unregister attendance for an event (auth required)
- `POST /api/fetchEventsByCenter` — Get all events for a center

## Legacy (Backward Compatibility)

- `POST /api/register` — Forwards to `/api/auth/register`
- `POST /api/authenticate` — Forwards to `/api/auth/authenticate`
- `POST /api/deauthenticate` — Forwards to `/api/auth/deauthenticate`

## Fun

- `POST /api/brewCoffee` — Returns 418 I'm a teapot
