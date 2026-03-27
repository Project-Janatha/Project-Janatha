# Chinmaya Janata Backend

Cloudflare Worker backend built with Hono and D1.

## Stack

- Runtime: Cloudflare Workers
- API framework: Hono
- Database: Cloudflare D1 (SQLite)
- Auth: PBKDF2 + JWT (`jose`)

## Key files

- `src/worker.ts` — Worker entrypoint
- `src/app.ts` — API routes and middleware wiring
- `src/db.ts` — D1 data-access layer
- `src/auth.ts` — password hashing and JWT helpers
- `src/types.ts` — row + API mapping types

## Local development

```bash
npm run dev
```

Runs Wrangler dev server on `http://localhost:8787`.

## Tests

```bash
npm test
```

Runs Vitest with Cloudflare Workers test pool.
