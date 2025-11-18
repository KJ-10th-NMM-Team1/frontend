import type { VoiceSample } from '@/entities/voice-sample/types'

import { VoiceSpotlightCard } from '../components/VoiceSpotlightCard'

interface CharacterVoicesSectionProps {
  voices: VoiceSample[]
  onPlay: (sample: VoiceSample) => void
  playingSampleId: string | null
  onAddToMyVoices?: (sample: VoiceSample) => void
  onRemoveFromMyVoices?: (sample: VoiceSample) => void
  addingToMyVoices: Set<string>
  removingFromMyVoices: Set<string>
  showTitle?: boolean
}

export function CharacterVoicesSection({
  voices,
  onPlay,
  playingSampleId,
  onAddToMyVoices,
  onRemoveFromMyVoices,
  addingToMyVoices,
  removingFromMyVoices,
  showTitle = true,
}: CharacterVoicesSectionProps) {
  if (voices.length === 0) return null

  return (
    <section className="space-y-3">
      {showTitle && (
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Character Voices</h2>
          {/* <button type="button" className="text-xs text-muted hover:text-foreground">
            View all
          </button> */}
        </div>
      )}
      <ul className="space-y-1">
        {voices.map((sample) => (
          <li
            key={sample.id}
            className="grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)_auto] items-center rounded-xl px-1 py-2 hover:bg-surface-1"
          >
            <VoiceSpotlightCard
              sample={sample}
              onAddToMyVoices={onAddToMyVoices ? () => onAddToMyVoices(sample) : undefined}
              onRemoveFromMyVoices={
                onRemoveFromMyVoices ? () => onRemoveFromMyVoices(sample) : undefined
              }
              isAdding={onAddToMyVoices ? addingToMyVoices.has(sample.id) : false}
              isRemoving={onRemoveFromMyVoices ? removingFromMyVoices.has(sample.id) : false}
              isInMyVoices={sample.isInMyVoices ?? false}
              onPlay={onPlay}
              isPlaying={playingSampleId === sample.id}
              isTableRow
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
