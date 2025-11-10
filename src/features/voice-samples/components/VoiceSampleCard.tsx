import { Heart, MoreVertical, Play } from 'lucide-react'

import type { VoiceSample } from '@/entities/voice-sample/types'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/Dropdown'

import { useToggleFavorite } from '../hooks/useVoiceSamples'

type VoiceSampleCardProps = {
  sample: VoiceSample
  isSelected?: boolean
  onSelect?: (sample: VoiceSample) => void
  onPlay?: (sample: VoiceSample) => void
}

export function VoiceSampleCard({ sample, isSelected, onSelect, onPlay }: VoiceSampleCardProps) {
  const toggleFavorite = useToggleFavorite()

  const handleFavoriteClick = (event: React.MouseEvent) => {
    event.stopPropagation()
    toggleFavorite.mutate({ id: sample.id, isFavorite: !sample.isFavorite })
  }

  const handlePlayClick = (event: React.MouseEvent) => {
    event.stopPropagation()
    onPlay?.(sample)
  }

  const handleCardClick = () => {
    onSelect?.(sample)
  }

  return (
    <Card
      className={cn(
        'relative cursor-pointer transition-all hover:shadow-xl',
        isSelected && 'ring-primary ring-2',
      )}
      onClick={handleCardClick}
    >
      <div className="flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {sample.isPublic && (
              <Badge className="bg-primary text-primary-foreground text-xs">Public</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleFavoriteClick}
              className="focus-visible:outline-hidden focus-visible:ring-accent hover:bg-surface-3 rounded-full p-1.5 transition-colors focus-visible:ring-2"
            >
              <Heart
                className={cn(
                  'h-5 w-5 transition-colors',
                  sample.isFavorite ? 'fill-info text-info' : 'text-muted hover:text-info',
                )}
              />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="focus-visible:outline-hidden focus-visible:ring-accent hover:bg-surface-3 rounded-full p-1.5 transition-colors focus-visible:ring-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="text-muted h-5 w-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>편집</DropdownMenuItem>
                <DropdownMenuItem className="text-danger">삭제</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Voice Info */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-foreground text-base font-semibold">
              {sample.name}
              {sample.type && ` - ${sample.type}`}
            </h3>
          </div>
          {sample.attributes && <p className="text-muted text-xs">{sample.attributes}</p>}
        </div>

        {/* Play Button */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="primary"
            size="icon"
            onClick={handlePlayClick}
            className="h-10 w-10 rounded-full"
          >
            <Play className="h-4 w-4 fill-current" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
