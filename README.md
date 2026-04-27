# Project Janatha

The official app to connect the CHYKs of Chinmaya Mission West.

Om Sri Chinmaya Sadgurave Namaha. Om Sri Gurubyo Namaha.

## Tech Stack

- **Frontend:** Expo (React Native) — web + iOS + Android from one codebase
- **Backend:** Hono on Cloudflare Workers (Pages Functions)
- **Database:** Cloudflare D1 (SQLite at the edge)
- **Auth:** PBKDF2 password hashing + JWT (via `jose`)

## Project Structure

```
├── packages/
│   ├── frontend/      # Expo app (screens, components, auth)
│   └── backend/       # Hono API (routes, DB queries, auth)
├── functions/
│   └── api/[[route]].ts  # CF Pages Functions entry point
├── migrations/        # D1 SQL migrations
├── wrangler.toml      # Cloudflare Pages config
└── package.json       # npm workspaces root
```

## Local Development

### Prerequisites

- Node.js >= 20
- npm >= 10
- A Cloudflare account with `wrangler` CLI configured (for deployment)

### Setup

```bash
git clone https://github.com/Project-Janatha/Project-Janatha.git
cd Project-Janatha
npm run setup    # Installs deps + runs D1 migrations + seeds test data
```

### Running

```bash
npm run dev      # Starts both API (8787) + Frontend (8081)
```

- **API**: http://localhost:8787 — Hono backend on Cloudflare Workers
- **Frontend**: http://localhost:8081 — Expo web with hot reload

### Other dev commands

| Command | Description |
|---|---|
| `npm run dev` | Start API + frontend |
| `npm run dev:backend` | Start only the API server |
| `npm run dev:frontend` | Start only the Expo dev server |
| `npm run d1:migrate:local` | Run D1 migrations |
| `npm run build` | Typecheck + build frontend |

### Running on mobile

```bash
npm run ios       # Requires Xcode
npm run android   # Requires Android Studio
```

## Deployment

The app deploys to **Cloudflare Pages** (frontend) and **Cloudflare Workers** (backend API) with D1.

### First-time setup

1. Create the D1 database:

```bash
npx wrangler d1 create chinmaya-janata-db --config packages/backend/wrangler.toml
```

2. Update `database_id` in `packages/backend/wrangler.toml` with the ID from the output.

3. Run migrations:

```bash
npm run d1:migrate    # Remote database
```

4. Set secrets for the backend:

```bash
cd packages/backend
npx wrangler secret put JWT_SECRET
npx wrangler secret put JWT_REFRESH_SECRET
```

### Deploy

```bash
npm run deploy            # Deploy both frontend + backend
npm run deploy:frontend   # Frontend only
npm run deploy:backend    # Backend only
```

## Running Tests

```bash
# Backend unit tests (vitest + Cloudflare Workers pool)
cd packages/backend && npm test
```

## End-to-end tests

Playwright suite lives in `tests/`. Two run modes:

```bash
npm run e2e:local    # Boots backend + frontend on localhost (resets local D1),
                     # runs the suite, generates a review dashboard.
npm run e2e:prod     # Runs the suite against the deployed prod URL.
npm run e2e:review   # Opens test-results/review.html.
npm run e2e          # Alias for e2e:local.
```

Single spec, debug mode:

```bash
npx playwright test tests/landing.spec.ts --debug
```

After each run you'll find:

- `test-results/review.html` — at-a-glance dashboard: per-test GIF, labeled
  step screenshots, link to full video.
- `playwright-report/index.html` — Playwright's standard HTML report (traces,
  full attachments).

Requirements: `ffmpeg` (`brew install ffmpeg`) for video → GIF conversion.
