# JWT Authentication System

## Overview

The Chinmaya Janata app uses JWT (JSON Web Token) authentication for secure user sessions. This document explains how the authentication system works and how to use it in your components.

## Architecture

### Frontend (React Native/Expo)

- **UserContext** (`packages/frontend/components/contexts/UserContext.tsx`): Manages authentication state and provides methods for login, signup, logout
- **Token Storage** (`packages/frontend/components/utils/tokenStorage.ts`): Handles secure storage of JWT tokens using AsyncStorage
- **Auth Screen** (`packages/frontend/app/auth.tsx`): User interface for authentication

### Backend (Node.js/Express)

- **JWT Utilities** (`packages/backend/utils/jwt.js`): Functions to generate and verify JWT tokens
- **Auth Methods** (`packages/backend/authentication/authenticateMethods.js`): Handles user registration, login, and token verification
- **Middleware** (`isAuthenticated`): Protects routes requiring authentication

## How It Works

### 1. User Registration

```typescript
const { signup } = useContext(UserContext)
const result = await signup('user@example.com', 'SecurePass123!')

if (result.success) {
  // User registered and automatically logged in
  // JWT token stored in AsyncStorage
} else {
  console.error(result.message)
}
```

**Backend Flow:**

1. Password is hashed using bcrypt (10 salt rounds)
2. User created in DynamoDB
3. Automatically logs in and returns JWT token
4. Token expires in 30 days

### 2. User Login

```typescript
const { login } = useContext(UserContext)
const result = await login('user@example.com', 'SecurePass123!')

if (result.success) {
  // JWT token stored in AsyncStorage
  // User data stored in context
} else {
  console.error(result.message) // "Invalid credentials"
}
```

**Backend Flow:**

1. Fetches user from DynamoDB by username
2. Compares password with bcrypt.compare()
3. Generates JWT token with payload: `{ id, username }`
4. Returns token and user data

### 3. Token Verification on App Start

When the app starts, UserContext automatically:

1. Checks for stored JWT token
2. Calls `/api/auth/verify` endpoint
3. If valid, restores user session
4. If invalid, clears token and requires re-login

### 4. Making Authenticated API Calls

Use the `authenticatedFetch` method from UserContext:

```typescript
import { useContext } from 'react'
import { UserContext } from '../components/contexts'

const MyComponent = () => {
  const { authenticatedFetch } = useContext(UserContext)

  const fetchUserData = async () => {
    try {
      const response = await authenticatedFetch('/api/users/profile', {
        method: 'GET',
      })
      const data = await response.json()
      console.log(data)
    } catch (error) {
      // Handle error (token expired, network error, etc.)
      console.error(error.message)
    }
  }

  const updateProfile = async (updates) => {
    try {
      const response = await authenticatedFetch('/api/auth/update-profile', {
        method: 'PUT',
        body: JSON.stringify(updates),
      })
      const result = await response.json()
      console.log('Profile updated:', result)
    } catch (error) {
      console.error(error.message)
    }
  }

  return (
    // ... your component
  )
}
```

**What `authenticatedFetch` does:**

- Retrieves JWT token from AsyncStorage
- Adds `Authorization: Bearer <token>` header
- Handles token expiration (401/403 responses)
- Automatically logs out user if token is invalid

### 5. Logout

```typescript
const { logout } = useContext(UserContext)
await logout()
// Token removed from AsyncStorage
// User state cleared
// Backend notified via /api/auth/deauthenticate
```

## Backend API Endpoints

### Public Endpoints (No Authentication Required)

- `POST /api/auth/register` - Register new user
- `POST /api/auth/authenticate` - Login
- `POST /api/userExistence` - Check if username exists

### Protected Endpoints (Require JWT Token)

- `GET /api/auth/verify` - Verify token validity
- `POST /api/auth/deauthenticate` - Logout
- `POST /api/auth/complete-onboarding` - Complete user onboarding
- `PUT /api/auth/update-profile` - Update user profile
- All `/api/centers/*` routes
- All `/api/events/*` routes
- All `/api/users/*` routes

## Protecting New Backend Routes

To protect a route, use the `isAuthenticated` middleware:

```javascript
import authMethods from '../authentication/authenticateMethods.js'

// Protected route - requires valid JWT token
router.get('/api/secret-data', authMethods.isAuthenticated, (req, res) => {
  // req.user contains the authenticated user data
  res.json({
    message: 'This is protected data',
    user: req.user,
  })
})
```

## Token Structure

### JWT Payload

```javascript
{
  id: user._id,           // User's database ID
  username: user.username, // User's username/email
  iat: 1234567890,        // Issued at timestamp
  exp: 1237246290         // Expiration timestamp (30 days)
}
```

### Token Storage

- **Location**: AsyncStorage (React Native)
- **Key**: `@auth_token`
- **Format**: JWT string (e.g., `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## Security Features

1. **Password Hashing**: bcrypt with 10 salt rounds
2. **Token Expiration**: 30-day expiry
3. **Secure Storage**: AsyncStorage (encrypted on iOS)
4. **HTTPS**: All production API calls use HTTPS
5. **Token Validation**: Backend verifies token signature and expiration
6. **Automatic Logout**: Invalid tokens trigger automatic logout

## Environment Variables

Required in `.env` file:

```bash
JWT_SECRET=your_secret_key_here  # Used to sign and verify tokens
```

**Important**: Use a strong, random JWT_SECRET in production!

```bash
# Generate a secure secret:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Error Handling

### Frontend Errors

- `"No authentication token found"` - User not logged in
- `"Session expired. Please login again."` - Token expired or invalid
- `"Invalid credentials"` - Wrong username/password
- `"Network error. Please try again."` - Connection failed

### Backend Errors

- `401 Unauthorized` - Missing Authorization header
- `403 Forbidden` - Invalid or expired token
- `409 Conflict` - Username already exists
- `500 Internal Server Error` - Server error

## Best Practices

1. **Always use `authenticatedFetch`** for protected API calls
2. **Handle token expiration gracefully** - Show login prompt
3. **Don't store sensitive data** in JWT payload (it's not encrypted, just signed)
4. **Rotate JWT_SECRET** periodically in production
5. **Use HTTPS** in production to prevent token interception
6. **Log out on suspicious activity** (multiple devices, unusual locations)

## Example Usage

See `packages/frontend/components/examples/AuthenticatedAPIExample.tsx` for complete working examples.

## Testing

### Test Registration

```bash
curl -X POST http://3.236.142.145/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test@example.com","password":"Test123456!"}'
```

### Test Login

```bash
curl -X POST http://3.236.142.145/api/auth/authenticate \
  -H "Content-Type: application/json" \
  -d '{"username":"test@example.com","password":"Test123456!"}'
```

### Test Token Verification

```bash
curl -X GET http://3.236.142.145/api/auth/verify \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Troubleshooting

### "Authorization header missing"

- Ensure you're using `authenticatedFetch` or manually adding `Authorization: Bearer <token>` header

### "Invalid or expired token"

- Token may have expired (30 days)
- JWT_SECRET may have changed on backend
- Token may be corrupted in storage
- Solution: Log out and log back in

### "User not found"

- Token is valid but user was deleted from database
- Solution: Clear token and require re-registration

---

_Om Sri Chinmaya Sadgurave Namaha. Om Sri Gurubyo Namaha._
