#!/bin/bash

set -euo pipefail

APP_DIR="/home/ubuntu/app"

if [ ! -d "$APP_DIR" ]; then
    echo "Directory $APP_DIR does not exist. CodeDeploy 파일 매핑을 확인하세요." >&2
    exit 1
fi

cd "$APP_DIR"

if [ ! -f package.json ] || [ ! -f package-lock.json ]; then
    echo "package.json 혹은 package-lock.json이 없습니다. 빌드 아티팩트를 확인하세요." >&2
    exit 1
fi

echo "Installing dependencies with npm ci..."
pnpm install
echo "Life Cycle - AfterInstall: Dependency installation complete."
