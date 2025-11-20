import type { ProjectProgressEvent, TargetProgressEvent } from '../../types/progress'

/**
 * 타겟 언어 완료 체크
 */
export function createTargetCompletionChecker(
  previousStatusMap: Map<string, string>,
  onComplete?: (projectId: string, projectTitle: string, targetLang: string, message: string) => void,
) {
  return (event: TargetProgressEvent) => {
    const key = `${event.projectId}:${event.targetLang}`
    const prevStatus = previousStatusMap.get(key)

    if (prevStatus !== 'completed' && event.status === 'completed') {
      // Target just completed!
      const message = `${event.stageName || event.targetLang} 작업이 완료되었습니다.`
      onComplete?.(event.projectId, event.projectTitle, event.targetLang, message)
      return { isNewCompletion: true, message }
    }

    // Update previous status
    previousStatusMap.set(key, event.status)
    return { isNewCompletion: false, message: '' }
  }
}

/**
 * 프로젝트 완료 체크
 */
export function createProjectCompletionChecker(
  previousStatusMap: Map<string, string>,
  onComplete?: (projectId: string, projectTitle: string, message: string) => void,
) {
  return (event: ProjectProgressEvent) => {
    const prevStatus = previousStatusMap.get(event.projectId)

    if (prevStatus !== 'completed' && event.status === 'completed') {
      // Project just completed!
      const message = event.message || '프로젝트 처리가 완료되었습니다.'
      onComplete?.(event.projectId, event.projectTitle, message)
      return { isNewCompletion: true, message }
    }

    // Update previous status
    previousStatusMap.set(event.projectId, event.status)
    return { isNewCompletion: false, message: '' }
  }
}