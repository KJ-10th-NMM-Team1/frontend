#!/bin/bash

# 이 스크립트는 appspec.yml의 'BeforeInstall' 훅(hook)에서 실행됩니다.
#
# 이 스크립트의 목적은 EC2 서버에 'Install' 훅이 새 파일들을
# 복사하기 전에, 미리 'npm install'을 실행하여
# 배포 중단 시간을 최소화하는 것입니다.

# --- (필수) 스크립트 자신의 위치를 기준으로 '루트 폴더' 찾기 ---
# $BASH_SOURCE[0]는 이 스크립트 파일의 전체 경로를 의미합니다.
# 1. 스크립트 파일이 있는 디렉토리 (예: /opt/.../deploy)
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
# 2. 그 상위 디렉토리 (압축이 풀린 루트, /opt/.../deployment-archive)
ARCHIVE_ROOT=$( dirname "$SCRIPT_DIR" )
# ---

# (디버깅용)
echo "--- DEBUG INFO (install_dependencies.sh) ---"
echo "SCRIPT_DIR is: $SCRIPT_DIR"
echo "ARCHIVE_ROOT is: $ARCHIVE_ROOT"
echo "--- END DEBUG INFO ---"


# 3. 최종 배포 디렉토리로 이동
APP_DIR="/home/ubuntu/app"
# (폴더가 없으면 생성)
mkdir -p $APP_DIR
cd $APP_DIR

# 4. (핵심) 임시 폴더(ARCHIVE_ROOT)에서 package.json 파일들을 복사해옴
#    'Install' 훅(hook)은 아직 실행 전이므로, 이 스크립트가
#    임시 폴더에서 package.json을 직접 가져와야 합니다.
echo "Copying package.json files from $ARCHIVE_ROOT..."
cp "$ARCHIVE_ROOT/package.json" .
cp "$ARCHIVE_ROOT/package-lock.json" .  # (package-lock.json이 있다면)

# 5. 프로덕션(운영)용 의존성만 설치 (devDependencies 제외)
#    (GitHub Actions에서 이미 'npm ci'와 'npm run build'를 실행했음)
echo "Installing production dependencies (npm install --production)..."
# npm install --production
npm ci
echo "Dependency installation complete."