# Contributing Guide

이 저장소는 5명의 초보 프론트엔드 팀이 일관된 규칙으로 협업할 수 있도록 구성되었습니다. 아래 원칙을 따라 주세요.

## 1. 브랜치 & 커밋

- 기본 브랜치: `main` (보호됨)
- 작업 브랜치 네이밍: `feature/<scope>-<summary>`
- 커밋 메시지: [Conventional Commits](https://www.conventionalcommits.org/)
  - 예: `feat(projects): add creation wizard validation`

## 2. Pull Request 체크리스트

1. PR 제목도 Conventional Commits 형태로 작성합니다.
2. 변경 요약, 테스트 결과(`pnpm lint`, `pnpm test`, 필요 시 `pnpm test:e2e`), 스크린샷 또는 GIF를 포함합니다.
3. 최소 1명의 팀원 리뷰를 받고 승인 후 병합합니다.
4. TODO 또는 향후 작업은 이슈로 남깁니다.

## 3. 개발 플로우

1. `pnpm install` → `pnpm dev`로 개발 서버 실행
2. UI 또는 상태 관련 변경 시 최소한 Storybook 스토리 또는 Vitest 테스트 파일에 TODO 코멘트와 함께 기록합니다.
3. API 연동은 `src/shared/api/client.tsx`의 ky 인스턴스를 통해 수행하며, React Query 훅(`useProjects`, `useProject` 등)을 재사용합니다.
4. 전역 상태는 **Zustand 스토어**(`useAuthStore`, `useUiStore`, `useEditorStore`)만 사용합니다.

## 4. 코드 스타일

- ESLint + Prettier를 통해 정적 분석 및 포맷팅을 수행합니다. 수동 수정보다 자동 수정을 우선합니다.
- Tailwind 클래스는 `layout → spacing → color → state` 순서로 작성하고, 조건부 클래스는 `cn()` 헬퍼를 이용합니다.
- 컴포넌트 당 파일 하나를 원칙으로 하며, 필요 시 `components/`, `hooks/`, `modals/` 등의 폴더로 세분화하세요.
- 접근성 고려: Radix UI를 활용하고 `aria` 속성 및 focus 스타일을 유지합니다.

## 5. 테스트 & 품질

- `pnpm lint`와 `pnpm test`는 모든 PR에서 필수입니다.
- E2E(view layer) 확인이 필요하면 `pnpm test:e2e`를 실행하고 결과를 PR에 첨부합니다.
- CI (`.github/workflows/ci.yml`)가 실패하면 원인 분석 후 재시도합니다.

## 6. 문서화

- 구조적 변경이나 기술 선택은 `docs/adr/` 폴더의 ADR 문서에 기록합니다.
- README의 “초보 5인이 지켜야 할 규칙”을 항상 최신 상태로 유지합니다.
- 규칙, 흐름, 참고 사항은 한글로 작성하여 팀 전원이 이해할 수 있도록 합니다.

팀의 성장과 학습을 위해 작은 변화라도 기록하고 공유해주세요. Happy hacking! 🎉
