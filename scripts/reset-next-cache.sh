#!/usr/bin/env bash
set -euo pipefail

if [ -d ".next" ]; then
  stale_dir=".next-stale-$(date +%Y%m%d%H%M%S)-$$"
  mv ".next" "$stale_dir"
  echo "Moved existing Next.js cache to $stale_dir"
fi
