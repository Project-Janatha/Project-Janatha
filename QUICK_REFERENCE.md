# Project-Janatha: Quick Reference Card

## Project Identity
- **Type:** Full-Stack Monorepo
- **Platforms:** Mobile (React Native via Expo), Web (React), API (Cloudflare Workers)
- **Main Purpose:** Connect CHYKs of Chinmaya Mission West

## Key Technologies

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | React | 19.2.4 |
| **Mobile** | React Native | 0.81.5 |
| **Framework** | Expo | 54.0.21 |
| **Styling** | Tailwind CSS (Nativewind) | 4.2.2 |
| **Backend** | Hono | 4.7.0 |
| **Database** | Cloudflare D1 (SQLite) | - |
| **Auth** | JWT (jose) + PBKDF2 | 6.0.0 |
| **Testing** | Vitest | 4.1.0 |
| **Linting** | Biome | - |
| **Build** | Turborepo | - |

## Directory Quick Links

```
/packages/frontend/          # Expo + React + React Native app
  /app/                      # Expo Router (file-based routing)
  /components/               # UI components
  /hooks/                    # Custom hooks
  /utils/                    # Helper functions

/packages/backend/           # Hono API on Cloudflare Workers
  /src/
    app.ts                   # Main routes (867 lines)
    auth.ts                  # JWT + password hashing
    db.ts                    # D1 database functions
    types.ts                 # TypeScript types
    middleware.ts            # Rate limiting, validation
    constants.ts             # App constants

/migrations/                 # Database schema versions
/infrastructure/             # Deployment scripts
/.github/workflows/          # CI/CD pipelines
```

## Running the Project

```bash
# Install dependencies
npm install

# Development
npm run dev                  # Run frontend + backend concurrently
npm run dev:frontend        # Frontend only
npm run typecheck           # TypeScript type checking

# Building
npm run build               # Build for production
npm run build:frontend      # Frontend only

# Deployment
npm run deploy              # Deploy to Cloudflare Pages
npm run deploy:preview      # Deploy preview branch

# Docker
docker-compose up           # Run locally in Docker
```

## Core Database Tables

| Table | Purpose |
|-------|---------|
| `users` | User accounts + profiles |
| `centers` | Chinmaya Mission centers |
| `events` | Events (Satsangs, Baksheish, etc.) |
| `event_attendees` | Who's attending events (junction table) |
| `event_endorsers` | Who's endorsed events (junction table) |

## API Base Path
All endpoints: `/api` (e.g., `GET /api/centers`, `POST /api/auth/register`)

## Key API Endpoints

### Auth
- `POST /api/auth/register` - Create account
- `POST /api/auth/authenticate` - Login (returns JWT)
- `GET /api/auth/verify` - Verify token (requires auth)

### Events
- `POST /api/addevent` - Create event
- `POST /api/attendEvent` - RSVP for event
- `POST /api/fetchEventsByCenter` - Get events by center

### Centers
- `GET /api/centers` - List all centers
- `POST /api/addCenter` - Create center

### Users
- `PUT /api/auth/update-profile` - Update profile (requires auth)
- `POST /api/getUserEvents` - Get user's events (requires auth)

## Project Structure Overview

```
Monorepo Root
├── packages/frontend/       (Single-page app + mobile app)
│   ├── Components
│   ├── Screens (via Expo Router)
│   └── Built as: Web (static) + Mobile (Expo Go/EAS)
│
├── packages/backend/        (Serverless API)
│   └── Built as: Cloudflare Workers + Pages Functions
│
├── migrations/              (D1 schema versions)
├── infrastructure/          (EC2 deployment scripts - legacy)
└── .github/workflows/       (CI/CD)
```

## File Categories

| Category | Location | Purpose |
|----------|----------|---------|
| **Config** | `*.json`, `*.yml`, `*.toml` | Build, deploy, TypeScript configs |
| **Source** | `/packages/*/src/` | TypeScript/TSX source code |
| **Components** | `/packages/frontend/components/` | React/React Native components |
| **Routes** | `/packages/frontend/app/` | Expo Router app directory |
| **API Endpoints** | `/packages/backend/src/app.ts` | HTTP route definitions |
| **DB Queries** | `/packages/backend/src/db.ts` | D1 database functions |
| **Migrations** | `/migrations/` | Schema versions (.sql files) |
| **Deploy** | `/infrastructure/scripts/` | EC2 deployment scripts |
| **CI/CD** | `/.github/workflows/` | GitHub Actions pipelines |

