#!/bin/bash

# $BASH_SOURCE[0]는 이 스크립트 파일의 전체 경로를 의미합니다.
# 1. 스크립트 파일이 있는 디렉토리 (예: /opt/.../deploy)
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
# 2. 그 상위 디렉토리 (압축이 풀린 루트, /opt/.../deployment-archive)
ARCHIVE_ROOT=$( dirname "$SCRIPT_DIR" )
# ---

# 3. 최종 배포 디렉토리로 이동
APP_DIR="/home/ubuntu/app"

if [ -d "$APP_DIR" ]; then
    echo "Removing existing directory: $APP_DIR"
    rm -rf "$APP_DIR"
fi

echo "Created directory: $APP_DIR"
mkdir -p $APP_DIR
cd $APP_DIR

npm install vite

# 3. 임시 폴더에서 package.json 파일들을 '현재 위치'(APP_DIR)로 복사
echo "Copying package.json files from $ARCHIVE_ROOT..."
cp "$ARCHIVE_ROOT/package.json" .
cp "$ARCHIVE_ROOT/package-lock.json" .


# 4. (핵심) 임시 폴더(ARCHIVE_ROOT)에서 package.json 파일들을 복사해옴
echo "Copying package.json files from $ARCHIVE_ROOT..."

# 5. 프로덕션(운영)용 의존성만 설치 (devDependencies 제외)
#    (GitHub Actions에서 이미 'npm ci'와 'npm run build'를 실행했음)
echo "Installing production dependencies (npm install --production)..."
# npm install --production
npm ci
echo "Life Cycle - BeforeInstall: Dependency installation complete."