#!/usr/bin/env bash
# Drops and recreates local D1, applies all migrations in order, seeds centers.
# Used by e2e:local before each run so tests are deterministic.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

echo "==> Wiping local D1 state (.wrangler/state/v3/d1)"
rm -rf .wrangler/state/v3/d1 packages/backend/.wrangler/state/v3/d1 2>/dev/null || true

echo "==> Applying migrations in order (skipping 0002_seed_data.sql — superseded by seed_centers.sql, and depends on 0003)"
for f in $(ls migrations/0*.sql | sort); do
  case "$(basename "$f")" in
    0002_seed_data.sql) continue ;;
  esac
  echo "  - $f"
  npx wrangler d1 execute chinmaya-janata-db --local --file="$f" \
    --config packages/backend/wrangler.toml > /dev/null
done

echo "==> Seeding centers"
npx wrangler d1 execute chinmaya-janata-db --local --file=migrations/seed_centers.sql \
  --config packages/backend/wrangler.toml > /dev/null

echo "==> Local D1 reset complete"
