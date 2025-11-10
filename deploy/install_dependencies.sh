#!/bin/bash
set -euo pipefail

APP_DIR=/home/ubuntu/app
cd "$APP_DIR"


export PNPM_HOME="$HOME/.local/share/pnpm"
export PATH="$PNPM_HOME:$PATH"

if ! command -v pnpm >/dev/null 2>&1; then
  corepack enable pnpm
  corepack prepare pnpm@8 --activate
fi


echo "Installing dependencies with npm ci..."
pnpm install --frozen-lockfile
echo "Life Cycle - AfterInstall: Dependency installation complete."
pnpm build