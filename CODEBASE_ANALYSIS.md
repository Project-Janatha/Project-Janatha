# Project-Janatha: Codebase Structure Analysis

## Project Overview

**Project Name:** Project-Janatha  
**Description:** The official project to connect the CHYKs (children youth knowledge) of Chinmaya Mission West  
**Repository:** https://github.com/Project-Janatha/Project-Janatha  
**Type:** Full-stack Application  

---

## 1. PROJECT TYPE: Full-Stack (Monorepo)

This is a **fullstack monorepo** using:
- **Frontend:** Mobile (React Native + Expo) and Web (React/Expo Web)
- **Backend:** Serverless API (Cloudflare Workers with Hono framework)
- **Workspace Management:** npm workspaces (packages structure)
- **Build Tool:** Turborepo (for monorepo task orchestration)

**Deployment Architecture:**
- Frontend: Cloudflare Pages (static assets)
- Backend: Cloudflare Workers/Pages Functions
- Database: Cloudflare D1 (SQLite)
- Alternative deployment: Docker (EC2 + Nginx + Node.js)

---

## 2. TECHNOLOGY STACK

### Core Framework & Runtime
- **Frontend:** 
  - Expo 54.0.21 (cross-platform)
  - React 19.2.4 & React Native 0.81.5
  - Expo Router 6.0.14 (navigation)
  - React DOM 19.2.4 (web)
  - Nativewind 4.2.2 (Tailwind CSS for React Native)

- **Backend:**
  - Hono 4.7.0 (lightweight web framework for Workers)
  - TypeScript 5.9.2
  - Node.js 20

### Database & Storage
- **Primary:** Cloudflare D1 (SQLite-based distributed SQL database)
- **Legacy:** DynamoDB (migration completed)
- **Tables:** users, centers, events, event_attendees, event_endorsers

### Authentication & Security
- **JWT:** jose library 6.0.0 (JWT signing/verification)
- **Password Hashing:** PBKDF2-SHA256 via Web Crypto API (100k iterations)
- **Token Expiration:** Access tokens: 30 days, Refresh tokens: 90 days

### UI & Styling
- **Component Libraries:**
  - Headless UI/React 2.2.9
  - Lucide React Native 0.545.0 (icons)
  - React Native Maps 1.20.1
  - React Map GL 8.1.0
  - MapLibre GL 4.7.1

- **Styling:**
  - Tailwind CSS (via Nativewind)
  - NativeWind 4.2.2
  - CSS Modules

### Forms & Input
- React DatePicker 8.9.0
- React Native Calendars 1.1313.0
- React Native Date/Time Picker 8.4.4
- React Native Reanimated 4.1.1 (animations)

### UI Feedback (Current)
- **Toast Notifications:** react-native-toast-message 2.3.3 (installed but not actively used)
- **Status Indicators:** In-app UI components

### Development & Testing
- **Build Tool:** Turbo (monorepo orchestration)
- **Testing:** Vitest 4.1.0 with coverage
- **Linting:** Biome (code formatting and linting)
- **Bundler:** Wrangler (Cloudflare bundler for Workers)
- **Package Manager:** npm with Yarn lock (.yarnrc.yml present)
- **Development Utilities:**
  - Concurrently 9.2.1 (run multiple commands)
  - TypeScript strict mode

### Deployment & DevOps
- **Static Hosting:** Cloudflare Pages
- **Serverless:** Cloudflare Workers
- **Container:** Docker + Nginx (alternative EC2 deployment)
- **CI/CD:** GitHub Actions (.github/workflows/)
- **Deployment Config:** wrangler.toml, amplify.yml (AWS Amplify support)

### Development Environment
- **Code Editor Config:** VS Code settings
- **Formatter:** Prettier
- **Git Hooks:** Husky (pre-commit hooks)
- **Dev Container:** Supported (.devcontainer/devcontainer.json)
- **Code Sandbox:** Supported (.codesandbox/tasks.json)

---

## 3. DIRECTORY STRUCTURE

