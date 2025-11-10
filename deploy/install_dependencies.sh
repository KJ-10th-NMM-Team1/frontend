#!/bin/bash
set -euo pipefail

APP_DIR=/home/ubuntu/app
cd "$APP_DIR"

# --- (수정) start_server.sh와 경로 일치 ---
# 1. pnpm을 설치할 로컬 경로 정의
PNPM_BIN_DIR="$HOME/.local/bin"
mkdir -p "$PNPM_BIN_DIR"

# 2. PATH에 이 경로 추가
export PATH="$PNPM_BIN_DIR:$PATH"

# 3. corepack이 pnpm을 글로벌(/usr/bin)이 아닌
#    지정된 로컬 디렉토리에 설치하도록 함
if ! command -v pnpm >/dev/null 2>&1; then
  # --- (수정) --install-directory 플래그 추가 ---
  corepack enable --install-directory "$PNPM_BIN_DIR" pnpm
  corepack prepare pnpm@8 --activate
fi

echo "Installing dependencies with pnpm install..."
pnpm install --frozen-lockfile
echo "Life Cycle - AfterInstall: Dependency installation complete."
pnpm build