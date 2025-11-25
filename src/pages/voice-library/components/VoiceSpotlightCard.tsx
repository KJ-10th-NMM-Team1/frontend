import { useMemo, useState, useEffect } from 'react'

import { Check, Crown, MoreHorizontal, MoreVertical, Pause, Play, Plus } from 'lucide-react'
import ReactCountryFlag from 'react-country-flag'

import type { VoiceSample } from '@/entities/voice-sample/types'
import { env } from '@/shared/config/env'
import { cn } from '@/shared/lib/utils'
import { VOICE_CATEGORY_MAP } from '@/shared/constants/voiceCategories'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/Dropdown'
import { Spinner } from '@/shared/ui/Spinner'
import {
  DEFAULT_AVATAR,
  getPresetAvatarUrl,
} from '@/features/voice-samples/components/voiceSampleFieldUtils'

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

const COUNTRY_DISPLAY_MAP: Record<string, { code: string; label: string }> = {
  ko: { code: 'KR', label: '한국어' },
  kr: { code: 'KR', label: '한국어' },
  en: { code: 'US', label: '영어' },
  us: { code: 'US', label: '영어(미국)' },
  uk: { code: 'GB', label: '영어(영국)' },
  gb: { code: 'GB', label: '영어(영국)' },
  ja: { code: 'JP', label: '일본어' },
  jp: { code: 'JP', label: '일본어' },
  zh: { code: 'CN', label: '중국어' },
  cn: { code: 'CN', label: '중국어' },
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
    getPresetAvatarUrl(sample.avatarPreset || 'default') ?? DEFAULT_AVATAR,
  )
  const isProcessing = !sample.audio_sample_url
  const isCommercialAllowed = sample.canCommercialUse !== false
  const isPublicVoice = sample.isPublic !== false
  const addDisabled =
    isOwner || !isCommercialAllowed || !isPublicVoice || isInMyVoices || isAdding || isRemoving
  const addDisabledReason = isInMyVoices
    ? '이미 내 목소리에 있습니다.'
    : !isPublicVoice
      ? '비공개 보이스는 추가할 수 없습니다.'
      : !isCommercialAllowed
        ? '비상업용 보이스는 추가할 수 없습니다.'
        : undefined

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
  const categories = sample.category ?? []
  const categoryText = categories
    .map((cat) => VOICE_CATEGORY_MAP[cat as keyof typeof VOICE_CATEGORY_MAP] ?? cat)
    .filter(Boolean)
    .join(', ')
  const formatUserCount = (count?: number) => {
    const safeCount = count ?? 0
    if (safeCount >= 10000) {
      const formatted = (safeCount / 10000).toFixed(1).replace(/\.0$/, '')
      return `약 ${formatted}만명`
    }
    if (safeCount >= 1000) {
      const formatted = (safeCount / 1000).toFixed(1).replace(/\.0$/, '')
      return `약 ${formatted}천명`
    }
    return `${safeCount}명`
  }
  const licenseBadgeLabel = sample.canCommercialUse === false ? '비상업 전용' : '상업 사용 가능'
  const licenseBadgeClass =
    sample.canCommercialUse === false ? 'bg-warning/20 text-warning' : 'bg-primary/10 text-primary'

  /* 🔹 일레븐랩스 스타일: 리스트 row 용 */
  if (isTableRow) {
    return (
      <div
        className="contents cursor-pointer"
        onClick={() => {
          if (isProcessing) return
          onPlay(sample)
        }}
      >
        {/* 1열: Voice 정보 */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-pink-500 to-orange-400 text-[10px] font-semibold text-white">
            {resolvedAvatar ? (
              <img
                src={resolvedAvatar}
                onError={(event) => {
                  event.currentTarget.src = DEFAULT_AVATAR
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
            <div className="truncate text-sm font-semibold text-foreground">{displayName}</div>
            {sample.description && (
              <div className="truncate text-xs text-muted">{sample.description}</div>
            )}
          </div>
        </div>

        {/* 2열: Language */}
        <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
          {countryCode && (
            <ReactCountryFlag
              countryCode={countryCode}
              svg
              style={{ width: '1em', height: '1em' }}
            />
          )}
          <div className="flex flex-col leading-tight">
            <span className="leading-tight">{languageLabel}</span>
          </div>
        </div>

        {/* 3열: 카테고리 */}
        <div className="min-w-0 text-[13px] text-muted-foreground">
          {categoryText ? (
            <span className="block truncate" title={categoryText}>
              {categoryText}
            </span>
          ) : (
            <span className="text-[11px] text-muted-foreground">카테고리 없음</span>
          )}
        </div>

        {/* 4열: 태그 */}
        <div className="flex max-h-10 flex-wrap items-center gap-2 overflow-hidden text-[12px] text-muted-foreground">
          <span
            className={cn(
              'whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold',
              licenseBadgeClass,
            )}
          >
            {licenseBadgeLabel}
          </span>
          {sample.tags?.length ? (
            sample.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="whitespace-nowrap rounded-full bg-surface-2 px-2 py-0.5 text-[11px] text-foreground"
              >
                #{tag}
              </span>
            ))
          ) : (
            <span className="text-[11px] text-muted-foreground">태그 없음</span>
          )}
        </div>

        {/* 5열: 사용 수 */}
        <div className="text-right text-[12px] text-muted-foreground">
          {`${formatUserCount(sample.addedCount)} 사용`}
        </div>

        {/* 6열: 좋아요 수 + 버튼들 */}
        <div className="flex w-full min-w-[120px] max-w-[200px] items-center justify-end gap-3">
          {/* 오너인 경우 오너 아이콘 표시, 아닌 경우 add/remove 버튼 */}
          {isOwner ? (
            <div
              className="flex items-center gap-1 rounded-full px-2 py-1 text-xs text-primary"
              title="내가 만든 목소리"
            >
              <Crown className="h-4 w-4" />
              <span className="text-[11px] font-medium">소유자</span>
            </div>
          ) : (
            (onAddToMyVoices || onRemoveFromMyVoices) && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  if (addDisabled) return
                  if (isInMyVoices && onRemoveFromMyVoices) {
                    onRemoveFromMyVoices()
                  } else if (!isInMyVoices && onAddToMyVoices) {
                    onAddToMyVoices()
                  }
                }}
                disabled={addDisabled}
                title={
                  addDisabledReason ?? (isInMyVoices ? '내 목소리에서 제거' : '내 목소리에 추가')
                }
                className={cn(
                  'rounded-full p-1 transition-colors',
                  isInMyVoices
                    ? 'text-primary hover:bg-surface-2'
                    : 'text-muted hover:bg-surface-2 hover:text-foreground',
                  addDisabled && 'cursor-not-allowed opacity-50',
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
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                  }}
                  disabled={isDeleting}
                  title="더보기"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
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
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-2 text-muted-foreground shadow-inner transition hover:bg-surface-3 hover:text-foreground"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      className="group flex cursor-pointer items-center gap-3 rounded-xl border border-surface-3 bg-surface-1 p-3 shadow-sm transition-all hover:shadow-md"
      onClick={() => {
        if (isProcessing) return
        onPlay(sample)
      }}
    >
      <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400">
        <img
          src={resolvedAvatar ?? DEFAULT_AVATAR}
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
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold">{sample.name}</h3>
            {sample.description && (
              <p className="line-clamp-1 text-sm font-medium text-muted-foreground">
                {sample.description}
              </p>
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
                title="내가 만든 목소리"
              >
                <Crown className="h-4 w-4" />
                <span className="text-[10px] font-medium">Owner</span>
              </div>
            ) : (
              (onAddToMyVoices || onRemoveFromMyVoices) && (
                <button
                  type="button"
                  onClick={() => {
                    if (addDisabled) return
                    if (isInMyVoices && onRemoveFromMyVoices) {
                      onRemoveFromMyVoices()
                    } else if (!isInMyVoices && onAddToMyVoices) {
                      onAddToMyVoices()
                    }
                  }}
                  disabled={addDisabled}
                  className={cn(
                    'flex items-center gap-1 rounded-full px-2 py-1 text-xs transition-colors',
                    isInMyVoices
                      ? 'text-primary hover:bg-surface-2'
                      : 'text-muted hover:bg-surface-2',
                    addDisabled && 'cursor-not-allowed opacity-50',
                  )}
                  title={
                    addDisabledReason ?? (isInMyVoices ? '내 목소리에서 제거' : '내 목소리에 추가')
                  }
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
          <div className="flex items-center gap-1">
            {countryCode && (
              <ReactCountryFlag
                countryCode={countryCode}
                svg
                style={{ width: '1em', height: '1em' }}
              />
            )}
            <span className="text-muted">
              {COUNTRY_DISPLAY_MAP[sample.country?.toLowerCase() ?? '']?.label ?? sample.country}
            </span>
          </div>
          <span className="text-muted">•</span>
          <span className="text-muted">캐릭터 & 애니메이션</span>
          {sample.tags?.length ? (
            <div className="flex flex-wrap gap-1">
              {sample.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] text-muted"
                >
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
