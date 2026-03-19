#!/bin/bash
set -euo pipefail
REPO_DIR="/root/Meridian-workspace/Meridian"
PROD_DIR="/opt/meridian"
SERVICE="meridian.service"
echo "Building Meridian..."
cd "$REPO_DIR"
npm run build
echo "Syncing to production..."
rsync -a --delete .next/standalone/ "$PROD_DIR/"
rsync -a --delete .next/static/ "$PROD_DIR/.next/static/"
rsync -a --delete .next/static/ "$PROD_DIR/.next/static/"
rsync -a public/ "$PROD_DIR/public/" 2>/dev/null || true
rsync -a data/ "$PROD_DIR/data/" 2>/dev/null || true
echo "Restarting service..."
sudo systemctl restart "$SERVICE"
sleep 2
if systemctl is-active --quiet "$SERVICE"; then
    echo "Meridian deployed and running"
else
    echo "Service failed to start"
    journalctl -u "$SERVICE" --no-pager -n 20
    exit 1
fi
