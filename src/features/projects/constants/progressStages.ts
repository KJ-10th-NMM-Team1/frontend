export const PROGRESS_STAGES = {
  starting: 1,
  asr_started: 5,
  asr_completed: 20,
  translation_started: 21,
  translation_completed: 35,
  tts_started: 36,
  tts_completed: 85,
  mux_started: 86,
  done: 100,
  failed: 0,
} as const

export type ProgressStage = keyof typeof PROGRESS_STAGES

// 진행 단계 순서
export const STAGE_ORDER: ProgressStage[] = [
  'starting',
  'asr_started',
  'asr_completed',
  'translation_started',
  'translation_completed',
  'tts_started',
  'tts_completed',
  'mux_started',
  'done',
]

/**
 * 현재 진행 단계의 다음 단계 진행도를 반환
 * @param currentProgress 현재 진행도
 * @returns 다음 단계의 진행도 (없으면 100)
 */
export function getNextStageProgress(currentProgress: number): number {
  for (const stage of STAGE_ORDER) {
    const stageProgress = PROGRESS_STAGES[stage]
    if (stageProgress > currentProgress) {
      return stageProgress
    }
  }
  return 100
}
