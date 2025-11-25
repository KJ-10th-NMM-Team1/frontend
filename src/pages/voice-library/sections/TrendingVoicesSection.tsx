import type { VoiceSample } from '@/entities/voice-sample/types'

import { VoiceHighlightChip } from '../components/VoiceHighlightChip'

interface TrendingVoicesSectionProps {
  voices: VoiceSample[]
  onPlay: (sample: VoiceSample) => void
  playingSampleId: string | null
  onAddToMyVoices?: (sample: VoiceSample) => void
  onRemoveFromMyVoices?: (sample: VoiceSample) => void
  addingToMyVoices: Set<string>
  removingFromMyVoices: Set<string>
  onSortChange: () => void
  currentUserId?: string
}

export function TrendingVoicesSection({
  voices,
  onPlay,
  playingSampleId,
  onAddToMyVoices,
  onRemoveFromMyVoices,
  addingToMyVoices,
  removingFromMyVoices,
  onSortChange,
  currentUserId,
}: TrendingVoicesSectionProps) {
  if (voices.length === 0) return null

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">인기 목소리</h2>
        <button
          type="button"
          className="text-xs text-muted hover:text-foreground"
          onClick={onSortChange}
        >
          {/* View all */}
        </button>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {voices.slice(0, 6).map((sample) => {
          const isOwner =
            currentUserId && sample.owner_id
              ? String(currentUserId) === String(sample.owner_id)
              : false

          return (
            <VoiceHighlightChip
              key={sample.id}
              sample={sample}
              onPlay={onPlay}
              isPlaying={playingSampleId === sample.id}
              onAddToMyVoices={
                isOwner ? undefined : onAddToMyVoices ? () => onAddToMyVoices(sample) : undefined
              }
              onRemoveFromMyVoices={
                isOwner
                  ? undefined
                  : onRemoveFromMyVoices
                    ? () => onRemoveFromMyVoices(sample)
                    : undefined
              }
              isAdding={isOwner ? false : onAddToMyVoices ? addingToMyVoices.has(sample.id) : false}
              isRemoving={
                isOwner ? false : onRemoveFromMyVoices ? removingFromMyVoices.has(sample.id) : false
              }
              isInMyVoices={sample.isInMyVoices ?? false}
              isOwner={isOwner}
            />
          )
        })}
      </div>
    </section>
  )
}
