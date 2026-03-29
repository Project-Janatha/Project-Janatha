# Deployment Guide

## Architecture

| Service | Platform | Details |
|---|---|---|
| **Frontend (web)** | Cloudflare Pages | `chinmaya-janata` project, Git-connected |
| **Backend API** | Cloudflare Worker | `chinmaya-janata-api` |
| **Database** | Cloudflare D1 | `chinmaya-janata-db` |
| **File Storage** | Cloudflare R2 | `chinmaya-janata-avatars` bucket |
| **Mobile** | Expo | Native iOS/Android (not on Cloudflare) |

**Custom domains:** `chinmayajanata.org`, `www.chinmayajanata.org`

## Frontend Deployment (automatic)

Cloudflare Pages is connected to GitHub and auto-deploys on every push:

```
feature branch  →  push  →  preview deploy (https://<branch>.project-janatha.pages.dev)
merge to main   →          preview deploy (https://main.project-janatha.pages.dev)
merge to prod   →          production deploy (chinmayajanata.org)
```

- **Production branch:** `prod` (not `main`)
- Every branch/PR gets its own preview URL automatically
- Build command: `expo export --platform web`

## Backend Deployment (manual)

The Worker has no auto-deploy. Deploy manually:

```bash
npm run deploy:backend    # runs wrangler deploy
```

## Deploy Everything (manual)

```bash
npm run deploy            # backend first, then frontend
```

## CI Checks

GitHub Actions (`.github/workflows/test.yml`) runs on every push and PR:

1. TypeScript check (backend)
2. Build frontend (Expo web export)

These are **checks only** — they don't deploy anything.

## Database Migrations

Manual via Wrangler:

```bash
npm run d1:migrate          # production
npm run d1:migrate:local    # local dev
```

Migration SQL files live in `migrations/`.

## Secrets

Backend secrets (JWT keys, etc.) are set via `wrangler secret put <NAME>`.
