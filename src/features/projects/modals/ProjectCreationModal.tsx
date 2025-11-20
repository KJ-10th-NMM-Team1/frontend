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
    isSummaryStep,
    draft,
    recentUploadSummary,
    handleSourceSubmit,
    handleDetailsSubmit,
    handleSummarySubmit,
    handleBackToSource,
    handleBackToDetails,
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
        isSummaryStep={isSummaryStep}
        draft={draft}
        recentUploadSummary={recentUploadSummary}
        uploadProgress={uploadProgress}
        onSourceSubmit={handleSourceSubmit}
        onSourceCancel={closeProjectCreation}
        onDetailsSubmit={handleDetailsSubmit}
        onBackToSource={handleBackToSource}
        onSummarySubmit={handleSummarySubmit}
        onBackToDetails={handleBackToDetails}
      />
    </Dialog>
  )
}
