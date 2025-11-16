import { useMemo, useState, useEffect, useRef, useCallback } from 'react'

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Heart, Pause, Play, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import type { VoiceSample, VoiceSamplesResponse } from '@/entities/voice-sample/types'
import { fetchVoiceSamples, toggleFavorite } from '@/features/voice-samples/api/voiceSamplesApi'
import { env } from '@/shared/config/env'
import { routes } from '@/shared/config/routes'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/Select'

type LibraryTab = 'library' | 'mine' | 'favorites'

const EMPTY_SAMPLES: VoiceSample[] = []
const DEFAULT_AVATAR =
  'https://ui-avatars.com/api/?name=Voice&background=EEF2FF&color=1E1B4B&size=128'

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

export default function VoiceLibraryPage() {
  const [tab, setTab] = useState<LibraryTab>('library')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<'default' | 'favorite'>('default')
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playingSampleId, setPlayingSampleId] = useState<string | null>(null)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const queryKey = useMemo(() => ['voice-library', tab, search] as const, [tab, search])
  const voiceQuery = useQuery<
    VoiceSamplesResponse,
    Error,
    VoiceSamplesResponse,
    readonly [string, LibraryTab, string]
  >({
    queryKey,
    queryFn: () =>
      fetchVoiceSamples({
        q: search.trim() || undefined,
        favoritesOnly: tab === 'favorites',
        mySamplesOnly: tab === 'mine',
      }),
    placeholderData: keepPreviousData,
  })

  const favoriteMutation = useMutation<
    VoiceSample,
    Error,
    {
      sample: VoiceSample
      next: boolean
    }
  >({
    mutationFn: ({ sample, next }) => toggleFavorite(sample.id, next),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey })
    },
  })
  const mutateFavorite = favoriteMutation.mutate
  const isFavoriteLoading = Boolean(favoriteMutation.isPending)

  const cleanupAudio = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.pause()
    audio.currentTime = 0
    audio.src = ''
    audio.load()
    audioRef.current = null
  }, [])

  const stopPlayback = useCallback(() => {
    cleanupAudio()
    setPlayingSampleId(null)
  }, [cleanupAudio])

  useEffect(() => {
    return () => {
      stopPlayback()
    }
  }, [stopPlayback])

  const resolveSampleAudioUrl = useCallback(async (sample: VoiceSample) => {
    const storageSegment = '/storage/media/'
    if (sample.audio_sample_url) {
      if (sample.audio_sample_url.includes(storageSegment)) {
        const path = sample.audio_sample_url.split(storageSegment).pop()
        if (path) {
          return getPresignedUrl(path)
        }
      } else {
        return sample.audio_sample_url
      }
    }
    if (sample.file_path_wav) {
      return getPresignedUrl(sample.file_path_wav)
    }
    if (sample.previewUrl) {
      return sample.previewUrl
    }
    return undefined
  }, [])

  const handlePlaySample = useCallback(
    async (sample: VoiceSample) => {
      const sampleId = sample.id
      if (!sampleId) return

      if (playingSampleId === sampleId) {
        stopPlayback()
        return
      }

      stopPlayback()

      const audioUrl = await resolveSampleAudioUrl(sample)
      if (!audioUrl) {
        console.warn('재생 가능한 오디오 URL을 찾지 못했습니다.', sample)
        return
      }

      const audio = new Audio(audioUrl)
      audioRef.current = audio
      setPlayingSampleId(sampleId)

      audio.addEventListener('ended', () => {
        stopPlayback()
      })

      audio.play().catch((error) => {
        console.error('음성 재생 실패:', error)
        stopPlayback()
      })
    },
    [playingSampleId, resolveSampleAudioUrl, stopPlayback],
  )

  const samples = voiceQuery.data?.samples ?? EMPTY_SAMPLES
  const sortedSamples = useMemo(() => {
    if (sort === 'favorite') {
      return [...samples].sort(
        (a, b) => (b.favoriteCount ?? 0) - (a.favoriteCount ?? 0),
      )
    }
    return samples
  }, [samples, sort])

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-primary text-xs font-semibold uppercase tracking-[0.3em]">
            Voice Library
          </p>
          <p className="text-muted text-sm">등록된 보이스 클론을 찾아보고, 즐겨찾기에 추가해보세요.</p>
        </div>
        <Button variant="primary" onClick={() => navigate(routes.voiceCloning)}>
          보이스 클로닝 시작
        </Button>
      </div>

      <div className="space-y-3">
        <div>
          {tabButton('library', '라이브러리', tab, setTab)}
          {tabButton('mine', '내 보이스', tab, setTab)}
          {tabButton('favorites', '즐겨찾기', tab, setTab)}
        </div>
        <div className="flex flex-1 min-w-[240px] items-center gap-3 rounded-3xl border border-surface-3 bg-surface-1/70 px-4 py-3 shadow-soft">
          <div className="relative flex-1">
            <Search className="text-muted absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="보이스 검색"
              className="pl-9"
            />
          </div>
          <Select value={sort} onValueChange={(value) => setSort(value as 'default' | 'favorite')}>
            <SelectTrigger className="w-36 rounded-full border-surface-3 bg-surface-1 text-sm shadow-soft">
              <SelectValue placeholder="정렬" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="default">기본</SelectItem>
              <SelectItem value="favorite">좋아요순</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-0 rounded-3xl border border-surface-2 bg-surface-1 p-4 shadow-soft">
        {voiceQuery.isLoading ? (
          <p className="text-center text-muted text-sm">목록을 불러오는 중...</p>
        ) : sortedSamples.length === 0 ? (
          <p className="text-center text-muted text-sm">조건에 맞는 보이스가 없습니다.</p>
        ) : (
          <>
            <div className="text-muted mb-1 grid grid-cols-[minmax(0,2.5fr)_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] gap-4 text-xs font-semibold uppercase tracking-[0.2em]">
              <span className="flex min-h-[1.5rem] items-start truncate">이름</span>
              <span className="flex min-h-[1.5rem] items-start">국가</span>
              <span className="flex min-h-[1.5rem] items-start">성별</span>
              <span className="inline-flex min-h-[1.5rem] w-[74px] items-start justify-center">즐겨찾기</span>
              <span className="flex min-h-[1.5rem] items-start justify-end text-right">미리듣기</span>
            </div>
            <ul className="divide-y divide-surface-3">
              {sortedSamples.map((sample) => (
                <VoiceLibraryRow
                  key={sample.id}
                  sample={sample}
                  onToggleFavorite={() =>
                    mutateFavorite({
                      sample,
                      next: !sample.isFavorite,
                    })
                  }
                  toggling={isFavoriteLoading}
                  onPlay={handlePlaySample}
                  isPlaying={playingSampleId === sample.id}
                />
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}

function tabButton(
  value: LibraryTab,
  label: string,
  current: LibraryTab,
  setTab: (tab: LibraryTab) => void,
) {
  const isActive = current === value
  return (
    <button
      type="button"
      onClick={() => setTab(value)}
      className={`rounded-2xl px-5 py-2 text-sm font-semibold transition ${
        isActive
          ? 'bg-primary text-primary-foreground shadow'
          : 'bg-transparent text-muted hover:bg-surface-2 hover:text-foreground'
      }`}
    >
      {label}
    </button>
  )
}
function VoiceLibraryRow({
  sample,
  onToggleFavorite,
  toggling,
  onPlay,
  isPlaying,
}: {
  sample: VoiceSample
  onToggleFavorite: () => void
  toggling: boolean
  onPlay: (sample: VoiceSample) => void | Promise<void>
  isPlaying: boolean
}) {
  const [resolvedAvatar, setResolvedAvatar] = useState<string>(
    sample.avatarImageUrl && sample.avatarImageUrl.startsWith('http')
      ? sample.avatarImageUrl
      : DEFAULT_AVATAR,
  )

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

  return (
    <li className="grid grid-cols-[minmax(0,2.5fr)_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] items-center gap-4 py-4 text-sm">
      <div className="flex items-center gap-3 overflow-hidden">
        <img
          src={resolvedAvatar}
          onError={(event) => {
            event.currentTarget.src = DEFAULT_AVATAR
          }}
          alt={sample.name}
          className="h-12 w-12 rounded-full object-cover flex-shrink-0"
        />
        <div className="min-w-0">
          <p className="font-semibold text-base">{sample.name}</p>
          {sample.description ? (
            <p className="text-muted text-xs truncate">{sample.description}</p>
          ) : null}
        </div>
      </div>
      <p className="text-muted">{sample.country ?? '국적 미상'}</p>
      <p className="text-muted">{sample.gender ?? '성별 미상'}</p>
      <button
        type="button"
        onClick={onToggleFavorite}
        disabled={toggling}
        className="inline-flex h-8 w-[74px] shrink-0 items-center justify-center gap-1 rounded-full border border-surface-3 px-1.5 text-xs font-medium"
      >
        <Heart className={`h-4 w-4 ${sample.isFavorite ? 'text-danger fill-danger/20' : 'text-muted'}`} />
        {sample.favoriteCount ?? 0}
      </button>
      <div className="flex justify-end">
        <Button
          type="button"
          variant={isPlaying ? 'secondary' : 'outline'}
          className="flex h-9 w-9 items-center justify-center rounded-full p-0"
          onClick={() => onPlay(sample)}
          disabled={!sample.audio_sample_url && !sample.file_path_wav && !sample.previewUrl}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
      </div>
    </li>
  )
}