```
/home/sahastasai/Development/Project-Janatha/
├── packages/
│   ├── frontend/                    # Expo + React Native + Web app
│   │   ├── app/                     # Expo Router app directory
│   │   │   ├── (tabs)/              # Tab-based navigation
│   │   │   ├── auth.tsx/auth.web.tsx  # Auth screens (platform-specific)
│   │   │   ├── center/              # Center-related screens
│   │   │   ├── events/              # Event-related screens
│   │   │   ├── profile.tsx          # User profile
│   │   │   ├── settings/            # Settings screens
│   │   │   ├── onboarding.tsx       # Onboarding flow
│   │   │   ├── landing.tsx/landing.web.tsx # Landing (platform-specific)
│   │   │   └── _layout.tsx          # Root layout with providers
│   │   ├── components/              # Reusable UI components
│   │   │   ├── auth/                # Auth-related components
│   │   │   ├── landing/             # Landing page components
│   │   │   ├── onboarding/          # Onboarding components
│   │   │   ├── ui/                  # UI primitives
│   │   │   ├── contexts/            # React Context (UserProvider, ThemeProvider)
│   │   │   ├── web/                 # Web-specific components
│   │   │   ├── Map.tsx/Map.native.tsx/Map.web.tsx # Platform-specific maps
│   │   │   ├── BirthdatePicker.*    # Platform-specific date pickers
│   │   │   └── utils/               # Component utilities
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── utils/                   # Utility functions
│   │   ├── assets/                  # Images, fonts, icons
│   │   ├── dist/                    # Built output (Expo export)
│   │   ├── package.json             # Frontend dependencies
│   │   ├── tsconfig.json            # TypeScript config
│   │   ├── tailwind.config.js       # Tailwind CSS config
│   │   ├── metro.config.js          # Metro bundler config
│   │   ├── babel.config.js          # Babel config
│   │   └── vitest.config.ts         # Test config
│   │
│   └── backend/                     # Cloudflare Workers + Hono API
│       ├── src/                     # TypeScript source
│       │   ├── app.ts               # Main Hono application (867 lines)
│       │   ├── auth.ts              # Auth utilities (PBKDF2, JWT)
│       │   ├── db.ts                # D1 database query functions
│       │   ├── types.ts             # Shared TypeScript types
│       │   ├── middleware.ts        # Rate limiting, validation, security
│       │   ├── constants.ts         # App constants
│       │   └── __tests__/           # Backend tests
│       ├── routes/
│       │   └── api.js               # Legacy route definitions
│       ├── database/
│       │   └── dynamoHelpers.js     # Legacy DynamoDB helpers
│       ├── authentication/          # Legacy auth files
│       ├── profiles/                # Legacy profile handlers
│       ├── events/                  # Legacy event handlers
│       ├── location/                # Legacy location handlers
│       ├── centralSequence.js       # Legacy entry point
│       ├── dynamoClient.js          # Legacy DynamoDB client
│       ├── package.json             # Backend dependencies
│       ├── tsconfig.json            # TypeScript config
│       ├── wrangler.test.toml       # Wrangler test config
│       └── vitest.config.ts         # Test config
│
├── migrations/                      # Database migrations
│   └── 0001_initial_schema.sql      # Initial D1 schema (SQLite)
│
├── infrastructure/                  # Deployment & infrastructure scripts
│   └── scripts/
│       ├── setup-ec2.sh
│       ├── deploy.sh
│       ├── remote-deploy.sh
│       ├── logs.sh
│       ├── ssh-ec2.sh
│       └── rollback.sh
│
├── functions/                       # Cloudflare Pages Functions (legacy)
├── amplify/                         # AWS Amplify configuration (legacy)
│
├── .github/
│   └── workflows/                   # GitHub Actions CI/CD
│       ├── test.yml
│       └── deploy.yml
│
├── dist/                            # Built frontend output
├── node_modules/                    # Root monorepo dependencies
│
├── Configuration Files:
│   ├── package.json                 # Root monorepo workspace config
│   ├── turbo.json                   # Turborepo config
│   ├── tsconfig.base.json           # Base TypeScript config
│   ├── biome.json                   # Biome (linter/formatter) config
│   ├── wrangler.toml                # Cloudflare Wrangler config
│   ├── docker-compose.yml           # Docker Compose for local dev
│   ├── Dockerfile                   # Multi-stage Docker build
│   ├── nginx.conf                   # Nginx reverse proxy config
│   ├── .yarnrc.yml                  # Yarn configuration
│   ├── .prettierrc                  # Prettier formatter config
│   ├── .editorconfig                # EditorConfig standards
│   ├── .gitignore                   # Git ignore rules
│   ├── .dockerignore                # Docker ignore rules
│   └── app.json                     # Expo app configuration
│
└── Documentation:
    ├── README.md                    # Project overview
    ├── DEVREADME.md                 # Development guidelines
    ├── DEPLOYMENT.md                # EC2 deployment guide
    ├── DIRECTORIES.md               # Directory structure docs
    ├── API_ENDPOINTS.md             # API endpoint reference
    ├── JWT_AUTHENTICATION.md        # JWT auth documentation
    ├── CHANGELOG.md                 # Version changelog
    └── MIGRATION_SUMMARY.md         # DynamoDB to D1 migration notes
```

