import { useMemo, useState, useEffect } from 'react'

import { Check, Mic2, Info } from 'lucide-react'

import type { VoiceSample } from '@/entities/voice-sample/types'
import { useVoiceSamples } from '@/features/voice-samples/hooks/useVoiceSamples'
import { Button } from '@/shared/ui/Button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/shared/ui/Dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/Select'
import { Spinner } from '@/shared/ui/Spinner'

type VoiceSampleSelectModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (voiceSampleId: string) => void
  currentVoiceSampleId?: string
  trackLabel: string
}

/**
 * 보이스 샘플 선택 모달
 * - 스피커 트랙에 매핑할 보이스 샘플을 선택
 * - 더빙을 위한 보이스 샘플 매핑 기능
 */
const DEFAULT_VOICE_MODEL = 'clone' // 기본 모델

export function VoiceSampleSelectModal({
  open,
  onOpenChange,
  onSelect,
  currentVoiceSampleId,
  trackLabel,
}: VoiceSampleSelectModalProps) {
  const [selectedId, setSelectedId] = useState<string | undefined>(
    currentVoiceSampleId || DEFAULT_VOICE_MODEL,
  )
  const { data, isLoading } = useVoiceSamples()

  // voiceSamples에 기본 clone 모델 추가
  const voiceSamples = useMemo(() => {
    const samples = data?.samples || []
    const cloneModel: VoiceSample = {
      id: 'clone',
      name: 'Clone',
      description: 'Default voice cloning model',
      attributes: 'Auto-detect voice characteristics',
      isPublic: true,
      isFavorite: false,
    }
    return [cloneModel, ...samples]
  }, [data])

  // Reset selectedId when modal opens with currentVoiceSampleId
  useEffect(() => {
    if (open) {
      setSelectedId(currentVoiceSampleId || DEFAULT_VOICE_MODEL)
    }
  }, [open, currentVoiceSampleId])

  const selectedSample = useMemo(
    () => voiceSamples?.find((sample) => sample.id === selectedId),
    [voiceSamples, selectedId],
  )

  const handleConfirm = () => {
    if (selectedId) {
      onSelect(selectedId)
      onOpenChange(false)
    }
  }

  const handleCancel = () => {
    setSelectedId(currentVoiceSampleId)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        {/* Header */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-lg">
              <Mic2 className="h-4.5 w-4.5" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-base">Voice Sample Configuration</DialogTitle>
              <DialogDescription className="text-xs">
                Assign a voice sample to{' '}
                <span className="text-foreground font-medium">{trackLabel}</span>
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner />
            </div>
          ) : voiceSamples && voiceSamples.length > 0 ? (
            <>
              {/* Select Component */}
              <div className="space-y-2">
                <label className="text-foreground text-sm font-medium">Voice Sample</label>
                <Select value={selectedId} onValueChange={setSelectedId}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select a voice sample..." />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="max-h-[280px] overflow-y-auto">
                      {voiceSamples.map((sample: VoiceSample) => (
                        <SelectItem key={sample.id} value={sample.id} className="pl-8">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-foreground text-sm font-medium">
                              {sample.name}
                            </span>
                            {sample.attributes && (
                              <span className="text-muted text-xs">{sample.attributes}</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </div>
                  </SelectContent>
                </Select>
              </div>

              {/* Selected Sample Details */}
              {selectedSample && (
                <div className="border-surface-3 bg-surface-2/50 rounded-xl border p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Info className="text-muted h-4 w-4" />
                    <span className="text-foreground text-sm font-medium">Sample Details</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Check className="text-primary h-4 w-4" />
                          <span className="text-foreground text-sm font-semibold">
                            {selectedSample.name}
                          </span>
                        </div>
                        {selectedSample.description && (
                          <p className="text-muted pl-6 text-xs leading-relaxed">
                            {selectedSample.description}
                          </p>
                        )}
                        {selectedSample.attributes && (
                          <div className="bg-surface-3/50 mt-2 inline-flex items-center gap-1.5 rounded-md px-2 py-1">
                            <span className="text-muted text-xs font-medium">Attributes:</span>
                            <span className="text-foreground text-xs">
                              {selectedSample.attributes}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="border-surface-3 bg-surface-2/30 flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-12">
              <div className="bg-surface-3 flex h-12 w-12 items-center justify-center rounded-full">
                <Mic2 className="text-muted h-5 w-5" />
              </div>
              <div className="text-center">
                <p className="text-foreground text-sm font-medium">No voice samples available</p>
                <p className="text-muted mt-1 text-xs">
                  Create voice samples in the Voice Samples page first
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-surface-3 flex items-center justify-end gap-2 border-t pt-4">
          <Button variant="ghost" onClick={handleCancel} size="sm">
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedId} size="sm">
            Apply Selection
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
