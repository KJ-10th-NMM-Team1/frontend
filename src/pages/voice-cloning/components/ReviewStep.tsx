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
    <div className="flex flex-col p-12">
      {/* Back Button */}
      <button
        type="button"
        className="mb-8 flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-gray-900"
        onClick={onRetry}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        다시 녹음하기
      </button>

      <h3 className="mb-4 text-center text-xl font-bold text-gray-900">녹음 샘플 확인</h3>
      <p className="mb-8 text-center text-base leading-relaxed text-gray-600">
        샘플을 재생해보고 품질이 괜찮다면 다음 단계로 이동하세요.
      </p>

      {recordingState === 'converting' ? (
        <div className="mb-8 flex justify-center">
          <div className="text-center">
            <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-purple-600" />
            <p className="text-sm text-gray-600">파일 처리 중...</p>
          </div>
        </div>
      ) : (
        previewUrl && (
          <div className="mb-8 rounded-2xl">
            <audio ref={audioRef} controls className="w-full" src={previewUrl} />
            {/* <p className="mt-4 text-center text-xs text-gray-500">
              스페이스바를 눌러 재생/일시정지할 수 있습니다
            </p> */}
          </div>
        )
      )}

      <div className="mb-12 rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">녹음 길이</span>
          <span className="text-sm font-semibold text-gray-900">{recordedDuration}초</span>
        </div>
        {recordedDuration < 10 && (
          <p className="mt-2 text-xs text-amber-600">최소 10초 이상 녹음해주세요</p>
        )}
      </div>

      <div className="flex justify-center">
        <Button
          type="button"
          variant="primary"
          className="rounded-full px-6 py-3 text-sm font-semibold"
          onClick={onProceed}
          disabled={recordedDuration < 10}
        >
          다음 단계로
        </Button>
      </div>
    </div>
  )
}
