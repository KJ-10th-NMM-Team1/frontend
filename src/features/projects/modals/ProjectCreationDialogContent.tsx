import { DialogContent } from '@/shared/ui/Dialog'

import {
  AutoDubbingSettingsStep,
  type AutoDubbingSettingsValues,
} from './steps/AutoDubbingSettingsStep'
import { SourceSelectionStep } from './steps/SourceSelectionStep'
import type { ProjectCreationDraft, SourceSelectionResult, UploadProgressState } from './types'

type ProjectCreationDialogContentProps = {
  isSourceStep: boolean
  isDetailsStep: boolean
  draft: ProjectCreationDraft
  recentUploadSummary: string | null
  uploadProgress: UploadProgressState
  onSourceSubmit: (values: SourceSelectionResult) => void
  onSourceCancel: () => void
  onDetailsSubmit: (values: AutoDubbingSettingsValues) => void
  onBackToSource: () => void
}

export function ProjectCreationDialogContent({
  isSourceStep,
  isDetailsStep,
  draft,
  recentUploadSummary,
  uploadProgress,
  onSourceSubmit,
  onSourceCancel,
  onDetailsSubmit,
  onBackToSource,
}: ProjectCreationDialogContentProps) {
  return (
    <DialogContent
      onPointerDownOutside={(event) => {
        event.preventDefault()
      }}
    >
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
            sourceLanguage: draft.sourceLanguage || '한국어',
            targetLanguages: draft.targetLanguages,
            speakerCount: draft.speakerCount,
          }}
          draft={draft}
          uploadProgress={uploadProgress}
          onBack={onBackToSource}
          onSubmit={onDetailsSubmit}
        />
      ) : null}
    </DialogContent>
  )
}
