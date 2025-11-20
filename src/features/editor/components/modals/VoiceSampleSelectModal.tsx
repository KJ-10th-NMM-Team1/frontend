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

  // 내가 추가한 보이스와 기본 보이스 모두 가져오기
  const { data: myVoicesData, isLoading: isLoadingMyVoices } = useVoiceSamples({
    myVoicesOnly: true,
  })
  const { data: defaultVoicesData, isLoading: isLoadingDefault } = useVoiceSamples({
    isBuiltin: true,
  })

  const isLoading = isLoadingMyVoices || isLoadingDefault

  // voiceSamples에 기본 clone 모델 추가하고 중복 제거
  const voiceSamples = useMemo(() => {
    const myVoices = myVoicesData?.samples || []
    const defaultVoices = defaultVoicesData?.samples || []

    // 중복 제거 (id 기준)
    const allSamplesMap = new Map<string, VoiceSample>()

    // 내가 추가한 보이스 추가
    myVoices.forEach((sample) => {
      allSamplesMap.set(sample.id, sample)
    })

    // 기본 보이스 추가 (중복이면 덮어쓰지 않음 - 내가 추가한 것이 우선)
    defaultVoices.forEach((sample) => {
      if (!allSamplesMap.has(sample.id)) {
        allSamplesMap.set(sample.id, sample)
      }
    })

    const samples = Array.from(allSamplesMap.values())

    const cloneModel: VoiceSample = {
      id: 'clone',
      name: 'Clone',
      description: 'Default voice cloning model',
      attributes: 'Auto-detect voice characteristics',
      isPublic: true,
      isInMyVoices: false,
      addedCount: 0,
      isBuiltin: false,
    }
    return [cloneModel, ...samples]
  }, [myVoicesData, defaultVoicesData])

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
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Mic2 className="h-4.5 w-4.5" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-base">Voice Sample Configuration</DialogTitle>
              <DialogDescription className="text-xs">
                Assign a voice sample to{' '}
                <span className="font-medium text-foreground">{trackLabel}</span>
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
                <label className="text-sm font-medium text-foreground">Voice Sample</label>
                <Select value={selectedId} onValueChange={setSelectedId}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select a voice sample..." />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="max-h-[280px] overflow-y-auto">
                      {voiceSamples.map((sample: VoiceSample) => (
                        <SelectItem key={sample.id} value={sample.id} className="pl-8">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-medium text-foreground">
                              {sample.name}
                            </span>
                            {sample.attributes && (
                              <span className="text-xs text-muted">{sample.attributes}</span>
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
                <div className="rounded-xl border border-surface-3 bg-surface-2/50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Info className="h-4 w-4 text-muted" />
                    <span className="text-sm font-medium text-foreground">Sample Details</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-primary" />
                          <span className="text-sm font-semibold text-foreground">
                            {selectedSample.name}
                          </span>
                        </div>
                        {selectedSample.description && (
                          <p className="pl-6 text-xs leading-relaxed text-muted">
                            {selectedSample.description}
                          </p>
                        )}
                        {selectedSample.attributes && (
                          <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-surface-3/50 px-2 py-1">
                            <span className="text-xs font-medium text-muted">Attributes:</span>
                            <span className="text-xs text-foreground">
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
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-surface-3 bg-surface-2/30 py-12">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-3">
                <Mic2 className="h-5 w-5 text-muted" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">No voice samples available</p>
                <p className="mt-1 text-xs text-muted">
                  Create voice samples in the Voice Samples page first
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-surface-3 pt-4">
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