## Authentication System

- **Password Hashing:** PBKDF2-SHA256 (100,000 iterations)
- **Token Type:** JWT with HS256
- **Token Lifetime:** Access: 30 days, Refresh: 90 days
- **Key Generation:** Web Crypto API (browser/worker native)
- **Verification:** jose library

## Notification System Status

**Current State:**
- ✓ `react-native-toast-message` installed (but unused)
- ✗ No persistent notification storage
- ✗ No notification center
- ✗ No push/email notifications
- ✗ No WebSocket real-time

**To Implement:** See `NOTIFICATION_SYSTEM_PLANNING.md`

## Deployment Targets

### Primary (Recommended)
- **Frontend:** Cloudflare Pages (static)
- **Backend:** Cloudflare Workers
- **Database:** Cloudflare D1

### Secondary (Legacy)
- **Frontend:** Nginx (via Docker)
- **Backend:** Node.js (via Docker)
- **Database:** DynamoDB or SQLite (via Docker)

## Environment & Configuration

| Config File | Purpose |
|-------------|---------|
| `wrangler.toml` | Cloudflare Workers/Pages config |
| `turbo.json` | Turborepo task orchestration |
| `tsconfig.base.json` | Base TypeScript settings |
| `biome.json` | Linter/formatter rules |
| `package.json` | Workspace root + npm scripts |
| `.github/workflows/` | CI/CD automation |

## Development Commands Cheat Sheet

```bash
# Install & Setup
npm install                          # Install all dependencies
npm run typecheck                    # Check TypeScript errors

# Development
npm run dev                          # Frontend + Backend (concurrent)
npm run dev:frontend                 # Frontend only
npm run build:frontend               # Build frontend

# Testing
npm test                             # Run tests (Vitest)
npm run test:watch                   # Watch mode

# Code Quality
npx biome check                      # Lint/format check
npx biome check --write              # Auto-fix issues

# Deployment
npm run deploy                       # Deploy to Cloudflare Pages (production)
npm run deploy:preview               # Deploy to preview branch

# Database
npm run d1:migrate:local             # Run migrations locally
npm run d1:create:preview            # Create preview D1 database
```

## Key Architectural Patterns

1. **Platform-Specific Files:** `.native.tsx`, `.web.tsx`, `.ios.tsx`
2. **File-Based Routing:** Expo Router in `/app` directory
3. **Context for State:** React Context for global state (UserProvider, ThemeProvider)
4. **Direct API Calls:** No Redux/RTK, components call API directly
5. **Type Safety:** Full TypeScript with strict mode
6. **Middleware Pattern:** Hono middleware for CORS, rate limiting, security
7. **Database Queries:** Typed query builders (stateless pattern)

## Development Guidelines

- PRs must be **approved by different developer**
- Commit messages should be **clear and explain changes**
- Changes should be **non-breaking**
- Use **feature branches** for new work
- Merge strategy: `git config pull.rebase false` (for same branch)

## Important Notes

- Backend is **stateless** (runs on Cloudflare Workers)
- Database uses **D1 (SQLite)**, migrated from DynamoDB
- **No WebSocket** infrastructure currently (can be added)
- **Rate limiting** per IP+path (in-memory per isolate)
- **Security headers** automatically added to all responses
- **CORS** enabled for frontend origins

## Performance Considerations

- In-memory rate limiting (not globally distributed)
- D1 queries use prepared statements (SQL injection prevention)
- Passwords use timing-safe comparison
- Middleware includes cache-control headers

## Next Steps for Implementation

1. **Review CODEBASE_ANALYSIS.md** for detailed info
2. **Check NOTIFICATION_SYSTEM_PLANNING.md** for notification feature
3. **Start with Phase 1** (database + backend API)
4. **Follow with Phase 2** (frontend integration)
5. **Test thoroughly** before deployment

---

**Full documentation:** See `CODEBASE_ANALYSIS.md` and `NOTIFICATION_SYSTEM_PLANNING.md`