---

## 4. DATABASE SCHEMA (D1/SQLite)

### Core Tables:

#### `users`
```sql
- id (TEXT, PRIMARY KEY)
- username (TEXT, UNIQUE)
- password (TEXT) - PBKDF2 hash
- email, first_name, last_name
- date_of_birth, phone_number
- profile_image (URL/R2 key)
- center_id (FK to centers)
- points (INTEGER, default 0)
- is_verified, is_active, profile_complete (INTEGER: 0|1)
- verification_level (INTEGER, default 45 = NORMAL_USER)
- interests (TEXT - JSON array)
- created_at, updated_at (ISO-8601)
```

#### `centers`
```sql
- id (TEXT, PRIMARY KEY)
- name (TEXT)
- latitude, longitude (REAL)
- address (TEXT)
- member_count (INTEGER)
- is_verified (INTEGER: 0|1)
- created_at, updated_at
```

#### `events`
```sql
- id (TEXT, PRIMARY KEY)
- title, description (TEXT)
- date (ISO-8601 datetime)
- latitude, longitude (REAL)
- address (TEXT)
- center_id (FK to centers)
- tier (INTEGER)
- people_attending (INTEGER)
- point_of_contact (TEXT)
- image (URL/R2 key)
- category (INTEGER: 91=SATSANG, 92=BHIKSHA, etc)
- created_at, updated_at
```

#### `event_attendees` (junction table)
```sql
- event_id (FK to events, ON DELETE CASCADE)
- user_id (FK to users, ON DELETE CASCADE)
- created_at
- PRIMARY KEY (event_id, user_id)
```

#### `event_endorsers` (junction table)
```sql
- event_id (FK to events, ON DELETE CASCADE)
- user_id (FK to users, ON DELETE CASCADE)
- created_at
- PRIMARY KEY (event_id, user_id)
```

---

## 5. EXISTING NOTIFICATION/MESSAGING SYSTEM

### Current Status: MINIMAL/BASIC

**Toast Library Installed:**
- `react-native-toast-message` (v2.3.3) - Present in frontend dependencies
- **Usage:** Installed but NOT actively integrated into components
- **Status:** Available for use but no established pattern

**Current Feedback Mechanisms:**
1. **API Error Responses:** Structured JSON with message field
2. **HTTP Status Codes:** Standard REST status codes (200, 400, 401, 403, 429, 500)
3. **Rate Limiting Headers:** X-RateLimit-* headers for client awareness
4. **In-App UI Feedback:** Manual state management in components (no unified system)

**No Existing:**
- ✗ Push notifications
- ✗ Email notifications
- ✗ SMS notifications
- ✗ In-app notification center/history
- ✗ Real-time messaging between users
- ✗ WebSocket/real-time infrastructure
- ✗ Background job queue for async notifications
- ✗ Notification preferences per user
- ✗ Activity feed/notification timeline

**API Error Handling:**
- Global error handler in Hono middleware
- Consistent error response format: `{ message, error }`
- Rate limiting returns 429 with Retry-After header

---

## 6. KEY ENDPOINTS & ROUTES

