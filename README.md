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
- A Cloudflare account (for deployment only — local dev works without one)

### Setup

1. Clone the repo and install dependencies:

```bash
git clone https://github.com/Project-Janatha/Project-Janatha.git
cd Project-Janatha
npm install
```

2. Build the frontend (needed once before first run, since the backend serves static files from `dist/`):

```bash
npm run build:frontend
```

3. Run the D1 database migrations locally:

```bash
npm run d1:migrate:local
```

4. Start the dev servers:

```bash
npm run dev
```

This starts both servers concurrently:
- **API** (Wrangler): http://localhost:8787 — serves the Hono backend + static frontend
- **Web** (Metro/Expo): http://localhost:8081 — Expo dev server with hot reload

Open http://localhost:8081 in your browser for the web app with hot reload.

### Other dev commands

| Command | Description |
|---|---|
| `npm run dev` | Start API + frontend dev servers |
| `npm run dev:backend` | Start only the API server |
| `npm run dev:frontend` | Start only the Expo dev server |
| `npm run pages:dev` | Build frontend + start API (no hot reload) |
| `npm run build` | Full production build (typecheck + frontend + copy) |

### Running on mobile

```bash
npm run ios       # Requires Xcode
npm run android   # Requires Android Studio
```

## Deployment

The app deploys to **Cloudflare Pages** with D1.

### First-time setup

1. Create the D1 database:

```bash
npm run d1:create
```

2. Set the `database_id` in `wrangler.toml` (from the output above).

3. Run migrations on the remote database:

```bash
npm run d1:migrate
```

4. Set secrets:

```bash
npx wrangler pages secret put JWT_SECRET
npx wrangler pages secret put JWT_REFRESH_SECRET
```

### Deploy

```bash
npm run deploy            # Production
npm run deploy:preview    # Preview branch
```

This builds the frontend, copies it to `dist/`, and deploys via `wrangler pages deploy`. The `functions/api/[[route]].ts` entry point is automatically picked up by Cloudflare Pages.

## Running Tests

```bash
# Backend unit tests (vitest + Cloudflare Workers pool)
npm test --workspace=@janatha/backend

# Frontend unit tests
npm test --workspace=@janatha/frontend

# E2E tests (Playwright — requires the dev server running)
npx playwright test
```
