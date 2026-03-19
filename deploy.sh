#!/bin/bash
set -e
SRC="/root/Meridian-workspace/Meridian"
DEST="/opt/meridian"
echo "Building..."
cd "$SRC" && rm -rf .next && npx next build
echo "Deploying..."
systemctl stop meridian
cp "$DEST/.env" /tmp/meridian-env-backup
cp -r "$DEST/data" /tmp/meridian-data-backup 2>/dev/null || true
rsync -a --delete "$SRC/.next/standalone/" "$DEST/"
mkdir -p "$DEST/.next/static"
rsync -a --delete "$SRC/.next/static/" "$DEST/.next/static/"
rsync -a "$SRC/public/" "$DEST/public/" 2>/dev/null || true
cp /tmp/meridian-env-backup "$DEST/.env"
cp -r /tmp/meridian-data-backup/* "$DEST/data/" 2>/dev/null || true
systemctl start meridian
sleep 2 && systemctl status meridian --no-pager | head -5
echo "Deploy complete"
