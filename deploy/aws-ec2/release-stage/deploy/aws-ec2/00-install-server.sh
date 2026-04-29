#!/usr/bin/env bash
set -euo pipefail

APP_USER="${APP_USER:-waren}"
APP_DIR="${APP_DIR:-/var/www/waren}"
NODE_MAJOR="${NODE_MAJOR:-22}"

if [ "$(id -u)" -ne 0 ]; then
  echo "Run with sudo: sudo bash deploy/aws-ec2/00-install-server.sh"
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive

apt-get update
apt-get install -y ca-certificates curl gnupg git nginx rsync

if ! command -v node >/dev/null 2>&1 || [ "$(node -p 'process.versions.node.split(\".\")[0]')" -lt "$NODE_MAJOR" ]; then
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
  apt-get install -y nodejs
fi

if ! id -u "$APP_USER" >/dev/null 2>&1; then
  useradd --system --create-home --shell /usr/sbin/nologin "$APP_USER"
fi

mkdir -p "$APP_DIR"
chown -R "$APP_USER:$APP_USER" "$APP_DIR"

systemctl enable nginx
systemctl restart nginx

echo "Server ready. Node: $(node -v), npm: $(npm -v), app dir: $APP_DIR"
