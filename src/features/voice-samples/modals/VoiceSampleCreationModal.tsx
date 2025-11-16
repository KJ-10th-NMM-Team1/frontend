import { Dialog, DialogContent, DialogTitle } from '@/shared/ui/Dialog'

import { VoiceSampleForm } from '../components/VoiceSampleForm'

type VoiceSampleCreationModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VoiceSampleCreationModal({ open, onOpenChange }: VoiceSampleCreationModalProps) {
  const handleClose = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <DialogTitle>음성샘플 만들기</DialogTitle>
        </div>
        <VoiceSampleForm enableRecording={false} onCancel={handleClose} onSuccess={handleClose} />
      </DialogContent>
    </Dialog>
  )
}
