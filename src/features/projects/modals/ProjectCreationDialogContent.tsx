import { DialogContent } from '@/shared/ui/Dialog'

import {
  AutoDubbingSettingsStep,
  type AutoDubbingSettingsValues,
} from './steps/AutoDubbingSettingsStep'
import { SourceSelectionStep } from './steps/SourceSelectionStep'
import { SummaryStep } from './steps/SummaryStep'
import type { ProjectCreationDraft, SourceSelectionResult, UploadProgressState } from './types'

type ProjectCreationDialogContentProps = {
  isSourceStep: boolean
  isDetailsStep: boolean
  isSummaryStep: boolean
  draft: ProjectCreationDraft
  recentUploadSummary: string | null
  uploadProgress: UploadProgressState
  onSourceSubmit: (values: SourceSelectionResult) => void
  onSourceCancel: () => void
  onDetailsSubmit: (values: AutoDubbingSettingsValues) => void
  onBackToSource: () => void
  onSummarySubmit: () => void
  onBackToDetails: () => void
}

export function ProjectCreationDialogContent({
  isSourceStep,
  isDetailsStep,
  isSummaryStep,
  draft,
  recentUploadSummary,
  uploadProgress,
  onSourceSubmit,
  onSourceCancel,
  onDetailsSubmit,
  onBackToSource,
  onSummarySubmit,
  onBackToDetails,
}: ProjectCreationDialogContentProps) {
  return (
    <DialogContent
      onPointerDownOutside={(event) => {
        event.preventDefault()
      }}
    >
      <div className="mb-6 flex items-center gap-2 text-sm font-medium">
        <div className={`flex items-center gap-2 ${isSourceStep ? 'text-primary' : 'text-muted'}`}>
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${isSourceStep ? 'bg-primary text-white' : 'bg-surface-4 text-muted-foreground'}`}
          >
            1
          </span>
          <span>소스 선택</span>
        </div>
        <div className="h-px w-8 bg-surface-4" />
        <div
          className={`flex items-center gap-2 ${isDetailsStep ? 'text-primary' : 'text-muted'}`}
        >
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${isDetailsStep ? 'bg-primary text-white' : 'bg-surface-4 text-muted-foreground'}`}
          >
            2
          </span>
          <span>자동 더빙 설정</span>
        </div>
        <div className="h-px w-8 bg-surface-4" />
        <div
          className={`flex items-center gap-2 ${isSummaryStep ? 'text-primary' : 'text-muted'}`}
        >
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${isSummaryStep ? 'bg-primary text-white' : 'bg-surface-4 text-muted-foreground'}`}
          >
            3
          </span>
          <span>설정 확인</span>
        </div>
      </div>

      {isSourceStep ? (
        <SourceSelectionStep
          initialMode={draft.sourceType}
          initialYoutubeUrl={draft.youtubeUrl}
          previousUploadSummary={recentUploadSummary}
          onSubmit={onSourceSubmit}
          onCancel={onSourceCancel}
        />
      ) : null}

      {isDetailsStep ? (
        <AutoDubbingSettingsStep
          initialValues={{
            title: draft.title,
            detectAutomatically: draft.detectAutomatically,
            replaceVoiceSamples: draft.replaceVoiceSamples,
            sourceLanguage: draft.sourceLanguage || '',
            targetLanguages: draft.targetLanguages && draft.targetLanguages.length > 0 ? draft.targetLanguages : ['ko'],
            speakerCount: draft.speakerCount,
          }}
          uploadProgress={uploadProgress}
          onBack={onBackToSource}
          onSubmit={onDetailsSubmit}
        />
      ) : null}

      {isSummaryStep ? (
        <SummaryStep
          draft={draft}
          uploadProgress={uploadProgress}
          onBack={onBackToDetails}
          onSubmit={onSummarySubmit}
        />
      ) : null}
    </DialogContent>
  )
}
