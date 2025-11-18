import { useProjects } from '../hooks/useProjects'
import { PipelineStatusListener } from '../hooks/usePipelineStatusListener'

/**
 * 전역 파이프라인 상태 관리자
 *
 * 모든 페이지에서 프로젝트 처리 완료 알림을 받을 수 있도록 합니다.
 * 브라우저 연결 제한(6개)을 방지하기 위해 처리 중인 프로젝트만 추적합니다.
 *
 * @example
 * // AppProviders에서 사용:
 * <QueryClientProvider client={queryClient}>
 *   <PipelineStatusManager />
 *   {children}
 * </QueryClientProvider>
 */
export function PipelineStatusManager() {
  const { data: projects = [] } = useProjects()

  // 처리 중인 프로젝트만 SSE로 추적 (브라우저 연결 제한 방지)
  // 완료된 프로젝트는 더 이상 이벤트가 발생하지 않으므로 연결 불필요
  const trackingProjects = projects.filter(
    (p) => p.status === 'uploading' || p.status === 'processing' || p.status === 'uploaded',
  )

  return (
    <>
      {trackingProjects.map((project) => (
        <PipelineStatusListener key={project.id} project={project} />
      ))}
    </>
  )
}
