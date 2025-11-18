import { useMemo, useState, useEffect } from 'react'

import { Check, Pause, Play, Plus } from 'lucide-react'
import ReactCountryFlag from 'react-country-flag'

import type { VoiceSample } from '@/entities/voice-sample/types'
import { env } from '@/shared/config/env'
import { cn } from '@/shared/lib/utils'
import { Spinner } from '@/shared/ui/Spinner'

const DEFAULT_AVATAR =
  'https://ui-avatars.com/api/?name=Voice&background=EEF2FF&color=1E1B4B&size=128'
const COUNTRY_DISPLAY_MAP: Record<string, { code: string; label: string }> = {
  ko: { code: 'KR', label: 'Korean' },
  en: { code: 'US', label: 'English' },
  jp: { code: 'JP', label: 'Japanese' },
  es: { code: 'ES', label: 'Spanish' },
  fr: { code: 'FR', label: 'French' },
}

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

interface TrendingVoiceChipProps {
  sample: VoiceSample
  onPlay: (sample: VoiceSample) => void
  isPlaying: boolean
  onAddToMyVoices?: () => void
  onRemoveFromMyVoices?: () => void
  isAdding?: boolean
  isRemoving?: boolean
  isInMyVoices?: boolean
}

export function TrendingVoiceChip({
  sample,
  onPlay,
  isPlaying,
  onAddToMyVoices,
  onRemoveFromMyVoices,
  isAdding = false,
  isRemoving = false,
  isInMyVoices = false,
}: TrendingVoiceChipProps) {
  const [resolvedAvatar, setResolvedAvatar] = useState<string>(
    sample.avatarImageUrl && sample.avatarImageUrl.startsWith('http')
      ? sample.avatarImageUrl
      : DEFAULT_AVATAR,
  )
  const isProcessing = !sample.audio_sample_url

  useEffect(() => {
    let active = true
    const path = sample.avatarImagePath
    if (path && !path.startsWith('http')) {
      void getPresignedUrl(path).then((url) => {
        if (url && active) {
          setResolvedAvatar(url)
        }
      })
    } else if (sample.avatarImageUrl && sample.avatarImageUrl.startsWith('http')) {
      setResolvedAvatar(sample.avatarImageUrl)
    } else {
      setResolvedAvatar(DEFAULT_AVATAR)
    }
    return () => {
      active = false
    }
  }, [sample.avatarImagePath, sample.avatarImageUrl])

  const countryCode = useMemo(() => {
    if (!sample.country) return undefined
    const normalized = sample.country.trim().toLowerCase()
    const mapped = COUNTRY_DISPLAY_MAP[normalized]
    if (mapped) return mapped.code
    if (sample.country.length === 2) {
      return sample.country.toUpperCase()
    }
    return undefined
  }, [sample.country])

  const displayName = sample.name || 'Unknown'
  const initials = displayName[0]?.toUpperCase() || 'V'

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        if (!isProcessing && sample.audio_sample_url) {
          onPlay(sample)
        }
        // TODO: 필요하면 여기서 상세 페이지로 이동 로직 추가
      }}
      className={cn(
        // ElevenLabs 스타일: 작은 카드 / 라운드 / 은은한 그림자
        'group flex items-center gap-3 rounded-3xl',
        'bg-surface-1 px-3 py-3 shadow-sm',
        'border border-surface-3/40',
        'transition-all hover:-translate-y-[1px] hover:shadow-md',
      )}
    >
      {/* 아바타 */}
      <div
        className={cn(
          'relative flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-full',
          'bg-gradient-to-br from-indigo-500 to-sky-400 text-sm font-semibold text-white',
        )}
      >
        {resolvedAvatar && resolvedAvatar !== DEFAULT_AVATAR ? (
          <img
            src={resolvedAvatar}
            onError={(event) => {
              event.currentTarget.style.display = 'none'
            }}
            alt={sample.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/45">
            <Spinner size="sm" />
          </div>
        )}
      </div>

      {/* 텍스트 영역 */}
      <div className="min-w-0 flex-1 text-left">
        {/* 이름 */}
        <div className="truncate text-sm font-semibold text-foreground">{displayName}</div>
        {/* 두 번째 줄: 보이스 타입/설명 (없으면 안 그려짐) */}
        {sample.description && (
          <div className="truncate text-[11px] text-muted">{sample.description}</div>
        )}
        {/* 세 번째 줄: 언어/국기 */}
        <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted">
          {countryCode && (
            <ReactCountryFlag
              countryCode={countryCode}
              svg
              style={{ width: '0.8em', height: '0.8em' }}
            />
          )}
          <span className="truncate">
            {(COUNTRY_DISPLAY_MAP[sample.country?.toLowerCase() ?? '']?.label ?? sample.country) ||
              '언어 미상'}
          </span>
        </div>
      </div>

      {/* 액션 버튼들 */}
      <div className="flex items-center gap-1">
        {/* 재생 버튼 */}
        {!isProcessing && sample.audio_sample_url && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onPlay(sample)
            }}
            title={isPlaying ? '일시정지' : '재생'}
            className="flex-shrink-0 rounded-full p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
        )}
        {/* + 버튼 */}
        {(onAddToMyVoices || onRemoveFromMyVoices) && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              if (isInMyVoices && onRemoveFromMyVoices) {
                onRemoveFromMyVoices()
              } else if (!isInMyVoices && onAddToMyVoices) {
                onAddToMyVoices()
              }
            }}
            disabled={isAdding || isRemoving}
            title={isInMyVoices ? '내 보이스에서 제거' : '내 보이스에 추가'}
            className={cn(
              'flex-shrink-0 rounded-full p-1.5 transition-colors',
              isInMyVoices
                ? 'text-primary hover:bg-surface-2'
                : 'text-muted hover:bg-surface-2 hover:text-foreground',
              (isAdding || isRemoving) && 'cursor-not-allowed opacity-50',
            )}
          >
            {isAdding || isRemoving ? (
              <Spinner size="sm" />
            ) : isInMyVoices ? (
              <Check className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
    </button>
  )
}
