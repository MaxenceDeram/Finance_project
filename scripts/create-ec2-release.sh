#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ARCHIVE_PATH="$ROOT_DIR/deploy/aws-ec2/waren-ec2-release.tar.gz"
STAGING_DIR="$(mktemp -d "${TMPDIR:-/tmp}/waren-release.XXXXXX")"

cleanup() {
  rm -rf "$STAGING_DIR"
}

trap cleanup EXIT

rm -f "$ARCHIVE_PATH"

rsync -a \
  --exclude='/.git' \
  --exclude='/node_modules' \
  --exclude='/.next' \
  --exclude='/storage' \
  --exclude='/deploy/aws-ec2/waren-ec2-release.tar.gz' \
  "$ROOT_DIR/" "$STAGING_DIR/"

rm -f "$STAGING_DIR/.env" "$STAGING_DIR/.dev-emails.log"
find "$STAGING_DIR" -name '.DS_Store' -delete
find "$STAGING_DIR" -name '*.tsbuildinfo' -delete

cd "$STAGING_DIR"

COPYFILE_DISABLE=1 tar -czf "$ARCHIVE_PATH" .

echo "Created $ARCHIVE_PATH"
