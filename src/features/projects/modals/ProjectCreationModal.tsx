import { Dialog } from '@/shared/ui/Dialog'

import { ProjectCreationDialogContent } from './ProjectCreationDialogContent'
import { useProjectCreationModal } from './useProjectCreationModal'

export function ProjectCreationModal() {
  const {
    uploadProgress,
    projectCreation,
    closeProjectCreation,
    isSourceStep,
    isDetailsStep,
    draft,
    recentUploadSummary,
    handleSourceSubmit,
    handleDetailsSubmit,
    handleBackToSource,
  } = useProjectCreationModal()

  return (
    <Dialog
      open={projectCreation.open}
      onOpenChange={(open) => {
        if (!open) {
          closeProjectCreation()
        }
      }}
    >
      <ProjectCreationDialogContent
        isSourceStep={isSourceStep}
        isDetailsStep={isDetailsStep}
        draft={draft}
        recentUploadSummary={recentUploadSummary}
        uploadProgress={uploadProgress}
        onSourceSubmit={handleSourceSubmit}
        onSourceCancel={closeProjectCreation}
        onDetailsSubmit={handleDetailsSubmit}
        onBackToSource={handleBackToSource}
      />
    </Dialog>
  )
}
