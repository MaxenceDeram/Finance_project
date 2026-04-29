#!/usr/bin/env bash
set -euo pipefail

APP_USER="${APP_USER:-waren}"
APP_DIR="${APP_DIR:-/var/www/waren}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ "$(id -u)" -ne 0 ]; then
  echo "Run with sudo: sudo bash deploy/aws-ec2/01-apply-config.sh"
  exit 1
fi

if [ ! -d "$APP_DIR" ]; then
  mkdir -p "$APP_DIR"
fi

if ! id -u "$APP_USER" >/dev/null 2>&1; then
  useradd --system --create-home --shell /usr/sbin/nologin "$APP_USER"
fi

cp "$SCRIPT_DIR/waren.service" /etc/systemd/system/waren.service
cp "$SCRIPT_DIR/waren-daily-summary.service" /etc/systemd/system/waren-daily-summary.service
cp "$SCRIPT_DIR/waren-daily-summary.timer" /etc/systemd/system/waren-daily-summary.timer

cp "$SCRIPT_DIR/nginx-waren.conf" /etc/nginx/sites-available/waren
ln -sf /etc/nginx/sites-available/waren /etc/nginx/sites-enabled/waren
rm -f /etc/nginx/sites-enabled/default

if [ ! -f "$APP_DIR/.env" ]; then
  cp "$SCRIPT_DIR/env.production" "$APP_DIR/.env"
fi

chown -R "$APP_USER:$APP_USER" "$APP_DIR"
chmod 600 "$APP_DIR/.env"

systemctl daemon-reload
systemctl enable waren
systemctl enable waren-daily-summary.timer
nginx -t
systemctl reload nginx

echo "Config applied."
echo "Edit $APP_DIR/.env before starting the app."
