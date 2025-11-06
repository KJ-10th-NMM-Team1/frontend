#!/bin/bash

# 1. 최종 배포 디렉토리로 이동
APP_DIR="/home/ubuntu/app"
cd $APP_DIR

echo "Starting React SSR (Node.js) server using pm2..."
pm2 start npm --name "react-app" -- run dev
echo "Life Cycle - ApplicationStart: Server successfully started"