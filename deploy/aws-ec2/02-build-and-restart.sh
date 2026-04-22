#!/usr/bin/env bash
set -euo pipefail

APP_USER="${APP_USER:-waren}"
APP_DIR="${APP_DIR:-/var/www/waren}"

if [ "$(id -u)" -ne 0 ]; then
  echo "Run with sudo: sudo bash deploy/aws-ec2/02-build-and-restart.sh"
  exit 1
fi

if [ ! -f "$APP_DIR/.env.production" ]; then
  echo "Missing $APP_DIR/.env.production"
  exit 1
fi

cd "$APP_DIR"

sudo -H -u "$APP_USER" npm ci
sudo -H -u "$APP_USER" npm run prisma:deploy
sudo -H -u "$APP_USER" npm run build

systemctl restart waren
systemctl restart waren-daily-summary.timer

systemctl --no-pager --full status waren || true
echo "Waren deployed on http://51.20.71.245"
