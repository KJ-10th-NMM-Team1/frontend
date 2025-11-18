import { Button } from '@/shared/ui/Button'

interface RecordingStepProps {
  formattedTime: string
  onStopRecording: () => void
  onCancel: () => void
}

export function RecordingStep({ formattedTime, onStopRecording, onCancel }: RecordingStepProps) {
  return (
    <div className="rounded-3xl border border-surface-3 bg-surface-1 p-8 text-center shadow-soft">
      <p className="text-sm text-muted">녹음 중...</p>
      <div className="mt-4 rounded-2xl bg-surface-2 px-6 py-4 text-left">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">읽어주세요</p>
        <p className="mt-3 text-base font-medium leading-relaxed text-foreground">
          "안녕하세요! 지금 저는 제 목소리를 샘플링하고 있습니다. 잠시 뒤 이 목소리가 텍스트를
          자동으로 읽어주게 될 거예요."
        </p>
      </div>
      <p className="mt-4 text-4xl font-bold">{formattedTime}</p>
      <div className="mt-6 flex justify-center gap-4">
        <Button type="button" variant="danger" onClick={onStopRecording}>
          녹음 종료
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          취소
        </Button>
      </div>
    </div>
  )
}
