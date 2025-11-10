#!/bin/bash
set -euo pipefail

APP_DIR="/home/ubuntu/app"

if [ ! -d "$APP_DIR" ]; then
    echo "Directory $APP_DIR does not exist. CodeDeploy 파일 매핑을 확인하세요." >&2
    exit 1
fi
cd "$APP_DIR"

if ! command -v pnpm >/dev/null 2>&1; then
  corepack enable pnpm
  corepack prepare pnpm@8 --activate
fi

echo "Installing dependencies with npm ci..."
pnpm install --frozen-lockfile
echo "Life Cycle - AfterInstall: Dependency installation complete."
