import { VoiceSampleForm } from '@/features/voice-samples/components/VoiceSampleForm'

interface DetailsStepProps {
  selectedFile: File | null
  onBack: () => void
  onSuccess: () => void
}

export function DetailsStep({ selectedFile, onBack, onSuccess }: DetailsStepProps) {
  return (
    <div className="rounded-3xl border border-surface-3 bg-surface-1 p-6 shadow-soft">
      <button type="button" className="mb-4 text-sm text-primary" onClick={onBack}>
        ← 처음으로
      </button>
      {selectedFile ? (
        <VoiceSampleForm
          initialFile={selectedFile}
          hideFileUpload
          onCancel={onBack}
          onSuccess={onSuccess}
        />
      ) : (
        <p className="text-sm text-muted">사용할 샘플이 없습니다.</p>
      )}
    </div>
  )
}
