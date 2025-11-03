# 팀 작업 원칙

- `main` 브랜치에 직접 푸시하지 않습니다.
- PR을 열 때 설명을 남기고, 병합 전에 리뷰를 완료합니다.

# Docker 기반 개발 환경

- VS Code에서 저장소 루트(frontend)를 열어 작업하세요.
- 사전 준비: Dev Containers 확장이 설치된 VS Code가 필요합니다.
- 컨테이너 실행: Ctrl + Shift + P → Dev Containers: Rebuild and Reopen in Container를 선택하세요.
- 개발 서버 시작: 컨테이너 내부 터미널에서 npm run dev를 실행합니다.
- 서버 중지: 실행 중인 터미널에서 Ctrl + C를 누르면 종료됩니다.

## package.json 수정 시
 - 터미널에 npm install --package-lock-only 입력하여 package-lock.json 도 함께 갱신

 ```shell
$ docker-compose down -v --rmi all # 볼륨, 네트워크 이미지 전부 삭제 명령어
$ docker-compose up -d # 도커 설치 명령어
$ docker exec -it frontend bash # 프론트엔드 컨테이너 들어가기(종료는 exit, Ctrl + D)
 ```
