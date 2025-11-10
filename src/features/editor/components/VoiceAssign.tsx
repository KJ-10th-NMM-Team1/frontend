import type { Segment } from '../../../entities/segment/types'
import type { VoiceSample } from '../../../entities/voice-sample/types'
import { useEditorStore } from '../../../shared/store/useEditorStore'
import { Badge } from '../../../shared/ui/Badge'
import { Button } from '../../../shared/ui/Button'

type VoiceAssignProps = {
  voices: VoiceSample[]
  segments: Segment[]
}

export function VoiceAssign({ voices, segments }: VoiceAssignProps) {
  const selectedTrackId = useEditorStore((state) => state.selectedTrackId)
  const selectTrack = useEditorStore((state) => state.selectTrack)

  return (
    <div className="border-surface-3 bg-surface-1 space-y-4 rounded-3xl border p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <h3 className="text-foreground text-lg font-semibold">화자 & 보이스 매핑</h3>
        <Badge tone="review">레인 {segments.length}</Badge>
      </div>
      <div className="space-y-3">
        {segments.map((segment) => (
          <div key={segment.id} className="border-surface-4 bg-surface-2 rounded-2xl border p-4">
            <div className="text-muted flex items-center justify-between text-sm">
              <p className="text-foreground font-medium">{segment.speakerName}</p>
              <span>
                {segment.originalText.slice(0, 26)}
                {segment.originalText.length > 26 ? '…' : ''}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {voices.map((voice) => {
                const isActive = selectedTrackId === `${segment.id}-${voice.id}`
                return (
                  <Button
                    key={`${segment.id}-${voice.id}`}
                    type="button"
                    size="sm"
                    variant={isActive ? 'primary' : 'outline'}
                    onClick={() => selectTrack(isActive ? null : `${segment.id}-${voice.id}`)}
                  >
                    {voice.name} ({voice.language})
                  </Button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
