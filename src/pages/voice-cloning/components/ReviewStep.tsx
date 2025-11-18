import type { RefObject } from 'react'

import { Button } from '@/shared/ui/Button'

import type { RecordingState } from '../hooks/useRecording'

interface ReviewStepProps {
  recordingState: RecordingState
  recordedDuration: number
  previewUrl: string | null
  audioRef: RefObject<HTMLAudioElement>
  onRetry: () => void
  onProceed: () => void
}

export function ReviewStep({
  recordingState,
  recordedDuration,
  previewUrl,
  audioRef,
  onRetry,
  onProceed,
}: ReviewStepProps) {
  return (
    <div className="rounded-3xl border border-surface-3 bg-surface-1 p-8 shadow-soft">
      <button type="button" className="mb-4 text-sm text-primary" onClick={onRetry}>
        ← 다시 녹음하기
      </button>
      <h3 className="text-lg font-semibold">선택한 샘플</h3>
      <p className="mb-4 text-sm text-muted">
        샘플을 재생해보고 품질이 괜찮다면 다음 단계로 이동하세요.
      </p>
      {recordingState === 'converting' ? (
        <p className="text-sm text-muted">파일 처리 중...</p>
      ) : (
        previewUrl && (
          <div className="space-y-2">
            <audio ref={audioRef} controls className="w-full" src={previewUrl} />
          </div>
        )
      )}
      <div className="mt-4 text-xs text-muted">
        녹음 길이: {recordedDuration}s (최소 10초 이상이어야 합니다)
      </div>
      <div className="mt-6 flex justify-end">
        <Button type="button" onClick={onProceed}>
          샘플 사용하기
        </Button>
      </div>
    </div>
  )
}
