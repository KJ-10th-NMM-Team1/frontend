/**
 * Smooth Progress localStorage 관리 유틸리티
 *
 * 프로젝트별 타겟 진행도를 localStorage에 저장/로드
 * 새로고침 시에도 임의로 증가시킨 progress가 유지됨
 */

const STORAGE_KEY_PREFIX = 'smooth_progress_'
const STORAGE_EXPIRY_MS = 1000 * 60 * 60 * 24 // 24시간

interface StoredProgress {
  progresses: Record<string, number>
  timestamp: number
}

/**
 * 프로젝트별 smooth progress를 localStorage에 저장
 */
export function saveSmoothProgress(projectId: string, progresses: Record<string, number>): void {
  try {
    const key = `${STORAGE_KEY_PREFIX}${projectId}`
    const data: StoredProgress = {
      progresses,
      timestamp: Date.now(),
    }
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    // localStorage 오류는 무시 (quota 초과 등)
    console.warn('Failed to save smooth progress to localStorage:', error)
  }
}

/**
 * 프로젝트별 smooth progress를 localStorage에서 로드
 * 만료되었거나 없으면 null 반환
 */
export function loadSmoothProgress(projectId: string): Record<string, number> | null {
  try {
    const key = `${STORAGE_KEY_PREFIX}${projectId}`
    const stored = localStorage.getItem(key)

    if (!stored) return null

    const data = JSON.parse(stored) as StoredProgress

    // 만료 체크
    if (Date.now() - data.timestamp > STORAGE_EXPIRY_MS) {
      // 만료된 데이터는 삭제
      localStorage.removeItem(key)
      return null
    }

    return data.progresses
  } catch (error) {
    // parse 오류 등은 무시
    console.warn('Failed to load smooth progress from localStorage:', error)
    return null
  }
}

/**
 * 특정 프로젝트의 저장된 progress 삭제
 */
export function clearSmoothProgress(projectId: string): void {
  try {
    const key = `${STORAGE_KEY_PREFIX}${projectId}`
    localStorage.removeItem(key)
  } catch (error) {
    console.warn('Failed to clear smooth progress from localStorage:', error)
  }
}

/**
 * 만료된 모든 smooth progress 데이터 정리
 * 주기적으로 호출하여 localStorage 공간 확보
 */
export function cleanupExpiredSmoothProgress(): void {
  try {
    const keysToRemove: string[] = []

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key?.startsWith(STORAGE_KEY_PREFIX)) continue

      const stored = localStorage.getItem(key)
      if (!stored) continue

      const data = JSON.parse(stored) as StoredProgress
      if (Date.now() - data.timestamp > STORAGE_EXPIRY_MS) {
        keysToRemove.push(key)
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key))

    if (keysToRemove.length > 0) {
      console.log(`Cleaned up ${keysToRemove.length} expired smooth progress entries`)
    }
  } catch (error) {
    console.warn('Failed to cleanup expired smooth progress:', error)
  }
}
