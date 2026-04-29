#!/usr/bin/env bash
set -euo pipefail

APP_URL="${APP_URL:-http://51.20.71.245}"

echo "Checking local Next.js..."
curl -I --max-time 10 http://127.0.0.1:3000

echo "Checking public Nginx..."
curl -I --max-time 10 "$APP_URL"

echo "Recent Waren logs:"
journalctl -u waren -n 80 --no-pager
