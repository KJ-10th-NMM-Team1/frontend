#!/bin/bash

# 1. 최종 배포 디렉토리로 이동
APP_DIR="/home/ubuntu/app"
cd $APP_DIR

# 2. (선택) GitHub Actions에서 빌드한 .env 파일이 있다면
#    루트의 .env.production 파일을 .env.local로 복사
# if [ -f ".env.production" ]; then
#   cp .env.production .env.local
# fi

# 3. pm2를 사용해 Node.js 서버 시작
#    (package.json의 "start" 스크립트를 실행)
echo "Starting React SSR (Node.js) server using pm2..."
pm2 delete react-app || true
# 'react-app'이라는 이름으로 'npm start' 명령어를 실행합니다.
# (예: "start": "next start")

pm2 start npm --name "react-app" -- run dev

# (참고) 만약 'npm start'가 아니라 build/server.js 등을 직접 실행해야 한다면:
# pm2 start build/server.js --name "react-app"

# (선택) pm2가 EC2 재부팅 시 자동으로 시작되도록 설정
pm2 save
pm2 startup

echo "Life Cycle - ApplicationStart: Server successfully started"