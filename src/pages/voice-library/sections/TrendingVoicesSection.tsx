import type { VoiceSample } from '@/entities/voice-sample/types'

import { TrendingVoiceChip } from '../components/TrendingVoiceChip'

interface TrendingVoicesSectionProps {
  voices: VoiceSample[]
  onPlay: (sample: VoiceSample) => void
  playingSampleId: string | null
  onAddToMyVoices?: (sample: VoiceSample) => void
  onRemoveFromMyVoices?: (sample: VoiceSample) => void
  addingToMyVoices: Set<string>
  removingFromMyVoices: Set<string>
  onSortChange: () => void
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
        {voices.slice(0, 6).map((sample) => (
          <TrendingVoiceChip
            key={sample.id}
            sample={sample}
            onPlay={onPlay}
            isPlaying={playingSampleId === sample.id}
            onAddToMyVoices={onAddToMyVoices ? () => onAddToMyVoices(sample) : undefined}
            onRemoveFromMyVoices={
              onRemoveFromMyVoices ? () => onRemoveFromMyVoices(sample) : undefined
            }
            isAdding={onAddToMyVoices ? addingToMyVoices.has(sample.id) : false}
            isRemoving={onRemoveFromMyVoices ? removingFromMyVoices.has(sample.id) : false}
            isInMyVoices={sample.isInMyVoices ?? false}
          />
        ))}
      </div>
    </section>
  )
}
