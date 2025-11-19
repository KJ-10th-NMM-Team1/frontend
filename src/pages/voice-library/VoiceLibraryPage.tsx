import { useMemo, useState, useEffect, useRef, useCallback } from 'react'

import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowDown, ArrowUp, ChevronDown, Filter, Globe, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import type { VoiceSample, VoiceSamplesResponse } from '@/entities/voice-sample/types'
import { getCurrentUser } from '@/features/auth/api/authApi'
import { fetchVoiceSamples } from '@/features/voice-samples/api/voiceSamplesApi'
import {
  useAddToMyVoices,
  useDeleteVoiceSample,
  useRemoveFromMyVoices,
} from '@/features/voice-samples/hooks/useVoiceSamples'
import { VoiceSampleEditModal } from '@/features/voice-samples/modals/VoiceSampleEditModal'
import { env } from '@/shared/config/env'
import { routes } from '@/shared/config/routes'
import { Button } from '@/shared/ui/Button'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/Dropdown'
import { Input } from '@/shared/ui/Input'

import { VoiceFiltersModal, type VoiceFilters } from './components/VoiceFiltersModal'
import { VoiceLibraryTabs } from './components/VoiceLibraryTabs'
import { CharacterVoicesSection } from './sections/CharacterVoicesSection'
import { TrendingVoicesSection } from './sections/TrendingVoicesSection'
import { UseCaseCarouselSection } from './sections/UseCaseCarouselSection'
import { VoiceListSection } from './sections/VoiceListSection'

type LibraryTab = 'library' | 'mine' | 'default'

