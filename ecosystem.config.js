module.exports = {
  apps: [
    {
      name: 'react-app', // 👈 로그에 나온 PM2 이름과 일치
      script: 'npm', // 👈 로그에서 실행하던 /usr/bin/npm
      args: 'start', // 👈 npm start 스크립트를 실행

      // (선택 사항) 서버사이드 렌더링(SSR)을 위한 설정
      // cwd: '/home/ubuntu/app/build', // (SSR 서버 빌드 경로가 있다면)
      // interpreter: 'node',

      // (선택 사항) 기타 옵션
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
  ],
}
