import { useEffect, useMemo, useState } from 'react'

import { RotateCcw, RotateCw, Download, ChevronDown, Pause, Play } from 'lucide-react'

import type { VoiceSample } from '@/entities/voice-sample/types'
import { env } from '@/shared/config/env'
import { cn } from '@/shared/lib/utils'
import { getPresetAvatarUrl, DEFAULT_AVATAR } from '@/features/voice-samples/components/voiceSampleFieldUtils'

const getPresignedUrl = async (path: string): Promise<string | undefined> => {
  try {
    const apiBase = env.apiBaseUrl.startsWith('http')
      ? `${env.apiBaseUrl}/api`
      : env.apiBaseUrl || '/api'
    const pathSegments = path.split('/')
    const encodedPath = pathSegments.map((segment) => encodeURIComponent(segment)).join('/')
    const response = await fetch(`${apiBase}/storage/media/${encodedPath}`)
    if (!response.ok) {
      throw new Error(`Failed to get presigned URL: ${response.statusText}`)
    }
    const data = (await response.json()) as { url: string }
    return data.url
  } catch (error) {
    console.error('Presigned URL 가져오기 실패:', error)
    return undefined
  }
}

interface VoicePlayerBarProps {
  sample: VoiceSample
  isPlaying: boolean
  currentTime: number
  duration: number
  isLoading: boolean
  onPlayPause: () => void
  onSeek: (value: number) => void
  onSkip: (amount: number) => void
  onClose: () => void
}

const formatTime = (time: number) => {
  if (!Number.isFinite(time)) return '0:00'
  const mins = Math.floor(time / 60)
  const secs = Math.floor(time % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function VoicePlayerBar({
  sample,
  isPlaying,
  currentTime,
  duration,
  isLoading,
  onPlayPause,
  onSeek,
  onSkip,
  onClose,
}: VoicePlayerBarProps) {
  const [isClosing, setIsClosing] = useState(false)
  const [resolvedAvatar, setResolvedAvatar] = useState<string>(DEFAULT_AVATAR)

  useEffect(() => {
    let active = true

    // 우선순위: avatarImagePath > avatarImageUrl > avatarPreset > 기본 아바타
    const resolveAvatar = async () => {
      // 1. avatarImagePath가 있으면 presigned URL 가져오기
      if (sample.avatarImagePath && !sample.avatarImagePath.startsWith('http')) {
        const url = await getPresignedUrl(sample.avatarImagePath)
        if (url && active) {
          setResolvedAvatar(url)
          return
        }
      }

      // 2. avatarImageUrl이 http로 시작하면 그대로 사용
      if (sample.avatarImageUrl && sample.avatarImageUrl.startsWith('http') && active) {
        setResolvedAvatar(sample.avatarImageUrl)
        return
      }

      // 3. avatarPreset이 있으면 프리셋 URL 사용
      if (sample.avatarPreset && active) {
        const presetUrl = getPresetAvatarUrl(sample.avatarPreset)
        if (presetUrl) {
          setResolvedAvatar(presetUrl)
          return
        }
      }

      // 4. 기본 아바타
      if (active) {
        setResolvedAvatar(DEFAULT_AVATAR)
      }
    }

    void resolveAvatar()

    return () => {
      active = false
    }
  }, [sample.avatarImagePath, sample.avatarImageUrl, sample.avatarPreset])

  useEffect(() => {
    if (!sample) return
    // 새 샘플이 오면 닫힘 상태 초기화
    setIsClosing(false)
  }, [sample])

  const handleCloseClick = () => {
    setIsClosing(true)
    window.setTimeout(onClose, 220) // transition 시간 이후 언마운트
  }

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-30 border-t border-surface-3 bg-surface-1/95 backdrop-blur supports-[backdrop-filter]:bg-surface-1/80',
        'transform transition-transform duration-200 ease-in-out',
        isClosing ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100',
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <div className="flex min-w-0 max-w-[32%] items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-500 to-sky-400 text-xs font-semibold text-white">
            {resolvedAvatar ? (
              <img
                src={resolvedAvatar}
                onError={(event) => {
                  event.currentTarget.style.display = 'none'
                }}
                alt={sample.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span>{sample.name?.[0] ?? 'V'}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-foreground truncate">{sample.name}</div>
            {sample.description && (
              <div className="text-xs text-muted truncate">{sample.description}</div>
            )}
          </div>
        </div>
        <div className="flex flex-1 flex-col items-center gap-2">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="rounded-full p-2 text-muted hover:bg-surface-2 hover:text-foreground disabled:opacity-50"
              onClick={() => onSkip(-10)}
              disabled={isLoading}
              title="10초 뒤로"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
            <button
              type="button"
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full border transition-all disabled:opacity-60',
                isPlaying
                  ? 'border-secondary/40 bg-secondary/15 text-secondary'
                  : 'border-secondary/30 bg-secondary/10 text-secondary/80 hover:border-secondary/40 hover:text-secondary',
              )}
              onClick={onPlayPause}
              disabled={isLoading}
              title={isPlaying ? '일시정지' : '재생'}
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>
            <button
              type="button"
              className="rounded-full p-2 text-muted hover:bg-surface-2 hover:text-foreground disabled:opacity-50"
              onClick={() => onSkip(10)}
              disabled={isLoading}
              title="10초 앞으로"
            >
              <RotateCw className="h-5 w-5" />
            </button>
          </div>
          <div className="flex w-full items-center gap-3 text-xs text-muted">
            <span className="w-10 text-right tabular-nums">{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={Math.min(currentTime, duration || currentTime || 0)}
              onChange={(e) => onSeek(Number(e.target.value))}
              disabled={isLoading}
              className="h-1 flex-1 cursor-pointer accent-primary"
            />
            <span className="w-10 tabular-nums">{formatTime(duration || currentTime)}</span>
          </div>
          {isLoading && (
            <div className="mt-1 text-[11px] font-medium text-muted">오디오를 준비 중입니다...</div>
          )}
        </div>
        <div className="flex items-center gap-2 text-muted">
          <button
            type="button"
            className={cn('rounded-full p-2 hover:bg-surface-2 hover:text-foreground')}
            title="닫기"
            onClick={handleCloseClick}
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
