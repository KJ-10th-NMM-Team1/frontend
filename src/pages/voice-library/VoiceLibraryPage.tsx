import { useMemo, useState, useEffect } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Heart, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { env } from '@/shared/config/env'

import type { VoiceSample } from '@/entities/voice-sample/types'
import { fetchVoiceSamples, toggleFavorite } from '@/features/voice-samples/api/voiceSamplesApi'
import { routes } from '@/shared/config/routes'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'

type LibraryTab = 'library' | 'mine' | 'favorites'

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
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const queryKey = useMemo(() => ['voice-library', tab, search], [tab, search])
  const voiceQuery = useQuery({
    queryKey,
    queryFn: () =>
      fetchVoiceSamples({
        q: search.trim() || undefined,
        favoritesOnly: tab === 'favorites',
        mySamplesOnly: tab === 'mine',
      }),
    keepPreviousData: true,
  })

  const favoriteMutation = useMutation({
    mutationFn: ({ sample, next }: { sample: VoiceSample; next: boolean }) =>
      toggleFavorite(sample.id, next),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey })
    },
  })

  const samples = voiceQuery.data?.samples ?? []

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-primary text-xs font-semibold uppercase tracking-[0.3em]">
            Voice Library
          </p>
          <h1 className="text-3xl font-bold">보이스 라이브러리</h1>
          <p className="text-muted text-sm">등록된 보이스 클론을 찾아보고, 즐겨찾기에 추가해보세요.</p>
        </div>
        <Button variant="primary" onClick={() => navigate(routes.voiceCloning)}>
          보이스 클로닝 시작
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-4 rounded-3xl border border-surface-3 bg-surface-1/70 px-4 py-3 shadow-soft">
        <div className="flex gap-2">
          {tabButton('library', '라이브러리', tab, setTab)}
          {tabButton('mine', '내 보이스', tab, setTab)}
          {tabButton('favorites', '즐겨찾기', tab, setTab)}
        </div>
        <div className="relative flex-1 min-w-[220px]">
          <Search className="text-muted absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="보이스 검색"
            className="pl-9"
          />
        </div>
      </div>

      <div className="rounded-3xl border border-surface-2 bg-surface-1 p-4 shadow-soft">
        {voiceQuery.isLoading ? (
          <p className="text-center text-muted text-sm">목록을 불러오는 중...</p>
        ) : samples.length === 0 ? (
          <p className="text-center text-muted text-sm">조건에 맞는 보이스가 없습니다.</p>
        ) : (
          <>
            <div className="text-muted mb-2 grid grid-cols-[260px,150px,150px,120px,130px] text-xs font-semibold uppercase tracking-[0.2em]">
              <span>이름</span>
              <span>국가</span>
              <span>성별</span>
              <span>즐겨찾기</span>
              <span className="text-right">미리듣기</span>
            </div>
            <ul className="divide-y divide-surface-3">
            {samples.map((sample) => (
              <VoiceLibraryRow
                key={sample.id}
                sample={sample}
                onToggleFavorite={() =>
                  favoriteMutation.mutate({
                    sample,
                    next: !sample.isFavorite,
                  })
                }
                toggling={favoriteMutation.isLoading}
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
      className={`rounded-full px-4 py-2 text-sm font-medium ${
        isActive ? 'bg-primary text-primary-foreground' : 'bg-surface-2 text-muted'
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
}: {
  sample: VoiceSample
  onToggleFavorite: () => void
  toggling: boolean
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
    <li className="grid grid-cols-[260px,150px,150px,120px,130px] items-center gap-4 py-4 text-sm">
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
        className="inline-flex items-center gap-1 rounded-full border border-surface-3 px-3 py-1 text-xs font-medium"
      >
        <Heart className={`h-4 w-4 ${sample.isFavorite ? 'text-danger fill-danger/20' : 'text-muted'}`} />
        {sample.favoriteCount ?? 0}
      </button>
      <div className="text-right">
        <Button
          type="button"
          variant="secondary"
          className="rounded-full px-4 py-1 text-xs"
          onClick={() => window.open(sample.audio_sample_url ?? sample.file_path_wav ?? '#', '_blank')}
          disabled={!sample.audio_sample_url && !sample.file_path_wav}
        >
          미리듣기
        </Button>
      </div>
    </li>
  )
}
