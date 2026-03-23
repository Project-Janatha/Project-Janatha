# Deployment Guide — Cloudflare Pages

Om Sri Chinmaya Sadgurave Namaha. Om Sri Gurubyo Namaha.

The app runs on **Cloudflare Pages** with **D1** (SQLite at the edge). The frontend is a static Expo web export and the backend is a Hono API served via Pages Functions.

## Architecture

```
Browser → Cloudflare Pages CDN
            ├── /           → static frontend (Expo web export in dist/)
            └── /api/*      → Pages Functions (Hono on Workers)
                                └── D1 database (SQLite)
```

## Prerequisites

- A [Cloudflare account](https://dash.cloudflare.com/sign-up)
- Node.js >= 20, npm >= 10
- Wrangler CLI (installed as a dev dependency)

## First-Time Setup

### 1. Create the D1 database

```bash
npm run d1:create
```

Copy the `database_id` from the output and update `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "chinmaya-janata-db"
database_id = "<your-database-id>"
```

### 2. Run migrations on the remote database

```bash
npm run d1:migrate
```

### 3. Set secrets

These are stored securely by Cloudflare and injected as environment variables at runtime:

```bash
npx wrangler pages secret put JWT_SECRET
npx wrangler pages secret put JWT_REFRESH_SECRET
```

## Deploying

### Production

```bash
npm run deploy
```

This runs: typecheck → build frontend → copy to `dist/` → `wrangler pages deploy dist`.

Cloudflare automatically picks up `functions/api/[[route]].ts` as the API entry point.

### Preview (branch deploy)

```bash
npm run deploy:preview
```

Creates a preview deployment at a unique URL — useful for testing PRs before merging.

## Environment & Bindings

| Binding | Type | Description |
|---|---|---|
| `DB` | D1 Database | SQLite database for users, centers, events |
| `JWT_SECRET` | Secret | Signing key for access tokens |
| `JWT_REFRESH_SECRET` | Secret | Signing key for refresh tokens |

These are configured in `wrangler.toml` (for D1) and via `wrangler pages secret put` (for secrets).

## Monitoring

- **Cloudflare Dashboard** → Workers & Pages → chinmaya-janata → logs and analytics
- **D1 Console** → Workers & Pages → D1 → chinmaya-janata-db → query browser
