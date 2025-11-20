import { useMemo, useState, useEffect } from 'react'

import { Check, Crown, MoreHorizontal, MoreVertical, Pause, Play, Plus } from 'lucide-react'
import ReactCountryFlag from 'react-country-flag'

import type { VoiceSample } from '@/entities/voice-sample/types'
import { env } from '@/shared/config/env'
import { cn } from '@/shared/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/Dropdown'
import { Spinner } from '@/shared/ui/Spinner'

const DEFAULT_AVATAR =
  'https://ui-avatars.com/api/?name=Voice&background=EEF2FF&color=1E1B4B&size=128'
const COUNTRY_DISPLAY_MAP: Record<string, { code: string; label: string }> = {
  ko: { code: 'KR', label: '한국' },
  kr: { code: 'KR', label: '한국' },
  en: { code: 'US', label: '영어권' },
  us: { code: 'US', label: '미국' },
  uk: { code: 'GB', label: '영국' },
  gb: { code: 'GB', label: '영국' },
  ja: { code: 'JP', label: '일본' },
  jp: { code: 'JP', label: '일본' },
  zh: { code: 'CN', label: '중국' },
  cn: { code: 'CN', label: '중국' },
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

interface VoiceSpotlightCardProps {
  sample: VoiceSample
  onAddToMyVoices?: () => void
  onRemoveFromMyVoices?: () => void
  isAdding?: boolean
  isRemoving?: boolean
  isInMyVoices?: boolean
  onPlay: (sample: VoiceSample) => void
  isPlaying: boolean
  isTableRow?: boolean
  onEdit?: () => void
  onDelete?: () => void
  isDeleting?: boolean
  isOwner?: boolean
}

export function VoiceSpotlightCard({
  sample,
  onAddToMyVoices,
  onRemoveFromMyVoices,
  isAdding = false,
  isRemoving = false,
  isInMyVoices = false,
  onPlay,
  isPlaying,
  isTableRow = false,
  onEdit,
  onDelete,
  isDeleting = false,
  isOwner = false,
}: VoiceSpotlightCardProps) {
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

  const languageLabel =
    (COUNTRY_DISPLAY_MAP[sample.country?.toLowerCase() ?? '']?.label ?? sample.country) ||
    '언어 미상'

  const displayName = sample.name || 'Unknown'
  const initials = displayName[0]?.toUpperCase() || 'V'

  /* 🔹 일레븐랩스 스타일: 리스트 row 용 */
  if (isTableRow) {
    return (
      <>
        {/* 1열: Voice 정보 */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-pink-500 to-orange-400 text-[10px] font-semibold text-white">
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
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <Spinner size="sm" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="truncate text-[12px] font-semibold text-foreground">{displayName}</div>
            {sample.description && (
              <div className="truncate text-[11px] text-muted">{sample.description}</div>
            )}
          </div>
        </div>

        {/* 2열: Language · Category (국기 포함) */}
        <div className="flex items-center gap-2 text-[11px] text-muted">
          {countryCode && (
            <ReactCountryFlag
              countryCode={countryCode}
              svg
              style={{ width: '1em', height: '1em' }}
            />
          )}
          <div className="flex flex-col">
            <span className="leading-tight">{languageLabel}</span>
            <span className="text-[10px] text-muted/70">Characters &amp; Animation</span>
          </div>
        </div>

        {/* 3열: 좋아요 수 + 버튼들 */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onPlay(sample)
            }}
            title={isPlaying ? '일시정지' : '재생'}
            className="rounded-full p-1 text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          {/* 오너인 경우 오너 아이콘 표시, 아닌 경우 add/remove 버튼 */}
          {isOwner ? (
            <div
              className="flex items-center gap-1 rounded-full px-2 py-1 text-xs text-primary"
              title="내가 만든 목소리"
            >
              <Crown className="h-4 w-4" />
              <span className="text-[10px] font-medium">Owner</span>
            </div>
          ) : (
            (onAddToMyVoices || onRemoveFromMyVoices) && (
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
                  'rounded-full p-1 transition-colors',
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
            )
          )}
          {/* 수정/삭제 드롭다운 메뉴 */}
          {onEdit || onDelete ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="rounded-full p-1 text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
                  onClick={(e) => e.stopPropagation()}
                  disabled={isDeleting}
                  title="더보기"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit()
                    }}
                  >
                    편집
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    className="text-danger"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete()
                    }}
                    disabled={isDeleting}
                  >
                    삭제
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button
              type="button"
              className="rounded-full p-1 text-muted transition-colors hover:bg-surface-2"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          )}
        </div>
      </>
    )
  }

  return (
    <div className="group flex items-center gap-3 rounded-xl border border-surface-3 bg-surface-1 p-3 shadow-sm transition-all hover:shadow-md">
      <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400">
        <img
          src={resolvedAvatar}
          onError={(event) => {
            event.currentTarget.src = DEFAULT_AVATAR
          }}
          alt={sample.name}
          className="h-full w-full object-cover"
        />
        {isProcessing ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Spinner size="sm" />
          </div>
        ) : (
          <button
            type="button"
            className={cn(
              'absolute inset-0 flex items-center justify-center transition-opacity',
              isPlaying
                ? 'bg-primary/80 opacity-100'
                : 'bg-black/50 opacity-0 group-hover:opacity-100',
            )}
            onClick={(e) => {
              e.stopPropagation()
              onPlay(sample)
            }}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5 text-white" />
            ) : (
              <Play className="h-5 w-5 text-white" />
            )}
          </button>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold">{sample.name}</h3>
            {sample.description && (
              <p className="line-clamp-1 text-sm text-muted">{sample.description}</p>
            )}
          </div>
          <div className="flex flex-col items-end justify-center gap-2">
            {!isProcessing && sample.audio_sample_url && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onPlay(sample)
                }}
                className="flex items-center justify-center rounded-full p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
                title={isPlaying ? '일시정지' : '재생'}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </button>
            )}
            {/* 오너인 경우 오너 아이콘 표시, 아닌 경우 add/remove 버튼 */}
            {isOwner ? (
              <div
                className="flex items-center gap-1 rounded-full px-2 py-1 text-xs text-primary"
                title="내가 만든 보이스"
              >
                <Crown className="h-4 w-4" />
                <span className="text-[10px] font-medium">Owner</span>
              </div>
            ) : (
              (onAddToMyVoices || onRemoveFromMyVoices) && (
                <button
                  type="button"
                  onClick={() => {
                    if (isInMyVoices && onRemoveFromMyVoices) {
                      onRemoveFromMyVoices()
                    } else if (!isInMyVoices && onAddToMyVoices) {
                      onAddToMyVoices()
                    }
                  }}
                  disabled={isAdding || isRemoving}
                  className={cn(
                    'flex items-center gap-1 rounded-full px-2 py-1 text-xs transition-colors',
                    isInMyVoices
                      ? 'text-primary hover:bg-surface-2'
                      : 'text-muted hover:bg-surface-2',
                    (isAdding || isRemoving) && 'cursor-not-allowed opacity-50',
                  )}
                  title={isInMyVoices ? '내 보이스에서 제거' : '내 보이스에 추가'}
                >
                  {isAdding || isRemoving ? (
                    <Spinner size="sm" />
                  ) : isInMyVoices ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  <span className="text-xs text-muted">{sample.addedCount ?? 0}명 추가</span>
                </button>
              )
            )}
          </div>
        </div>
        <div className="mt-1.5 flex items-center gap-3 text-xs">
          {countryCode && (
            <div className="flex items-center gap-1">
              <ReactCountryFlag
                countryCode={countryCode}
                svg
                style={{ width: '1em', height: '1em' }}
              />
              <span className="text-muted">
                {COUNTRY_DISPLAY_MAP[sample.country?.toLowerCase() ?? '']?.label ?? sample.country}
              </span>
            </div>
          )}
          <span className="text-muted">•</span>
          <span className="text-muted">캐릭터 & 애니메이션</span>
        </div>
      </div>
    </div>
  )
}
