import { Mic2, Play, Pause, User } from 'lucide-react'

import type { VoiceSample } from '@/entities/voice-sample/types'
import { DEFAULT_AVATAR } from '@/features/voice-samples/components/voiceSampleFieldUtils'
import { cn } from '@/shared/lib/utils'

type VoiceSampleAvatarProps = {
  sample: VoiceSample
  avatarUrl: string
  isPlaying: boolean
  canPlay: boolean
  onPlay: (e: React.MouseEvent, sample: VoiceSample) => void
}

export function VoiceSampleAvatar({
  sample,
  avatarUrl,
  isPlaying,
  canPlay,
  onPlay,
}: VoiceSampleAvatarProps) {
  if (sample.id === 'clone') {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition-all">
        <Mic2 className="h-4 w-4" />
      </div>
    )
  }

  return (
    <div className="group relative flex h-10 w-10 shrink-0 items-center justify-center">
      {/* 아바타 이미지 컨테이너 */}
      <div
        className={cn(
          'h-10 w-10 overflow-hidden rounded-full border border-gray-200 bg-gray-50 transition-all duration-300',
          isPlaying && 'ring-2 ring-violet-500 ring-offset-1',
        )}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={sample.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              e.currentTarget.src = DEFAULT_AVATAR
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100">
            <User className="h-5 w-5 text-gray-400" />
          </div>
        )}
      </div>

      {/* 호버/재생 시 오버레이 */}
      {canPlay && (
        <button
          onClick={(e) => onPlay(e, sample)}
          className={cn(
            'absolute inset-0 flex items-center justify-center rounded-full transition-all duration-200',
            'bg-black/40 opacity-0 backdrop-blur-[1px] group-hover:opacity-100',
            isPlaying && 'bg-black/60 opacity-100',
          )}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4 fill-white text-white drop-shadow-md" />
          ) : (
            <Play className="ml-0.5 h-4 w-4 fill-white text-white drop-shadow-md" />
          )}
        </button>
      )}
    </div>
  )
}
