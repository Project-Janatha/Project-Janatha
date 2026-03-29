# Deployment Guide

## Architecture

| Service | Platform | Staging | Production |
|---|---|---|---|
| **Frontend** | Cloudflare Pages | `main.project-janatha.pages.dev` | `chinmayajanata.org` |
| **Backend API** | Cloudflare Workers | `chinmaya-janata-api-staging` | `chinmaya-janata-api` |
| **Database** | Cloudflare D1 | `chinmaya-janata-db` (shared) | `chinmaya-janata-db` (shared) |
| **File Storage** | Cloudflare R2 | `chinmaya-janata-avatars` (shared) | `chinmaya-janata-avatars` (shared) |

## Workflow

There is one branch: **`main`**. All PRs merge here.

```
feature branch → PR → merge to main → auto-deploys to staging
                                        ↓
                         test on main.project-janatha.pages.dev
                                        ↓ (manual)
                                    deploy to production
```

### Staging (automatic)

Every push to `main`:
- **Frontend**: Cloudflare Pages auto-deploys to `main.project-janatha.pages.dev`
- **Backend**: GitHub Actions auto-deploys `chinmaya-janata-api-staging` worker

### Production (manual)

To promote to production (deploys both frontend and backend):

```bash
# Option 1: GitHub Actions UI
# Go to Actions → Deploy → Run workflow → select "production"

# Option 2: CLI
gh workflow run deploy.yml -f environment=production
```

## CI Checks

GitHub Actions runs on every push and PR:
1. TypeScript check (backend)
2. Backend tests (vitest)
3. Frontend tests (vitest)
4. Build frontend (Expo web export)

## Database Migrations

Manual via Wrangler:

```bash
npm run d1:migrate          # production
npm run d1:migrate:local    # local dev
```

Migration SQL files live in `migrations/`.

## Secrets

Backend secrets are set via `wrangler secret put <NAME>` for each worker:
- `chinmaya-janata-api` (production)
- `chinmaya-janata-api-staging` (staging)

GitHub Actions requires the `CLOUDFLARE_API_TOKEN` repository secret.

## Cloudflare Setup

### Pages (frontend)
- **Production branch**: `__release` (never pushed to directly — production is promoted via GitHub Actions)
- **`main` branch**: auto-deploys as preview → `main.project-janatha.pages.dev`
- Custom domains: `chinmayajanata.org`, `www.chinmayajanata.org`

### Workers (backend)
- Production: `chinmaya-janata-api` (config: `packages/backend/wrangler.toml`)
- Staging: `chinmaya-janata-api-staging` (config: `packages/backend/wrangler.staging.toml`)