### Auth Endpoints
```
POST   /api/auth/register              - Register new user
POST   /api/auth/authenticate          - Login (returns JWT)
POST   /api/auth/deauthenticate        - Logout
GET    /api/auth/verify                - Verify token (requires auth)
POST   /api/auth/complete-onboarding   - Complete profile (requires auth)
PUT    /api/auth/update-profile        - Update profile (requires auth)
DELETE /api/auth/delete-account        - Delete account (requires auth)
```

### User Endpoints
```
POST   /api/userExistence              - Check username exists
POST   /api/verifyUser                 - Admin: set verification level
POST   /api/userUpdate                 - Update user profile
POST   /api/removeUser                 - Remove user account
POST   /api/getUserEvents              - Get user's events
```

### Event Endpoints
```
POST   /api/addevent                   - Create event
POST   /api/removeEvent                - Delete event
POST   /api/fetchEvent                 - Get event details
POST   /api/updateEvent                - Update event
POST   /api/attendEvent                - User attends event
POST   /api/unattendEvent              - User leaves event
POST   /api/getEventUsers              - Get event attendees
POST   /api/fetchEventsByCenter        - Get center's events
```

### Center Endpoints
```
GET    /api/centers                    - List all centers
POST   /api/addCenter                  - Create center
POST   /api/fetchAllCenters            - List centers (POST variant)
POST   /api/fetchCenter                - Get center details
```

---

## 7. KEY MIDDLEWARE & UTILITIES

### Backend Middleware (src/middleware.ts)
- **Rate Limiting:** In-memory sliding window per IP+path
- **Input Validation:** Validators for username, password, email, title, etc.
- **Cache Control:** For read endpoints
- **Security Headers:** X-Content-Type-Options, X-Frame-Options, Referrer-Policy

### Authentication Flow (src/auth.ts)
1. Password hashing: PBKDF2-SHA256 (100k iterations)
2. JWT generation: 30-day expiration, HS256
3. Token verification: jose library
4. Timing-safe comparison: Prevents timing attacks

### Database Layer (src/db.ts)
- Typed query builders for all main operations
- CRUD functions for users, centers, events
- Prepared statements for SQL injection prevention
- Transaction support for complex operations

---

## 8. CONFIGURATION FILES LOCATIONS

| File | Purpose | Location |
|------|---------|----------|
| `wrangler.toml` | Cloudflare Workers/Pages config | `/` |
| `turbo.json` | Monorepo task orchestration | `/` |
| `tsconfig.base.json` | Base TypeScript config | `/` |
| `biome.json` | Linter/formatter (replaces ESLint) | `/` |
| `package.json` | Root workspace + scripts | `/` |
| `docker-compose.yml` | Local Docker development | `/` |
| `Dockerfile` | Production Docker build | `/` |
| `.github/workflows/` | CI/CD pipelines | `/.github/workflows/` |
| `amplify.yml` | AWS Amplify config (legacy) | `/` |
| `packages/frontend/app.json` | Expo app config | `/packages/frontend/` |
| `packages/frontend/tsconfig.json` | Frontend TypeScript config | `/packages/frontend/` |
| `packages/backend/wrangler.test.toml` | Test environment config | `/packages/backend/` |
| `migrations/` | Database schema versions | `/migrations/` |

---

## 9. ENVIRONMENT & INFRASTRUCTURE

### Local Development
- **Frontend Dev:** `npm run dev:frontend` - Expo dev server
- **Backend Dev:** `npm run dev` - Concurrent frontend + backend
- **Both:** `npm run dev` - Runs both concurrently via Concurrently lib
- **Docker:** `docker-compose up`

### Production Deployment

**Option 1: Cloudflare (Recommended)**
- Frontend: Static export → Cloudflare Pages
- Backend: Hono on Cloudflare Workers
- Database: Cloudflare D1 (SQLite)
- Deploy: `npm run deploy`

**Option 2: EC2 + Docker (Legacy)**
- Frontend: Served by Nginx
- Backend: Node.js + Express-like server
- Database: DynamoDB or local SQLite
- Infrastructure: Docker + Nginx reverse proxy
- Scripts: setup-ec2.sh, deploy.sh, rollback.sh

