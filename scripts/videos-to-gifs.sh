#!/usr/bin/env bash
# Converts every .webm under test-results/ into a sibling .gif (10fps, max 800px wide).
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg not found — install with 'brew install ffmpeg'"
  exit 1
fi

count=0
while IFS= read -r webm; do
  gif="${webm%.webm}.gif"
  if [ -f "$gif" ] && [ "$gif" -nt "$webm" ]; then
    continue
  fi
  echo "==> $webm -> $gif"
  ffmpeg -y -loglevel error \
    -i "$webm" \
    -vf "fps=10,scale='min(800,iw)':-2:flags=lanczos" \
    "$gif"
  count=$((count + 1))
done < <(find test-results -type f -name "*.webm" 2>/dev/null)

echo "==> Converted $count video(s) to GIF"
