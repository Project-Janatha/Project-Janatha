# Project-Janatha Codebase Analysis - Documentation Index

> Complete analysis of the Project-Janatha codebase generated on April 7, 2026
> This index will help you navigate the comprehensive documentation provided.

## Quick Navigation

### I Need...
- **A quick overview?** → Start with [`QUICK_REFERENCE.md`](#quick-reference)
- **Complete details?** → Read [`CODEBASE_ANALYSIS.md`](#codebase-analysis)
- **To implement notifications?** → See [`NOTIFICATION_SYSTEM_PLANNING.md`](#notification-system-planning)
- **Just one example?** → Check the [Summary Table](#summary-table) below

---

## Documentation Files

### QUICK_REFERENCE.md
**Use when:** You need quick lookup information or a cheat sheet
**Length:** ~250 lines
**Contents:**
- Project identity & key technologies table
- Directory structure with quick links
- Running the project commands
- Core database tables reference
- Key API endpoints (auth, events, centers, users)
- File categories and locations
- Development commands cheat sheet
- Notification system status
- Deployment targets overview
- Development guidelines

**Best for:** Quick lookups, development while coding, sharing with new team members

---

### CODEBASE_ANALYSIS.md
**Use when:** You need comprehensive project understanding
**Length:** ~540 lines
**Contents:**
1. **Project Overview** - Full-stack monorepo structure
2. **Technology Stack** - Frontend, backend, database, auth, UI, deployment
3. **Directory Structure** - Complete directory tree with descriptions
4. **Database Schema** - Full SQL schema for all 5 tables
5. **Notification System** - Current status and what's missing
6. **API Endpoints** - Complete list of all routes
7. **Middleware & Utilities** - Rate limiting, validation, auth flow
8. **Configuration Files** - All config file locations and purposes
9. **Environment & Infrastructure** - Local dev, deployment options
10. **Architectural Patterns** - Frontend, backend, cross-platform patterns
11. **Dependencies Summary** - All npm packages organized by use
12. **Recommendations** - For implementing notification system

**Best for:** Understanding project architecture, technical deep dives, onboarding

---

### NOTIFICATION_SYSTEM_PLANNING.md
**Use when:** Planning or implementing the notification feature
**Length:** ~320 lines
**Contents:**
1. **Current State Assessment** - What exists vs. what's missing
2. **4-Phase Implementation Roadmap:**
   - Phase 1: Foundation (database + backend)
   - Phase 2: Frontend Integration
   - Phase 3: Feature Implementation
   - Phase 4: Enhancements (future)
3. **Implementation Details:**
   - Complete SQL schema for notifications tables
   - Backend API endpoint specifications
   - Frontend component structure
   - Toast usage patterns
4. **Notification Types & Triggers** - Table of planned notifications
5. **Architectural Decisions** - Key design choices explained
6. **Testing Strategy** - Backend and frontend tests
7. **Performance Considerations** - Database indexing, pagination, caching
8. **File References** - Exact files to modify for each phase
9. **Effort Estimates** - Hours for each phase
10. **Next Steps** - Action items for implementation

**Best for:** Notification feature development, sprint planning, technical design

---

## Summary Table

| Aspect | Details |
|--------|---------|
| **Project Type** | Full-stack Monorepo |
| **Frontend** | React 19.2.4 + React Native 0.81.5 (Expo 54) |
| **Mobile** | Expo with file-based routing (Expo Router) |
| **Backend** | Hono 4.7.0 on Cloudflare Workers |
| **Database** | Cloudflare D1 (SQLite) - 5 tables |
| **Authentication** | JWT (jose) + PBKDF2-SHA256 (100k iterations) |
| **Styling** | Tailwind CSS via Nativewind |
| **Testing** | Vitest 4.1.0 |
| **Linting** | Biome (replaces ESLint) |
| **Build Tool** | Turborepo |
| **Deployment** | Cloudflare Pages (frontend) + Cloudflare Workers (backend) |
| **CI/CD** | GitHub Actions |
| **Package Manager** | npm workspaces |

---

## Key Project Structure

```
/packages/
├── frontend/              # Expo app (mobile + web)
│   ├── app/              # Expo Router file-based routing
│   ├── components/       # Reusable UI components
│   ├── hooks/            # Custom React hooks
│   └── utils/            # Helper functions
│
└── backend/              # Hono API
    └── src/
        ├── app.ts        # Main routes (867 lines)
        ├── auth.ts       # Auth utilities
        ├── db.ts         # Database queries
        ├── types.ts      # TypeScript types
        ├── middleware.ts # Rate limiting, validation
        └── constants.ts  # Constants

/migrations/              # Database schema versions
/infrastructure/          # Deployment scripts
/.github/workflows/       # CI/CD pipelines
```

---

## Development Commands

```bash
npm install              # Install all dependencies
npm run dev             # Frontend + backend (concurrent)
npm run dev:frontend    # Frontend only
npm run build           # Build for production
npm run typecheck       # TypeScript check
npm run deploy          # Deploy to Cloudflare Pages
npm test                # Run tests
```

---

## Database Overview

**5 Tables:**
1. **users** - User accounts, profiles, verification status
2. **centers** - Chinmaya Mission centers
3. **events** - Events (Satsangs, Bhiksha, etc.)
4. **event_attendees** - Who's attending which events (junction table)
5. **event_endorsers** - Who's endorsed which events (junction table)

**Authentication:**
- Password: PBKDF2-SHA256 with 100,000 iterations
- Tokens: JWT with HS256, 30-day access + 90-day refresh

---

## Notification System Status

**Current:** Minimal
- ✓ Toast library installed (react-native-toast-message)
- ✗ Not actively used
- ✗ No persistent storage
- ✗ No notification center
- ✗ No preferences system

**To Implement:** See `NOTIFICATION_SYSTEM_PLANNING.md`
- Estimated effort: 14-19 hours (MVP)
- 4-phase approach provided
- Complete implementation guide included

---

## API Endpoints (Quick Reference)

**Base Path:** `/api`

### Auth
- `POST /api/auth/register` - Create account
- `POST /api/auth/authenticate` - Login
- `GET /api/auth/verify` - Verify token
- `PUT /api/auth/update-profile` - Update profile

### Events
- `POST /api/addevent` - Create event
- `POST /api/attendEvent` - RSVP
- `POST /api/fetchEventsByCenter` - Get events by center

### Centers
- `GET /api/centers` - List centers
- `POST /api/addCenter` - Create center

### Users
- `POST /api/getUserEvents` - Get user's events

See `API_ENDPOINTS.md` in project root for complete list.

---

## Key Architectural Decisions

**Frontend:**
- Platform-specific files (`.native.tsx`, `.web.tsx`, `.ios.tsx`, `.android.tsx`)
- File-based routing via Expo Router
- React Context for state management
- Direct API calls (no Redux/RTK)
- Full TypeScript strict mode

**Backend:**
- Stateless middleware pattern
- Typed database query builders
- PBKDF2-SHA256 password hashing
- JWT tokens with expiration
- Prepared statements (SQL injection prevention)
- In-memory rate limiting per IP+path

**Database:**
- Relational schema (migrated from DynamoDB)
- D1 (SQLite) for scalability
- Proper foreign keys and cascading
- Indexes for performance

---

## For Notification System Implementation

### Recommended Phases:
1. **Phase 1 (4-6 hrs):** Create database tables + backend API
2. **Phase 2 (4-5 hrs):** Frontend integration + context provider
3. **Phase 3 (6-8 hrs):** Notification triggers + features
4. **Phase 4 (8-12 hrs, Future):** Push/email notifications + WebSocket

### Key Files to Modify:
- Database: Create `migrations/0002_notifications.sql`
- Backend: `/packages/backend/src/app.ts`, `db.ts`, `types.ts`
- Frontend: Create notification context, components, screen

See detailed implementation guide in `NOTIFICATION_SYSTEM_PLANNING.md`

---

## Getting Started with This Documentation

### For Project Managers
1. Read the summary in this file
2. Check "Development Commands" section
3. Review "Effort Estimates" in `NOTIFICATION_SYSTEM_PLANNING.md`

### For Developers
1. Start with `QUICK_REFERENCE.md` for quick lookups
2. Deep dive into `CODEBASE_ANALYSIS.md` for architecture
3. Use `NOTIFICATION_SYSTEM_PLANNING.md` for feature development

### For New Team Members
1. Read this index file first
2. Review `QUICK_REFERENCE.md` for overview
3. Study `CODEBASE_ANALYSIS.md` sections 1-3 for structure
4. Explore the actual code in `/packages/` following the patterns

### For Notification Feature Work
1. Start with `NOTIFICATION_SYSTEM_PLANNING.md` - Current State Section
2. Review Phase 1 Database Schema
3. Create migration file
4. Follow Phase 1-4 roadmap
5. Reference CODEBASE_ANALYSIS.md for architectural patterns

---

## Documentation Statistics

| Document | Lines | Topics | Best For |
|----------|-------|--------|----------|
| QUICK_REFERENCE.md | ~250 | 20+ | Quick lookups, cheat sheet |
| CODEBASE_ANALYSIS.md | ~540 | 12 major | Deep technical understanding |
| NOTIFICATION_SYSTEM_PLANNING.md | ~320 | 4 phases | Notification feature work |
| ANALYSIS_README.md (this file) | ~300 | Index | Navigation & getting started |
| **TOTAL** | ~1,410 | Comprehensive | Full project knowledge base |

---

## Quick Answers to Common Questions

**Q: What tech stack does this project use?**
A: React 19 + React Native (Expo) frontend, Hono backend on Cloudflare Workers, D1 database, TypeScript throughout. See `QUICK_REFERENCE.md` > Technology Stack.

**Q: How do I run the project locally?**
A: `npm install && npm run dev` to run frontend + backend. See section "Development Commands" in this file.

**Q: Where is the API code?**
A: `/packages/backend/src/app.ts` (867 lines) contains all routes. Database functions are in `db.ts`. See `CODEBASE_ANALYSIS.md` > Section 3.

**Q: What's the database schema?**
A: 5 tables (users, centers, events, event_attendees, event_endorsers). Full schema in `CODEBASE_ANALYSIS.md` > Section 4.

**Q: How do I implement the notification system?**
A: Follow the 4-phase roadmap in `NOTIFICATION_SYSTEM_PLANNING.md`. Estimated 14-19 hours for MVP.

**Q: What authentication does the project use?**
A: JWT tokens (30-day access) + PBKDF2-SHA256 password hashing (100k iterations). See `CODEBASE_ANALYSIS.md` > Section 2 > Authentication.

**Q: How is this deployed?**
A: Frontend to Cloudflare Pages, backend to Cloudflare Workers, database is D1 (SQLite). Alternative EC2 + Docker option available. See `CODEBASE_ANALYSIS.md` > Section 9.

---

## Feedback & Updates

This analysis was generated based on the codebase as of April 7, 2026. As the project evolves:

- Keep the directory structure sections in `CODEBASE_ANALYSIS.md` updated when new packages/directories are added
- Update API endpoints in `QUICK_REFERENCE.md` when new routes are added
- Track notification system implementation progress against `NOTIFICATION_SYSTEM_PLANNING.md`

---

## Document Links

- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Quick lookup guide
- [CODEBASE_ANALYSIS.md](./CODEBASE_ANALYSIS.md) - Complete analysis
- [NOTIFICATION_SYSTEM_PLANNING.md](./NOTIFICATION_SYSTEM_PLANNING.md) - Implementation roadmap
- [API_ENDPOINTS.md](./API_ENDPOINTS.md) - Full API reference
- [README.md](./README.md) - Project overview

---

**Analysis Status:** Complete ✓
**Last Updated:** 2026-04-07
**Coverage:** Frontend (56 deps), Backend (3 deps), Database (5 tables), API (20+ endpoints), Infrastructure (2 deployment options)