### Build & Optimization
```
npm run build              # Build frontend + backend
npm run build:frontend    # Build frontend only
npm run typecheck         # TypeScript check
npm run deploy            # Deploy to Cloudflare Pages
npm run deploy:preview    # Deploy preview branch
npm run pages:dev         # Local Cloudflare Pages dev
```

---

## 10. KEY ARCHITECTURAL PATTERNS

### Frontend Architecture
- **State Management:** React Context (UserProvider, ThemeProvider)
- **Navigation:** Expo Router (file-based routing)
- **Styling:** Tailwind CSS via Nativewind
- **Responsive:** Platform-specific files (.native, .web)
- **Data Fetching:** Direct API calls (no query client/RTK)

### Backend Architecture
- **Framework:** Hono (minimal, CF Workers-friendly)
- **Database:** D1 with typed query helpers (stateless pattern)
- **Auth:** JWT-based with PBKDF2 hashing
- **Middleware:** Global CORS, security headers, rate limiting
- **Type Safety:** Full TypeScript with strict types

### Cross-Platform Considerations
- Platform-specific implementations:
  - `Component.tsx` - Shared logic
  - `Component.native.tsx` - React Native
  - `Component.web.tsx` - Web-only
  - `Component.ios.tsx` / `Component.android.tsx` - Platform-specific

---

## 11. DEPENDENCIES SUMMARY

### Frontend Key Dependencies (56 total)
- Expo ecosystem (Expo, Router, SecureStore, etc.)
- React 19.2.4 + React Native 0.81.5
- Nativewind 4.2.2 (Tailwind for React Native)
- Navigation & Maps (MapLibre, React Map GL)
- Forms & Dates (React DatePicker, React Calendars)
- UI Components (Headless UI, Lucide Icons)
- **Notifications:** react-native-toast-message (installed, unused)

### Backend Key Dependencies (3 total)
- hono 4.7.0 (web framework)
- jose 6.0.0 (JWT handling)
- @cloudflare/workers-types (types)

### DevDependencies
- TypeScript 5.9.2
- Vitest 4.1.0 (testing)
- Biome (linting/formatting)
- Wrangler 4.0.0 (Cloudflare CLI)

---

## 12. RECOMMENDATIONS FOR NOTIFICATION SYSTEM

### Implementation Strategy

1. **Database Layer:**
   - Add `notifications` table with:
     - id, user_id, type, title, message, read, created_at, data (JSON)
   - Add `notification_preferences` table for user settings

2. **Backend API Endpoints:**
   - `GET /api/notifications` - Fetch user's notifications
   - `PUT /api/notifications/:id` - Mark as read
   - `DELETE /api/notifications/:id` - Delete notification
   - `PUT /api/notification-preferences` - Update preferences

3. **Frontend Integration:**
   - Use `react-native-toast-message` for transient toasts
   - Create notification center screen
   - Add notification badge to UI
   - Store preferences in AsyncStorage

4. **Notification Types to Support:**
   - Event notifications (event coming up, new attendee, etc.)
   - User notifications (profile updates, achievements)
   - Admin notifications (verification requests, flagged content)
   - System notifications (maintenance, important updates)

5. **Future Enhancements:**
   - Push notifications via Expo Notifications
   - Email notifications via SendGrid/Mailgun
   - Real-time updates via WebSockets
   - Background jobs via Cloudflare Queues

---

## Summary Table

| Aspect | Details |
|--------|---------|
| **Project Type** | Full-stack Monorepo (Frontend + Backend + Mobile) |
| **Frontend Tech** | React Native + Expo, Tailwind CSS, React 19 |
| **Backend Tech** | Hono on Cloudflare Workers, TypeScript |
| **Database** | Cloudflare D1 (SQLite-based) |
| **Package Manager** | npm with workspaces |
| **Build Tool** | Turborepo + Wrangler |
| **Deployment** | Cloudflare Pages/Workers (primary), EC2/Docker (secondary) |
| **Authentication** | JWT (jose) + PBKDF2 (Web Crypto) |
| **Testing** | Vitest |
| **Linting** | Biome |
| **Notification Status** | Library installed (react-native-toast-message), no active system |
| **Real-time Support** | None (WebSocket not implemented) |
| **CI/CD** | GitHub Actions |
| **Git Workflow** | PR-based, requires code review |

---

End of Analysis
