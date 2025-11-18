import { Button } from '@/shared/ui/Button'

import type { RecordingState } from '../hooks/useRecording'

interface RecordIntroStepProps {
  removeNoise: boolean
  recordingState: RecordingState
  micError: string | null
  onRemoveNoiseToggle: () => void
  onStartRecording: () => Promise<void>
  onBack: () => void
}

export function RecordIntroStep({
  removeNoise,
  recordingState,
  micError,
  onRemoveNoiseToggle,
  onStartRecording,
  onBack,
}: RecordIntroStepProps) {
  return (
    <div className="flex flex-col p-12">
      {/* Back Button */}
      <button
        type="button"
        className="mb-8 flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-gray-900"
        onClick={onBack}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        돌아가기
      </button>

      {/* Microphone Icon */}
      {/* <div className="mb-8 flex justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-purple-100">
          <svg
            className="h-10 w-10 text-purple-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
        </div>
      </div> */}

      {/* Instructions */}
      <div className="mb-8 rounded-2xl bg-gray-50 p-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
          다음 문장을 읽어주세요
        </p>
        <p className="text-base leading-relaxed text-gray-800">
          "안녕하세요! 지금 저는 제 목소리를 샘플링하고 있습니다. 잠시 뒤 이 목소리가 텍스트를
          자동으로 읽어주게 될 거예요."
        </p>
      </div>

      {/* Settings */}
      <div className="mb-12 flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-3">
          <svg
            className="h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
            />
          </svg>
          <span className="text-sm font-medium text-gray-700">AI 노이즈 제거</span>
        </div>
        <button
          type="button"
          onClick={onRemoveNoiseToggle}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            removeNoise ? 'bg-purple-600' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              removeNoise ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Action Button */}
      <div className="flex justify-center">
        <Button
          type="button"
          variant="primary"
          className="flex items-center gap-2 rounded-full px-8 py-3 text-sm font-semibold"
          onClick={() => {
            void onStartRecording()
          }}
          disabled={recordingState !== 'idle'}
        >
          <svg
            className={`h-4 w-4 ${recordingState === 'idle' ? 'animate-pulse' : ''}`}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="8" />
          </svg>
          녹음 시작
        </Button>
      </div>

      {micError && (
        <div className="mt-6 rounded-lg bg-red-50 p-4 text-center text-sm text-red-600">
          {micError}
        </div>
      )}
    </div>
  )
}
