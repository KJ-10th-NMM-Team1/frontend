import { useProjectProgressListener } from '../hooks/useProjectProgressListener'

/**
 * 전역 프로젝트 진행도 관리 컴포넌트
 *
 * 모든 페이지에서 프로젝트 처리 진행도를 실시간으로 추적하고
 * 완료 시 토스트 알림을 표시합니다.
 *
 * @example
 * // AppProviders.tsx에서 사용:
 * <QueryClientProvider client={queryClient}>
 *   <ProjectProgressManager />
 *   {children}
 * </QueryClientProvider>
 */
export function ProjectProgressManager() {
  // 전체 프로젝트의 진행도를 구독
  useProjectProgressListener({
    // 타겟 언어 작업 완료 시 추가 처리
    onTargetComplete: (projectId, targetLang, message) => {
      console.log(`[Progress] Target completed: ${projectId} - ${targetLang}`)
      // 여기에 추가적인 작업 수행 가능 (예: 쿼리 무효화, 라우팅 등)
    },
    // 프로젝트 전체 완료 시 추가 처리
    onProjectComplete: (projectId, message) => {
      console.log(`[Progress] Project completed: ${projectId}`)
      // 여기에 추가적인 작업 수행 가능 (예: 쿼리 무효화, 라우팅 등)
    },
  })

  // 이 컴포넌트는 UI를 렌더링하지 않고 백그라운드에서만 동작
  return null
}
