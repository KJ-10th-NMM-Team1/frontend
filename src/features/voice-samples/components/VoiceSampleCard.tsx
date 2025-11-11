import { memo } from 'react'

import { Heart, MoreVertical, Pause, Play } from 'lucide-react'

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

import { useDeleteVoiceSample, useToggleFavorite } from '../hooks/useVoiceSamples'

type VoiceSampleCardProps = {
  sample: VoiceSample
  isSelected?: boolean
  isPlaying?: boolean
  isPlaying?: boolean
  onSelect?: (sample: VoiceSample) => void
  onPlay?: (sample: VoiceSample) => void
  onDelete?: (sampleId: string) => void
  onEdit?: (sample: VoiceSample) => void
}

function VoiceSampleCardComponent({
  sample,
  isSelected,
  isPlaying = false,
  onSelect,
  onPlay,
  onDelete,
  onEdit,
}: VoiceSampleCardProps) {
  const toggleFavorite = useToggleFavorite()
  const deleteVoiceSample = useDeleteVoiceSample()

  const handleFavoriteClick = (event: React.MouseEvent) => {
    event.stopPropagation()
    toggleFavorite.mutate({ id: sample.id, isFavorite: !sample.isFavorite })
  }

  const handlePlayClick = (event: React.MouseEvent) => {
    event.stopPropagation()
    onPlay?.(sample)
  }

  const handleEditClick = (event: React.MouseEvent) => {
    event.stopPropagation()
    onEdit?.(sample)
  }

  const handleDeleteClick = (event: React.MouseEvent) => {
    event.stopPropagation()
    if (window.confirm(`"${sample.name}" 음성 샘플을 삭제하시겠습니까?`)) {
      deleteVoiceSample.mutate(sample.id, {
        onSuccess: () => {
          onDelete?.(sample.id)
        },
      })
    }
  }

  return (
    <Card
      className={cn(
        'relative transition-all hover:shadow-xl',
        // 선택 기능 제거
        // isSelected && 'ring-primary ring-2',
        'relative transition-all hover:shadow-xl',
        // 선택 기능 제거
        // isSelected && 'ring-primary ring-2',
      )}
    >
      <div className="flex flex-col gap-3 p-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {sample.isPublic ? (
              <Badge className="bg-green-500 text-xs text-white">Public</Badge>
            ) : (
              <Badge className="bg-green-100 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-400">
                Private
              </Badge>
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
                  sample.isFavorite ? 'fill-red-500 text-red-500' : 'text-muted hover:text-red-500',
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
                <DropdownMenuItem onClick={handleEditClick}>편집</DropdownMenuItem>
                <DropdownMenuItem className="text-danger" onClick={handleDeleteClick}>
                  삭제
                </DropdownMenuItem>
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
          {sample.description && (
            <p className="text-muted line-clamp-2 text-sm">{sample.description}</p>
          )}
          {sample.attributes && <p className="text-muted text-xs">{sample.attributes}</p>}
        </div>

        {/* Play Button */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={isPlaying ? 'secondary' : 'primary'}
            variant={isPlaying ? 'secondary' : 'primary'}
            size="icon"
            onClick={handlePlayClick}
            className={cn(
              'h-12 w-12 shrink-0 rounded-full transition-all',
              isPlaying && 'bg-primary/80 hover:bg-primary/90',
            )}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5 fill-current" />
            ) : (
              <Play className="h-5 w-5 fill-current" />
            )}
          </Button>

          {/* Voice Info - Right Side */}
          <div className="min-w-0 flex-1 space-y-1">
            <h3 className="text-foreground text-base font-semibold">
              {sample.name}
              {sample.type && ` - ${sample.type}`}
            </h3>
            {sample.attributes && (
              <p className="text-muted text-sm leading-relaxed">{sample.attributes}</p>
            )}
            {sample.description && (
              <p className="text-muted line-clamp-2 text-sm">{sample.description}</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

// React.memo로 감싸서 props가 변경되지 않으면 리렌더링 방지
export const VoiceSampleCard = memo(VoiceSampleCardComponent, (prevProps, nextProps) => {
  // sample.id와 sample.isFavorite만 비교하여 해당 카드만 리렌더링
  return (
    prevProps.sample.id === nextProps.sample.id &&
    prevProps.sample.isFavorite === nextProps.sample.isFavorite &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isPlaying === nextProps.isPlaying
  )
})
