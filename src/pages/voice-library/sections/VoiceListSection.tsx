import type { VoiceSample } from '@/entities/voice-sample/types'
import { Spinner } from '@/shared/ui/Spinner'

import { VoiceSpotlightCard } from '../components/VoiceSpotlightCard'

interface VoiceListSectionProps {
  title: string
  samples: VoiceSample[]
  isLoading: boolean
  onPlay: (sample: VoiceSample) => void
  playingSampleId: string | null
  onAddToMyVoices?: (sample: VoiceSample) => void
  onRemoveFromMyVoices?: (sample: VoiceSample) => void
  addingToMyVoices: Set<string>
  removingFromMyVoices: Set<string>
  showActions?: boolean
  onEdit?: (sample: VoiceSample) => void
  onDelete?: (sample: VoiceSample) => void
  deletingId: string | null
  currentUserId?: string
}

export function VoiceListSection({
  title,
  samples,
  isLoading,
  onPlay,
  playingSampleId,
  onAddToMyVoices,
  onRemoveFromMyVoices,
  addingToMyVoices,
  removingFromMyVoices,
  showActions = false,
  onEdit,
  onDelete,
  deletingId,
  currentUserId,
}: VoiceListSectionProps) {
  // owner 확인 함수
  const isOwner = (sample: VoiceSample) => {
    if (!currentUserId || !sample.owner_id) return false
    return String(currentUserId) === String(sample.owner_id)
  }

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : samples.length === 0 ? (
        <div className="rounded-2xl border border-surface-3 bg-surface-1 p-12 text-center">
          <p className="text-muted">조건에 맞는 보이스가 없습니다.</p>
        </div>
      ) : (
        <ul className="space-y-1">
          {samples.map((sample) => {
            const sampleIsOwner = isOwner(sample)
            const canEdit = showActions && sampleIsOwner && onEdit
            const canDelete = showActions && sampleIsOwner && onDelete

            return (
              <li
                key={sample.id}
                className="grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)_auto] items-center rounded-xl px-1 py-2 hover:bg-surface-1"
              >
                <VoiceSpotlightCard
                  sample={sample}
                  onAddToMyVoices={
                    sampleIsOwner
                      ? undefined
                      : onAddToMyVoices
                        ? () => onAddToMyVoices(sample)
                        : undefined
                  }
                  onRemoveFromMyVoices={
                    sampleIsOwner
                      ? undefined
                      : onRemoveFromMyVoices
                        ? () => onRemoveFromMyVoices(sample)
                        : undefined
                  }
                  isAdding={
                    sampleIsOwner
                      ? false
                      : onAddToMyVoices
                        ? addingToMyVoices.has(sample.id)
                        : false
                  }
                  isRemoving={
                    sampleIsOwner
                      ? false
                      : onRemoveFromMyVoices
                        ? removingFromMyVoices.has(sample.id)
                        : false
                  }
                  isInMyVoices={sample.isInMyVoices ?? false}
                  onPlay={onPlay}
                  isPlaying={playingSampleId === sample.id}
                  isTableRow
                  onEdit={canEdit ? () => onEdit(sample) : undefined}
                  onDelete={canDelete ? () => onDelete(sample) : undefined}
                  isDeleting={canDelete && deletingId === sample.id}
                  isOwner={sampleIsOwner}
                />
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
