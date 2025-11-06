#!/bin/bash
set -ex # (디버깅을 위해 추가)

APP_DIR="/home/ubuntu/app"
VENV_DIR="$APP_DIR/venv" # (FastAPI/Python용 venv 경로. React에는 불필요할 수 있음)

# React 앱(Node.js)은 가상 환경(venv) 활성화가 필요 없습니다.
# echo "Activating virtual environment at $VENV_DIR/bin/activate..."
# source $VENV_DIR/bin/activate
# if [ $? -ne 0 ]; then
#     echo "ERROR: Virtual environment not found at $VENV_DIR/bin/activate"
#     exit 1
# fi

# 애플리케이션 코드가 있는 디렉터리로 이동
cd $APP_DIR
if [ $? -ne 0 ]; then
    echo "ERROR: Cannot cd to $APP_DIR"
    exit 1
fi

echo "Starting React SSR (Node.js) server using pm2..."

# [수정]
# 'pm2 restart'나 'pm2 start' 대신 'pm2 startOrRestart'를 사용합니다.
# 이 명령어는 'react-app'이 없으면 start하고,
# 이미 실행 중이면 restart하여 'Process not found' 오류를 발생시키지 않습니다.
#
# (pm2가 전역으로 설치되어 있어야 함: sudo npm install pm2 -g)
pm2 startOrRestart ecosystem.config.js

# (선택 사항) PM2가 재부팅 시에도 실행되도록 설정 저장
# (이 명령어는 EC2에서 수동으로 1회만 실행해도 됩니다)
# pm2 save

echo "Life Cycle - ApplicationStart: Server successfully started"