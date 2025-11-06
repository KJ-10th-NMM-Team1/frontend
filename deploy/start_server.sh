#!/bin/bash

# 1. 최종 배포 디렉토리로 이동
APP_DIR="/home/ubuntu/app"
cd $APP_DIR

echo "Starting React SSR (Node.js) server using pm2..."
<<<<<<< HEAD
pm2 delete react-app || true
pm2 start npm --name "react-app" -- run dev
echo "Life Cycle - ApplicationStart: Server successfully started"
=======
pm2 start npm --name "react-app" -- run dev
echo "Life Cycle - ApplicationStart: Server successfully started"
>>>>>>> 82be241 (Deploy (#81))
