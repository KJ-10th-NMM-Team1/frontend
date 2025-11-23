import { Check } from 'lucide-react'

import type { VoiceSample } from '@/entities/voice-sample/types'
import { VOICE_CATEGORY_MAP } from '@/shared/constants/voiceCategories'
import { cn } from '@/shared/lib/utils'

import { VoiceSampleAvatar } from './VoiceSampleAvatar'
import { VoiceSampleTags } from './VoiceSampleTags'

type VoiceSampleRowItemProps = {
  sample: VoiceSample
  avatarUrl: string
  isSelected: boolean
  isPlaying: boolean
  canPlay: boolean
  onSelect: (id: string) => void
  onPlay: (e: React.MouseEvent, sample: VoiceSample) => void
}

export function VoiceSampleRowItem({
  sample,
  avatarUrl,
  isSelected,
  isPlaying,
  canPlay,
  onSelect,
  onPlay,
}: VoiceSampleRowItemProps) {
  const metaTags: string[] = []
  if (sample.country) metaTags.push(sample.country === 'ko' ? '한국어' : '영어')

  if (sample.category) {
    const cats = Array.isArray(sample.category) ? sample.category : [sample.category]
    const firstCategory = cats[0]
    if (firstCategory) {
      const categoryLabel =
        VOICE_CATEGORY_MAP[firstCategory as keyof typeof VOICE_CATEGORY_MAP] || firstCategory
      metaTags.push(categoryLabel)
    }
  }

  const allTags = [...metaTags]
  if (sample.tags && sample.tags.length > 0) {
    sample.tags.forEach((tag) => {
      if (!allTags.includes(tag)) {
        allTags.push(tag)
      }
    })
  }

  return (
    <div
      onClick={() => onSelect(sample.id)}
      className={cn(
        'group/row relative mx-2 mb-1 flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 transition-all duration-200',
        isSelected
          ? 'border-primary/40 bg-primary/10 shadow-soft'
          : 'hover:border-outline/30 border-transparent bg-surface-1 hover:bg-surface-2',
      )}
    >
      <VoiceSampleAvatar
        sample={sample}
        avatarUrl={avatarUrl}
        isPlaying={isPlaying}
        canPlay={canPlay}
        onPlay={onPlay}
      />

      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <div className="mb-1 flex items-center gap-2">
          <span
            className={cn(
              'truncate text-sm font-semibold transition-colors',
              isSelected ? 'text-primary' : 'text-foreground',
            )}
          >
            {sample.name}
          </span>
        </div>

        {sample.id === 'clone' ? (
          <span className="text-muted-foreground text-xs">
            오디오 특성을 자동으로 감지하여 복제합니다.
          </span>
        ) : (
          <p className="text-muted-foreground truncate text-xs group-hover/row:text-foreground">
            {sample.description || '설명이 없는 음성입니다.'}
          </p>
        )}
      </div>

      {sample.id !== 'clone' && (
        <div className="ml-auto hidden shrink-0 justify-end pl-4 sm:block">
          <VoiceSampleTags tags={allTags} country={sample.country} />
        </div>
      )}

      {isSelected && (
        <div className="ml-2 flex shrink-0 items-center">
          <Check className="h-4 w-4 text-primary" />
        </div>
      )}
    </div>
  )
}
