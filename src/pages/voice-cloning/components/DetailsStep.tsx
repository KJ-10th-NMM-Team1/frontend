import { VoiceSampleForm } from '@/features/voice-samples/components/VoiceSampleForm'

interface DetailsStepProps {
  selectedFile: File | null
  onBack: () => void
  onSuccess: () => void
}

export function DetailsStep({ selectedFile, onBack, onSuccess }: DetailsStepProps) {
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
        처음으로
      </button>

      {selectedFile ? (
        <VoiceSampleForm
          initialFile={selectedFile}
          hideFileUpload
          onCancel={onBack}
          onSuccess={onSuccess}
        />
      ) : (
        <div className="rounded-xl bg-gray-50 p-8 text-center">
          <p className="text-sm text-gray-600">사용할 샘플이 없습니다.</p>
        </div>
      )}
    </div>
  )
}
