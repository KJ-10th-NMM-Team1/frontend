import { useMemo, useState, useEffect, useCallback } from 'react'

import { Check, MoreVertical, Pause, Play, Plus } from 'lucide-react'
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

interface VoiceCardProps {
  sample: VoiceSample
  onPlay: (sample: VoiceSample) => void
  isPlaying: boolean
  showActions?: boolean
  onEdit?: (sample: VoiceSample) => void
  onDelete?: (sample: VoiceSample) => void
  isDeleting?: boolean
  onAddToMyVoices?: (sample: VoiceSample) => void
  onRemoveFromMyVoices?: (sample: VoiceSample) => void
  isAdding?: boolean
  isRemoving?: boolean
  isInMyVoices?: boolean
}

export function VoiceCard({
  sample,
  onPlay,
  isPlaying,
  showActions = false,
  onEdit,
  onDelete,
  isDeleting = false,
  onAddToMyVoices,
  onRemoveFromMyVoices,
  isAdding = false,
  isRemoving = false,
  isInMyVoices = false,
}: VoiceCardProps) {
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

  const handleCardClick = useCallback(() => {
    // TODO: 상세 페이지나 모달로 이동
    console.log('Card clicked:', sample.name)
  }, [sample])

  return (
    <div className="group relative flex gap-3 overflow-hidden rounded-2xl border border-surface-3 bg-surface-1 p-3 shadow-sm transition-all hover:shadow-md">
      {/* 카드 전체 클릭 가능한 오버레이 버튼 */}
      <button
        type="button"
        onClick={handleCardClick}
        aria-label={`${sample.name} - ${sample.description || ''} - ${sample.gender || ''}`}
        className="absolute inset-0 z-0 rounded-2xl text-left focus:outline-none focus-visible:ring-[1.5px] focus-visible:ring-inset focus-visible:ring-gray-950"
        data-group="voice-card"
        data-type="list-item-trigger-overlay"
      />
      <div className="relative z-10 h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400">
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
      <div className="relative z-10 flex min-w-0 flex-1 items-center justify-between gap-3">
        {/* 중앙 텍스트 정보 영역 */}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold">{sample.name}</h3>
          {sample.description && (
            <p className="line-clamp-1 text-xs text-muted">{sample.description}</p>
          )}
          <div className="mt-1 flex items-center gap-1.5">
            {countryCode && (
              <ReactCountryFlag
                countryCode={countryCode}
                svg
                style={{ width: '0.875em', height: '0.875em' }}
                title={sample.country ?? ''}
              />
            )}
            <span className="text-xs text-muted">
              {(COUNTRY_DISPLAY_MAP[sample.country?.toLowerCase() ?? '']?.label ??
                sample.country) ||
                '언어 미상'}
            </span>
          </div>
        </div>
        {/* 오른쪽 액션 아이콘 영역 */}
        <div className="relative z-20 flex items-center gap-2">
          {/* Add/Remove from my voices 버튼 */}
          {!showActions && (onAddToMyVoices || onRemoveFromMyVoices) && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                if (isInMyVoices && onRemoveFromMyVoices) {
                  onRemoveFromMyVoices(sample)
                } else if (!isInMyVoices && onAddToMyVoices) {
                  onAddToMyVoices(sample)
                }
              }}
              disabled={isAdding || isRemoving}
              title={isInMyVoices ? '내 보이스에서 제거' : '내 보이스에 추가'}
              className={cn(
                'flex items-center gap-1 rounded-full px-1.5 py-1 transition-colors',
                isInMyVoices
                  ? 'text-primary hover:bg-surface-2'
                  : 'text-muted hover:bg-surface-2 hover:text-foreground',
                (isAdding || isRemoving) && 'cursor-not-allowed opacity-50',
              )}
            >
              {isAdding || isRemoving ? (
                <Spinner size="sm" />
              ) : isInMyVoices ? (
                <>
                  <Check className="h-4 w-4" />
                  <span className="text-xs text-muted">{sample.addedCount ?? 0}명 추가</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span className="text-xs text-muted">{sample.addedCount ?? 0}명 추가</span>
                </>
              )}
            </button>
          )}
          {/* 재생 버튼 */}
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
          {/* 더보기 메뉴 */}
          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center justify-center rounded-full p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
                  onClick={(e) => e.stopPropagation()}
                  disabled={isDeleting}
                  title="더보기"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(sample)}>편집</DropdownMenuItem>
                <DropdownMenuItem
                  className="text-danger"
                  onClick={() => onDelete?.(sample)}
                  disabled={isDeleting}
                >
                  삭제
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  )
}
