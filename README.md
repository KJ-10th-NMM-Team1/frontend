# 팀 작업 원칙

- `main` 브랜치에 직접 푸시하지 않습니다.
- PR을 열 때 설명을 남기고, 병합 전에 리뷰를 완료합니다.

# Docker 기반 개발 환경

## 준비 사항

- Docker Desktop(또는 다른 Docker Engine)을 설치하고 실행합니다.
- Windows에서는 WSL2와 Docker Linux 엔진 연동을 활성화합니다.

## 최초 실행

1. 이 디렉터리로 이동합니다: `cd frontend`
2. 개발용 컨테이너를 빌드하고 실행합니다: `docker compose up --build`
   - Vite 개발 서버는 `http://localhost:5173`에서 확인할 수 있습니다.

## 일상적인 사용

- 재빌드 없이 다시 시작: `docker compose up`
- 컨테이너와 네트워크 정리: `docker compose down`
- 새 의존성 설치(컨테이너 내부): `docker compose run --rm frontend npm install <패키지>`
  - `package.json`과 `package-lock.json`은 호스트에서 업데이트되고, `node_modules`는 볼륨 덕분에 컨테이너 안에 유지됩니다.
- 로컬에서 파일을 수정하면 볼륨 마운트로 인해 컨테이너에도 즉시 반영됩니다.

## 환경 변수 관리

- 공통 환경 값은 이 디렉터리의 `.env` 파일에 정리할 수 있습니다.
- `frontend/.env`가 존재하면 Docker Compose가 자동으로 로드합니다. 민감한 정보는 별도로 보관하세요.

## VS Code Dev Container 사용법

- VS Code에서 명령 팔레트(Ctrl+Shift+P)를 열고 `Dev Containers: Reopen in Container`를 선택합니다.
- `.devcontainer/devcontainer.json` 설정에 따라 `docker-compose.yml`의 `frontend` 서비스가 자동으로 빌드·실행됩니다.
- `postCreateCommand`가 `npm ci`를 실행하므로 별도 의존성 설치 없이 바로 개발할 수 있습니다.
- 첫 실행 후 브라우저에서 `http://localhost:5173`에 접속하면 Vite 개발 서버를 확인할 수 있습니다.

## 다른 에디터 사용자용 안내

- VS Code를 사용하지 않는 경우 기존 절차인 `docker compose up --build`(최초) 또는 `docker compose up`(재시작)을 사용하면 동일한 컨테이너 환경이 구성됩니다.
- 작업 종료 시 `docker compose down`으로 컨테이너와 네트워크를 정리하세요.
