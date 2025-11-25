import { useMemo, useState, useEffect } from 'react'

import { Check, Pause, Play, Plus } from 'lucide-react'
import ReactCountryFlag from 'react-country-flag'

import type { VoiceSample } from '@/entities/voice-sample/types'
import { env } from '@/shared/config/env'
import { cn } from '@/shared/lib/utils'
import { Spinner } from '@/shared/ui/Spinner'
import { VOICE_CATEGORY_MAP } from '@/shared/constants/voiceCategories'
import { DEFAULT_AVATAR, getPresetAvatarUrl } from '@/features/voice-samples/components/voiceSampleFieldUtils'

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
  jp: { code: 'JP', label: '일본어' },
  es: { code: 'ES', label: '스페인어' },
  fr: { code: 'FR', label: '프랑스어' },
}

interface VoiceHighlightChipProps {
  sample: VoiceSample
  onPlay: (sample: VoiceSample) => void
  isPlaying: boolean
  onAddToMyVoices?: () => void
  onRemoveFromMyVoices?: () => void
  isAdding?: boolean
  isRemoving?: boolean
  isInMyVoices?: boolean
  isOwner?: boolean
}

export function VoiceHighlightChip({
  sample,
  onPlay,
  isPlaying,
  onAddToMyVoices,
  onRemoveFromMyVoices,
  isAdding = false,
  isRemoving = false,
  isInMyVoices = false,
  isOwner = false,
}: VoiceHighlightChipProps) {
  const [resolvedAvatar, setResolvedAvatar] = useState<string>(
    getPresetAvatarUrl(sample.avatarPreset || 'default') ?? DEFAULT_AVATAR,
  )
  const hasAudioUrl = Boolean(sample.audio_sample_url)
  const isProcessing = !hasAudioUrl

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
    sample.canCommercialUse === false
      ? 'bg-warning/20 text-warning'
      : 'bg-primary/10 text-primary'
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
        if (isProcessing) return
        onPlay(sample)
      }}
      className={cn(
        // ElevenLabs 스타일: 작은 카드 / 라운드 / 은은한 그림자
        'group flex items-center gap-3 rounded-3xl',
        'bg-surface-1 px-3 py-3 shadow-sm',
        'border border-outline/40',
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
          <div className="absolute inset-0 flex items-center justify-center bg-black/45">
            <Spinner size="sm" />
          </div>
        )}
      </div>

        {/* 텍스트 영역 */}
        <div className="min-w-0 flex-1 text-left">
          {/* 이름 + 라이선스 뱃지 */}
          <div className="flex items-start gap-2">
            <div className="truncate text-sm font-semibold text-foreground">{displayName}</div>
            <span
              className={cn(
                'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold shadow-sm',
                licenseBadgeClass,
              )}
            >
              {licenseBadgeLabel}
            </span>
          </div>
          {/* 두 번째 줄: 언어/국기 및 사용 수 */}
          <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
            {countryCode && (
              <ReactCountryFlag
                countryCode={countryCode}
                svg
                style={{ width: '0.8em', height: '0.8em' }}
              />
            )}
            <span className="truncate">
              {(COUNTRY_DISPLAY_MAP[sample.country?.toLowerCase() ?? '']?.label ??
                sample.country) ||
                '언어 미상'}
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="truncate text-foreground">{`${formatUserCount(sample.addedCount)} 사용`}</span>
          </div>          
          {/* 세 번째 줄: 카테고리 + 태그 한 줄 */}
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
            <span className="rounded-full bg-surface-2 px-2 py-0.5 text-foreground">
              {sample.category?.length
                ? VOICE_CATEGORY_MAP[sample.category[0] as keyof typeof VOICE_CATEGORY_MAP] ??
                  sample.category[0]
                : '카테고리 미지정'}
            </span>
            {sample.tags?.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] text-foreground"
              >
                #{tag}
              </span>
            ))}
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
            className={cn(
              'flex-shrink-0 rounded-full p-1.5 transition-colors',
              isPlaying
                ? 'border border-secondary/40 bg-secondary/15 text-secondary'
                : 'text-secondary/80 hover:border hover:border-secondary/30 hover:bg-secondary/10 hover:text-secondary',
            )}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
        )}
        {/* + 버튼 */}
        {!isOwner && (onAddToMyVoices || onRemoveFromMyVoices) && (
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
              'flex-shrink-0 rounded-full p-1.5 transition-colors',
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
        )}
      </div>
    </button>
  )
}