const EMPTY_SAMPLES: VoiceSample[] = []

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
  const [sort, setSort] = useState<
    'trending' | 'added-desc' | 'added-asc' | 'created-desc' | 'created-asc'
  >('added-desc')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingSample, setEditingSample] = useState<VoiceSample | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playingSampleId, setPlayingSampleId] = useState<string | null>(null)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const deleteVoiceSample = useDeleteVoiceSample()
  const processingSourcesRef = useRef<Map<string, EventSource>>(new Map())
  const [addingToMyVoices, setAddingToMyVoices] = useState<Set<string>>(new Set())
  const [removingFromMyVoices, setRemovingFromMyVoices] = useState<Set<string>>(new Set())
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false)
  const [filters, setFilters] = useState<VoiceFilters>({
    gender: 'any',
  })
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const queryKey = useMemo(
    () => ['voice-library', tab, search, filters] as const,
    [tab, search, filters],
  )
  const voiceQuery = useQuery<
    VoiceSamplesResponse,
    Error,
    VoiceSamplesResponse,
    readonly [string, LibraryTab, string, VoiceFilters]
  >({
    queryKey,
    queryFn: () =>
      fetchVoiceSamples({
        q: search.trim() || undefined,
        mySamplesOnly: tab === 'mine',
        myVoicesOnly: tab === 'mine' ? true : undefined,
        isDefault:
          tab === 'default' ? true : tab === 'library' || tab === 'mine' ? false : undefined,
        gender: filters.gender && filters.gender !== 'any' ? filters.gender : undefined,
        languages:
          filters.languages && filters.languages.length > 0 ? filters.languages : undefined,
        category: filters.category && filters.category.length > 0 ? filters.category[0] : undefined,
      }),
    placeholderData: keepPreviousData,
  })

  const addToMyVoices = useAddToMyVoices()
  const removeFromMyVoices = useRemoveFromMyVoices()
  const isMyTab = tab === 'mine'

  // 현재 사용자 정보 가져오기
  const { data: currentUser } = useQuery({
    queryKey: ['auth', 'current-user'],
    queryFn: getCurrentUser,
    staleTime: Infinity,
  })

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
    const sources = processingSourcesRef.current
    return () => {
      stopPlayback()
      sources.forEach((source) => {
        source.close()
      })
      sources.clear()
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
    (sample: VoiceSample) => {
      void (async () => {
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
      })()
    },
    [playingSampleId, resolveSampleAudioUrl, stopPlayback],
  )

  const handleEditSample = useCallback((sample: VoiceSample) => {
    setEditingSample(sample)
    setIsEditModalOpen(true)
  }, [])

  const handleDeleteSample = useCallback(
    (sample: VoiceSample) => {
      if (!sample.id) return
      if (!window.confirm(`"${sample.name}" 보이스를 삭제하시겠습니까?`)) return
      setDeletingId(sample.id)
      deleteVoiceSample.mutate(sample.id, {
        onSuccess: () => {
          void queryClient.invalidateQueries({ queryKey: ['voice-library'], exact: false })
        },
        onSettled: () => {
          setDeletingId(null)
        },
      })
    },
    [deleteVoiceSample, queryClient],
  )

  const handleEditSuccess = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ['voice-library'], exact: false })
  }, [queryClient])

  const samples = voiceQuery.data?.samples ?? EMPTY_SAMPLES
  const sortedSamples = useMemo(() => {
    const sorted = [...samples]
    switch (sort) {
      case 'trending':
      case 'added-desc':
        return sorted.sort((a, b) => (b.addedCount ?? 0) - (a.addedCount ?? 0))
      case 'added-asc':
        return sorted.sort((a, b) => (a.addedCount ?? 0) - (b.addedCount ?? 0))
      case 'created-desc':
        return sorted.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
          return dateB - dateA
        })
      case 'created-asc':
        return sorted.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
          return dateA - dateB
        })
      default:
        return sorted
    }
  }, [samples, sort])

  useEffect(() => {
    const pendingSamples = sortedSamples.filter(
      (sample): sample is VoiceSample & { id: string } =>
        Boolean(sample.id) && !sample.audio_sample_url,
    )
    const pendingIds = new Set(pendingSamples.map((sample) => sample.id))
    const sources = processingSourcesRef.current

    pendingSamples.forEach((sample) => {
      const sampleId = sample.id
      if (!sampleId || sources.has(sampleId)) return

      const source = new EventSource(`${env.apiBaseUrl}/api/voice-samples/${sampleId}/stream`)

      source.addEventListener('message', (event) => {
        try {
          const eventData = typeof event.data === 'string' ? event.data : String(event.data)
          const data = JSON.parse(eventData) as {
            sample_id?: string
            audio_sample_url?: string | null
            has_audio_sample?: boolean
            error?: string
          }

          if (data.has_audio_sample && data.audio_sample_url) {
            source.close()
            sources.delete(sampleId)
            void queryClient.invalidateQueries({ queryKey: ['voice-library'], exact: false })
          } else if (data.error) {
            source.close()
            sources.delete(sampleId)
          }
        } catch (error) {
          console.error('Failed to parse voice sample SSE data:', error)
        }
      })

      source.onerror = (error) => {
        console.error('Voice sample SSE connection error:', error)
        source.close()
        sources.delete(sampleId)
      }

      sources.set(sampleId, source)
    })

    sources.forEach((source, sampleId) => {
      if (!pendingIds.has(sampleId)) {
        source.close()
        sources.delete(sampleId)
      }
    })

    return () => {
      pendingIds.forEach((sampleId) => {
        const source = sources.get(sampleId)
        if (source) {
          source.close()
          sources.delete(sampleId)
        }
      })
    }
  }, [queryClient, sortedSamples])
  // Trending voices (인기 보이스) - 추가 횟수 순으로 정렬된 상위 6개
  const trendingVoices = useMemo(() => {
    return [...sortedSamples].sort((a, b) => (b.addedCount ?? 0) - (a.addedCount ?? 0)).slice(0, 6)
  }, [sortedSamples])

  // Character voices (캐릭터 보이스) - 설명이 있는 보이스들
  const characterVoices = useMemo(() => {
    return sortedSamples.filter((sample) => sample.description).slice(0, 6)
  }, [sortedSamples])

  // Add to my voices 핸들러
  const handleAddToMyVoices = useCallback(
    (sample: VoiceSample) => {
      if (!sample.id || sample.isInMyVoices) return

      setAddingToMyVoices((prev) => new Set(prev).add(sample.id))
      addToMyVoices.mutate(sample.id, {
        onSettled: () => {
          setAddingToMyVoices((prev) => {
            const next = new Set(prev)
            next.delete(sample.id)
            return next
          })
        },
      })
    },
    [addToMyVoices],
  )

  // Remove from my voices 핸들러
  const handleRemoveFromMyVoices = useCallback(
    (sample: VoiceSample) => {
      if (!sample.id || !sample.isInMyVoices) return

      setRemovingFromMyVoices((prev) => new Set(prev).add(sample.id))
      removeFromMyVoices.mutate(sample.id, {
        onSettled: () => {
          setRemovingFromMyVoices((prev) => {
            const next = new Set(prev)
            next.delete(sample.id)
            return next
          })
        },
      })
    },
    [removeFromMyVoices],
  )

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-6 py-6">
      {/* 상단 네비게이션 */}
      <div className="flex items-center justify-between gap-4">
        <VoiceLibraryTabs activeTab={tab} onChange={setTab} />
        <div className="flex items-center gap-4">
          <Button variant="primary" onClick={() => navigate(routes.voiceCloning)} className="gap-2">
            <Globe className="h-4 w-4" />
            보이스 생성
          </Button>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search library voices..."
            className="h-10 rounded-full border-surface-3 bg-surface-1 py-2.5 pl-9 pr-3 text-sm shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex items-center gap-2 text-xs">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="primary"
                className="h-8 gap-1 rounded-full px-3 py-1.5 text-xs font-medium"
              >
                {sort === 'trending' && (
                  <>
                    Trending <ArrowDown className="h-3 w-3" />
                  </>
                )}
                {sort === 'added-desc' && (
                  <>
                    Trending <ArrowDown className="h-3 w-3" />
                  </>
                )}
                {sort === 'added-asc' && (
                  <>
                    Trending <ArrowUp className="h-3 w-3" />
                  </>
                )}
                {sort === 'created-desc' && (
                  <>
                    Newest <ArrowDown className="h-3 w-3" />
                  </>
                )}
                {sort === 'created-asc' && (
                  <>
                    Oldest <ArrowUp className="h-3 w-3" />
                  </>
                )}
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => setSort('added-desc')}>
                <div className="flex items-center gap-1">
                  Trending <ArrowDown className="h-3 w-3" />
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSort('added-asc')}>
                <div className="flex items-center gap-1">
                  Trending <ArrowUp className="h-3 w-3" />
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSort('created-desc')}>
                <div className="flex items-center gap-1">
                  Newest <ArrowDown className="h-3 w-3" />
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSort('created-asc')}>
                <div className="flex items-center gap-1">
                  Oldest <ArrowUp className="h-3 w-3" />
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="secondary"
            onClick={() => setIsFiltersModalOpen(true)}
            className="h-8 gap-1 rounded-full border-surface-3 px-3 py-1.5 text-xs"
          >
            <Filter className="h-3 w-3" />
            Filters
          </Button>
        </div>
      </div>

      {/* Trending voices 섹션 */}
      {tab === 'library' && trendingVoices.length > 0 && !search.trim() && !selectedCategory && (
        <TrendingVoicesSection
          voices={trendingVoices}
          onPlay={handlePlaySample}
          playingSampleId={playingSampleId}
          onAddToMyVoices={handleAddToMyVoices}
          onRemoveFromMyVoices={handleRemoveFromMyVoices}
          addingToMyVoices={addingToMyVoices}
          removingFromMyVoices={removingFromMyVoices}
          onSortChange={() => {
            // 드롭다운이 열리도록 하려면 별도 처리가 필요하지만,
            // 일단 trending으로 설정
            setSort('trending')
          }}
        />
      )}

      {/* Handpicked for your use case 캐러셀 */}
      {tab === 'library' && !search.trim() && !selectedCategory && (
        <UseCaseCarouselSection
          onCategoryClick={(category) => {
            setSelectedCategory(category)
            setFilters({ ...filters, category: [category] })
          }}
        />
      )}

      {/* 카테고리 필터링된 결과 */}
      {tab === 'library' && selectedCategory && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory(null)
                  setFilters({ ...filters, category: undefined })
                }}
                className="text-sm text-muted hover:text-foreground"
              >
                ← Back
              </button>
              <h2 className="text-lg font-semibold">{selectedCategory}</h2>
            </div>
          </div>
          <VoiceListSection
            title=""
            samples={sortedSamples}
            isLoading={voiceQuery.isLoading}
            onPlay={handlePlaySample}
            playingSampleId={playingSampleId}
            onAddToMyVoices={handleAddToMyVoices}
            onRemoveFromMyVoices={handleRemoveFromMyVoices}
            addingToMyVoices={addingToMyVoices}
            removingFromMyVoices={removingFromMyVoices}
            showActions={false}
            onEdit={undefined}
            onDelete={undefined}
            deletingId={null}
          />
        </div>
      )}

      {/* Character voices 섹션 */}
      {tab === 'library' && characterVoices.length > 0 && !selectedCategory && (
        <CharacterVoicesSection
          voices={characterVoices}
          onPlay={handlePlaySample}
          playingSampleId={playingSampleId}
          onAddToMyVoices={handleAddToMyVoices}
          onRemoveFromMyVoices={handleRemoveFromMyVoices}
          addingToMyVoices={addingToMyVoices}
          removingFromMyVoices={removingFromMyVoices}
          showTitle={!search.trim()}
        />
      )}

      {/* 전체 목록 (내 보이스/Default Voices 탭에서만 표시) */}
      {tab !== 'library' && (
        <VoiceListSection
          title={tab === 'mine' ? 'My Voices' : 'Default Voices'}
          samples={sortedSamples}
          isLoading={voiceQuery.isLoading}
          onPlay={handlePlaySample}
          playingSampleId={playingSampleId}
          onAddToMyVoices={tab === 'default' ? undefined : handleAddToMyVoices}
          onRemoveFromMyVoices={tab === 'default' ? undefined : handleRemoveFromMyVoices}
          addingToMyVoices={addingToMyVoices}
          removingFromMyVoices={removingFromMyVoices}
          showActions={isMyTab}
          onEdit={handleEditSample}
          onDelete={handleDeleteSample}
          deletingId={deletingId}
          currentUserId={currentUser?._id}
        />
      )}

      <VoiceSampleEditModal
        open={isEditModalOpen}
        onOpenChange={(open) => {
          setIsEditModalOpen(open)
          if (!open) {
            setEditingSample(null)
          }
        }}
        sample={editingSample}
        onSuccess={handleEditSuccess}
      />

      <VoiceFiltersModal
        open={isFiltersModalOpen}
        onOpenChange={setIsFiltersModalOpen}
        filters={filters}
        onFiltersChange={setFilters}
        onApply={() => {
          // TODO: 필터 적용 로직
          console.log('Filters applied:', filters)
        }}
      />
    </div>
  )
}
