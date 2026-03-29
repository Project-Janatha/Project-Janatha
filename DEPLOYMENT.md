# Deployment

## How it works

One branch: **`main`**. All PRs merge here.

```
1. Create a feature branch
2. Open a PR against main
3. CI runs automatically (typecheck, tests, build)
4. Merge the PR → staging deploys automatically
5. Test at main.project-janatha.pages.dev
6. When ready, promote to production (see below)
```

## Staging (automatic)

Every merge to `main` auto-deploys:
- **Frontend** → `main.project-janatha.pages.dev`
- **Backend** → `chinmaya-janata-api-staging` worker

## Production (manual)

When staging looks good, promote to prod:

```bash
gh workflow run deploy.yml -f environment=production
```

Or: **GitHub → Actions → Deploy → Run workflow → production**

This deploys both frontend and backend to:
- **Frontend** → `chinmayajanata.org`
- **Backend** → `chinmaya-janata-api` worker

## Database migrations

If your change includes a schema change, run the migration manually:

```bash
npm run d1:migrate          # production
npm run d1:migrate:local    # local dev
```

Migration files live in `migrations/`.

## Reference

| | Staging | Production |
|---|---|---|
| Frontend | `main.project-janatha.pages.dev` | `chinmayajanata.org` |
| Backend | `chinmaya-janata-api-staging` | `chinmaya-janata-api` |
| Database | `chinmaya-janata-db` (shared) | `chinmaya-janata-db` (shared) |
| Storage | `chinmaya-janata-avatars` (shared) | `chinmaya-janata-avatars` (shared) |
