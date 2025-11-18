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
    <div className="rounded-3xl border border-surface-3 bg-surface-1 p-8 shadow-soft">
      <div className="mb-6 flex justify-between text-sm text-muted">
        <button type="button" className="text-primary" onClick={onBack}>
          ← 돌아가기
        </button>
        <div>기본 마이크</div>
      </div>
      <p className="text-xs font-semibold tracking-[0.3em] text-muted">읽어주세요</p>
      <p className="mt-3 text-lg font-medium text-foreground">
        "안녕하세요! 지금 저는 제 목소리를 샘플링하고 있습니다. 잠시 뒤 이 목소리가 텍스트를
        자동으로 읽어주게 될 거예요."
      </p>
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={onRemoveNoiseToggle}
          className="flex items-center gap-2 rounded-full border border-surface-3 px-4 py-2 text-sm text-muted"
        >
          AI 노이즈 제거
          <span
            className={`inline-flex h-4 w-8 items-center rounded-full px-1 text-[10px] font-semibold ${
              removeNoise
                ? 'justify-end bg-primary text-white'
                : 'justify-start bg-surface-3 text-muted'
            }`}
          >
            {removeNoise ? 'ON' : 'OFF'}
          </span>
        </button>
      </div>
      <div className="mt-8 flex justify-center">
        <Button
          type="button"
          onClick={() => {
            void onStartRecording()
          }}
          disabled={recordingState !== 'idle'}
        >
          녹음 시작
        </Button>
      </div>
      {micError ? <p className="mt-4 text-sm text-danger">{micError}</p> : null}
    </div>
  )
}
