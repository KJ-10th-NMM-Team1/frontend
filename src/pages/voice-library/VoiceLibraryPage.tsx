import { useMemo, useState, useEffect, useRef, useCallback } from 'react'

import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowDown, ArrowUp, ChevronDown, Filter, Plus } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import type { VoiceSample, VoiceSamplesResponse } from '@/entities/voice-sample/types'
import { getCurrentUser } from '@/features/auth/api/authApi'
import { fetchVoiceSamples } from '@/features/voice-samples/api/voiceSamplesApi'
import {
  useDeleteVoiceSample,
  useRemoveFromMyVoices,
} from '@/features/voice-samples/hooks/useVoiceSamples'
import { useCreditBalance, usePurchaseVoiceWithCredits } from '@/features/credits/hooks/useCredits'
import { CREDIT_COST_PER_VOICE_ADD } from '@/shared/constants/credits'
import { useUiStore } from '@/shared/store/useUiStore'
import { useAuthStore } from '@/shared/store/useAuthStore'
import { useLanguage } from '@/features/languages/hooks/useLanguage'
import { VOICE_CATEGORY_MAP } from '@/shared/constants/voiceCategories'
import { env } from '@/shared/config/env'
import { routes } from '@/shared/config/routes'
import { Button } from '@/shared/ui/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/Dropdown'

import { VoicePlayerBar } from './components/VoicePlayerBar'
import { VoiceSearchBar } from './components/VoiceSearchBar'
import type { VoiceFilters } from './hooks/useVoiceLibraryFilters'
import { VoiceFiltersModal } from './components/VoiceFiltersModal'
import { useVoiceLibraryFilters } from './hooks/useVoiceLibraryFilters'
import { TrendingVoicesSection } from './sections/TrendingVoicesSection'
import { UseCaseCarouselSection } from './sections/UseCaseCarouselSection'
import { VoiceListSection } from './sections/VoiceListSection'
import { VoicePurchaseModal } from './components/VoicePurchaseModal'
import { LanguageQuickFilter } from './components/LanguageQuickFilter'

type LibraryTab = 'library' | 'mine'

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
  } catch (error: unknown) {
    console.error('Presigned URL 가져오기 실패:', error)
    return undefined
  }
}

export default function VoiceLibraryPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTab = (searchParams.get('tab') as LibraryTab | null) ?? 'library'
  const [tab, setTab] = useState<LibraryTab>(initialTab)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<
    'trending' | 'added-desc' | 'added-asc' | 'created-desc' | 'created-asc'
  >('added-desc')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playingSampleId, setPlayingSampleId] = useState<string | null>(null)
  const [playerSample, setPlayerSample] = useState<VoiceSample | null>(null)
  const [playerDuration, setPlayerDuration] = useState(0)
  const [playerCurrentTime, setPlayerCurrentTime] = useState(0)
  const [playerLoading, setPlayerLoading] = useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const deleteVoiceSample = useDeleteVoiceSample()
  const processingSourcesRef = useRef<Map<string, EventSource>>(new Map())
  const [addingToMyVoices, setAddingToMyVoices] = useState<Set<string>>(new Set())
  const [removingFromMyVoices, setRemovingFromMyVoices] = useState<Set<string>>(new Set())
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false)
  const [purchaseTarget, setPurchaseTarget] = useState<VoiceSample | null>(null)
  const { showToast } = useUiStore()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const { data: creditBalanceData, refetch: refetchCreditBalance } = useCreditBalance()
  const purchaseVoiceMutation = usePurchaseVoiceWithCredits()
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false)
  const { data: languageResponse } = useLanguage()
  const languageOptions = useMemo(
    () =>
      (languageResponse ?? []).map((lang) => ({
        code: lang.language_code,
        label: lang.name_ko,
      })),
    [languageResponse],
  )
  const { filters, setFilters, resetFilters, chips } = useVoiceLibraryFilters(undefined, {
    languages: languageOptions,
  })
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const selectedCategoryLabel = useMemo(() => {
    if (!selectedCategory) return null
    return (
      VOICE_CATEGORY_MAP[selectedCategory as keyof typeof VOICE_CATEGORY_MAP] ?? selectedCategory
    )
  }, [selectedCategory])

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(routes.login, { replace: true })
    }
  }, [isAuthenticated, navigate])

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
        myVoicesOnly: tab === 'mine', // 내 목소리 탭에서 추가한 보이스도 포함
        isBuiltin: undefined,
        languages:
          filters.languages && filters.languages.length > 0 ? filters.languages : undefined,
        category: filters.category && filters.category.length > 0 ? filters.category[0] : undefined,
        tags: filters.tags && filters.tags.length > 0 ? filters.tags : undefined,
      }),
    placeholderData: keepPreviousData,
  })

  const removeFromMyVoices = useRemoveFromMyVoices()
  const creditBalance = creditBalanceData?.balance ?? 0
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
    setPlayerDuration(0)
    setPlayerCurrentTime(0)
    setPlayerLoading(false)
  }, [])

  const stopPlayback = useCallback(() => {
    cleanupAudio()
    setPlayingSampleId(null)
  }, [cleanupAudio])

  const pausePlayback = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.pause()
    setPlayingSampleId(null)
  }, [])

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
    if (!sample.audio_sample_url) return undefined
    const storageSegment = '/storage/media/'
    if (sample.audio_sample_url.includes(storageSegment)) {
      const path = sample.audio_sample_url.split(storageSegment).pop()
      if (path) {
        return getPresignedUrl(path)
      }
    } else {
      return sample.audio_sample_url
    }
    return undefined
  }, [])

  const handlePlaySample = useCallback(
    (sample: VoiceSample) => {
      void (async () => {
        const sampleId = sample.id
        if (!sampleId) return

        setPlayerSample(sample)

        if (playingSampleId === sampleId) {
          pausePlayback()
          return
        }

        stopPlayback()

        const audioUrl = await resolveSampleAudioUrl(sample)
        if (!audioUrl) {
          setPlayerLoading(true)
          console.warn('재생 가능한 오디오 URL을 찾지 못했습니다.', sample)
          return
        }
        setPlayerLoading(false)

        const audio = new Audio(audioUrl)
        audioRef.current = audio
        setPlayerSample(sample)
        setPlayingSampleId(sampleId)
        audio.addEventListener('loadedmetadata', () => {
          setPlayerDuration(audio.duration)
        })
        audio.addEventListener('timeupdate', () => {
          setPlayerCurrentTime(audio.currentTime)
        })

        audio.addEventListener('ended', () => {
          stopPlayback()
        })

        audio
          .play()
          .then(() => {
            setPlayerSample(sample)
            setPlayerLoading(false)
          })
          .catch((error) => {
            console.error('음성 재생 실패:', error)
            stopPlayback()
          })
      })()
    },
    [pausePlayback, playingSampleId, resolveSampleAudioUrl, stopPlayback],
  )

  const handleSeekPlayer = useCallback((value: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = value
    setPlayerCurrentTime(value)
  }, [])

  const handleSkipPlayer = useCallback(
    (amount: number) => {
      const audio = audioRef.current
      if (!audio) return
      const next = Math.max(
        0,
        Math.min(audio.currentTime + amount, playerDuration || audio.duration || 0),
      )
      audio.currentTime = next
      setPlayerCurrentTime(next)
    },
    [playerDuration],
  )

  const togglePlayerPlayPause = useCallback(() => {
    if (!playerSample) return
    if (playingSampleId === playerSample.id) {
      pausePlayback()
      return
    }
    if (audioRef.current && audioRef.current.src) {
      void audioRef.current
        .play()
        .then(() => setPlayingSampleId(playerSample.id))
        .catch((error) => console.error('음성 재생 실패:', error))
      return
    }
    handlePlaySample(playerSample)
  }, [handlePlaySample, pausePlayback, playerSample, playingSampleId])

  const handleClosePlayer = useCallback(() => {
    stopPlayback()
    setPlayerSample(null)
  }, [stopPlayback])

  const handleEditSample = useCallback(
    (sample: VoiceSample) => {
      if (!sample.id) return
      navigate(routes.voiceSampleEdit(sample.id), { state: { sample } })
    },
    [navigate],
  )

  const handleDeleteSample = useCallback(
    (sample: VoiceSample) => {
      if (!sample.id) return
      if (!window.confirm(`"${sample.name}" 목소리를 삭제하시겠습니까?`)) return
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

  const normalizedSearch = useMemo(() => search.trim().toLowerCase(), [search])
  const hasFilters = useMemo(() => {
    return Boolean(
      (filters.languages && filters.languages.length > 0) ||
        (filters.category && filters.category.length > 0) ||
        (filters.tags && filters.tags.length > 0) ||
        filters.commercialOnly,
    )
  }, [filters])

  const samples = voiceQuery.data?.samples ?? EMPTY_SAMPLES
  const tagOptions = useMemo(() => {
    const counts = new Map<string, number>()
    samples.forEach((sample) => {
      sample.tags?.forEach((tag) => {
        const normalized = tag.trim()
        if (!normalized) return
        counts.set(normalized, (counts.get(normalized) ?? 0) + 1)
      })
    })
    return Array.from(counts.entries()).map(([tag, count]) => ({ tag, count }))
  }, [samples])

  const filteredSamples = useMemo(() => {
    if (!normalizedSearch) return samples
    return samples.filter((sample) => {
      const name = sample.name?.toLowerCase() ?? ''
      const desc = sample.description?.toLowerCase() ?? ''
      const tagsText = sample.tags?.join(' ').toLowerCase() ?? ''
      return (
        name.includes(normalizedSearch) ||
        desc.includes(normalizedSearch) ||
        tagsText.includes(normalizedSearch)
      )
    })
  }, [samples, normalizedSearch])

  const sortedSamples = useMemo(() => {
    const tagFiltered =
      filters.tags && filters.tags.length
        ? filteredSamples.filter((sample) =>
            (filters.tags ?? []).every((tag) => sample.tags?.includes(tag)),
          )
        : filteredSamples
    const commercialFiltered =
      filters.commercialOnly === true
        ? tagFiltered.filter((sample) => sample.canCommercialUse !== false)
        : tagFiltered
    const sorted = [...commercialFiltered]
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
  }, [filteredSamples, sort, filters.tags, filters.commercialOnly])

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
        } catch (error: unknown) {
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
      // cleanup 시 모든 EventSource를 닫아야 함 (pendingIds만이 아닌 전체)
      sources.forEach((source) => {
        source.close()
      })
      sources.clear()
    }
  }, [queryClient, sortedSamples])
  // Trending voices (인기 보이스) - 추가 횟수 기준으로 실제 인기 보이스만 노출
  const trendingVoices = useMemo(() => {
    return [...sortedSamples]
      .filter((sample) => (sample.addedCount ?? 0) > 0)
      .sort((a, b) => (b.addedCount ?? 0) - (a.addedCount ?? 0))
      .slice(0, 6)
  }, [sortedSamples])

  // Add to my voices 핸들러 (크레딧 차감 모달)
  const handleRequestAddToMyVoices = useCallback(
    (sample: VoiceSample) => {
      if (!sample.id) return
      if (sample.isInMyVoices) {
        showToast({ title: '이미 내 목소리에 추가되어 있습니다.', variant: 'info' })
        return
      }
      if (!sample.isPublic) {
        showToast({ title: '비공개 보이스는 추가할 수 없습니다.', variant: 'warning' })
        return
      }
      if (sample.canCommercialUse === false) {
        showToast({ title: '비상업용 보이스는 추가할 수 없습니다.', variant: 'warning' })
        return
      }
      setPurchaseTarget(sample)
      setIsPurchaseModalOpen(true)
    },
    [showToast],
  )

  const handleConfirmPurchase = useCallback(async () => {
    if (!purchaseTarget?.id) return
    const sampleId = purchaseTarget.id
    if (purchaseTarget.canCommercialUse === false || purchaseTarget.isPublic === false) {
      showToast({ title: '추가할 수 없는 보이스입니다.', variant: 'warning' })
      setIsPurchaseModalOpen(false)
      setPurchaseTarget(null)
      return
    }
    setAddingToMyVoices((prev) => new Set(prev).add(sampleId))
    try {
      await purchaseVoiceMutation.mutateAsync({
        sampleId,
        cost: CREDIT_COST_PER_VOICE_ADD,
      })
      showToast({ title: '내 목소리에 추가되었습니다.', variant: 'success' })
      setIsPurchaseModalOpen(false)
      setPurchaseTarget(null)
      void refetchCreditBalance()
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : typeof error === 'string'
            ? error
            : '크레딧 결제에 실패했습니다.'
      showToast({ title: '추가에 실패했습니다.', description: message, variant: 'error' })
    } finally {
      setAddingToMyVoices((prev) => {
        const next = new Set(prev)
        next.delete(sampleId)
        return next
      })
    }
  }, [purchaseTarget, purchaseVoiceMutation, refetchCreditBalance, showToast])

  const handleNavigateToCredits = useCallback(() => {
    navigate(routes.myinfo)
  }, [navigate])

  const handleClosePurchaseModal = useCallback(() => {
    setIsPurchaseModalOpen(false)
    setPurchaseTarget(null)
  }, [])

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

  const setTabWithParam = useCallback(
    (next: LibraryTab) => {
      setTab(next)
      const params = new URLSearchParams(searchParams)
      params.set('tab', next)
      setSearchParams(params, { replace: true })
    },
    [searchParams, setSearchParams],
  )

  const tabLabel = tab === 'library' ? '탐색' : '내 목소리'

  useEffect(() => {
    const nextTab = (searchParams.get('tab') as LibraryTab | null) ?? 'library'
    if (nextTab !== tab) {
      setTab(nextTab)
    }
  }, [searchParams, tab])

  // 언어 토글 핸들러 (단일 선택만 가능)
  const handleToggleLanguage = useCallback(
    (languageCode: string | null) => {
      if (languageCode === null) {
        // 전체 선택 (필터 해제)
        setFilters((prev) => ({
          ...prev,
          languages: undefined,
        }))
        return
      }

      const normalizedCode = languageCode.toLowerCase()
      const currentLanguages = filters.languages ?? []
      const isSelected = currentLanguages.some((lang) => lang.toLowerCase() === normalizedCode)

      setFilters((prev) => ({
        ...prev,
        // 이미 선택된 언어를 클릭하면 해제, 다른 언어를 클릭하면 기존 선택 해제하고 새로 선택
        languages: isSelected ? undefined : [normalizedCode],
      }))
    },
    [filters.languages, setFilters],
  )

  if (!isAuthenticated) {
    return null
  }

  return (
    <>
      <div className="mx-auto max-w-7xl space-y-8 px-6 py-6 pb-28">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-on-primary-container">보이스 마켓</h1>
            <p className="text-sm text-muted-foreground">
              원하는 목소리를 검색하고 필터로 빠르게 찾아보세요.
            </p>
          </div>
          {/* 탭 선택은 헤더 드롭다운(AppHeader)에서 처리 */}
        </div>

        {/* 검색 및 필터 */}
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <VoiceSearchBar
              value={search}
              onChange={setSearch}
              chips={chips}
              onResetChips={() => {
                resetFilters()
                setSelectedCategory(null)
              }}
            />
            <div className="flex items-center gap-2 text-xs">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="secondary"
                    className="h-10 gap-2 rounded-full border-outline/30 bg-primary-container px-3 py-1.5 text-sm font-medium text-on-primary-container shadow-soft hover:bg-primary-container/90"
                  >
                    {sort === 'trending' && (
                      <>
                        인기순 <ArrowDown className="h-3 w-3 text-on-primary-container" />
                      </>
                    )}
                    {sort === 'added-desc' && (
                      <>
                        인기순 <ArrowDown className="h-3 w-3 text-on-primary-container" />
                      </>
                    )}
                    {sort === 'added-asc' && (
                      <>
                        인기순 <ArrowUp className="h-3 w-3 text-on-primary-container" />
                      </>
                    )}
                    {sort === 'created-desc' && (
                      <>
                        최신순 <ArrowDown className="h-3 w-3 text-on-primary-container" />
                      </>
                    )}
                    {sort === 'created-asc' && (
                      <>
                        오래된순 <ArrowUp className="h-3 w-3 text-on-primary-container" />
                      </>
                    )}
                    <ChevronDown className="h-3 w-3 text-on-primary-container" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => setSort('added-desc')}>
                    <div className="flex items-center gap-1">
                      인기순 <ArrowDown className="h-3 w-3" />
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSort('added-asc')}>
                    <div className="flex items-center gap-1">
                      인기순 <ArrowUp className="h-3 w-3" />
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSort('created-desc')}>
                    <div className="flex items-center gap-1">
                      최신순 <ArrowDown className="h-3 w-3" />
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSort('created-asc')}>
                    <div className="flex items-center gap-1">
                      오래된순 <ArrowUp className="h-3 w-3" />
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="secondary"
                onClick={() => setIsFiltersModalOpen(true)}
                className="h-10 gap-2 rounded-full border-outline/30 bg-primary-container px-3 py-1.5 text-sm font-medium text-on-primary-container shadow-soft hover:bg-primary-container/90"
              >
                <Filter className="h-4 w-4" />
                필터
              </Button>
            </div>
          </div>

          {/* 언어 빠른 필터 */}
          {tab === 'library' && languageOptions.length > 0 && (
            <LanguageQuickFilter
              languages={languageOptions.map((lang) => ({
                code: lang.code,
                label: lang.label,
              }))}
              selectedLanguages={filters.languages ?? []}
              onToggleLanguage={handleToggleLanguage}
            />
          )}
        </div>

        {/* Trending voices 섹션 */}
        {tab === 'library' &&
          trendingVoices.length > 0 &&
          !search.trim() &&
          !hasFilters &&
          !selectedCategory && (
            <TrendingVoicesSection
              voices={trendingVoices}
              onPlay={handlePlaySample}
              playingSampleId={playingSampleId}
              onAddToMyVoices={handleRequestAddToMyVoices}
              onRemoveFromMyVoices={handleRemoveFromMyVoices}
              addingToMyVoices={addingToMyVoices}
              removingFromMyVoices={removingFromMyVoices}
              onSortChange={() => {
                // 드롭다운이 열리도록 하려면 별도 처리가 필요하지만,
                // 일단 trending으로 설정
                setSort('trending')
              }}
              currentUserId={currentUser?._id}
            />
          )}

        {/* Handpicked for your use case 캐러셀 */}
        {tab === 'library' && !search.trim() && !hasFilters && !selectedCategory && (
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
                <h2 className="text-lg font-semibold">{selectedCategoryLabel}</h2>
              </div>
            </div>
            <VoiceListSection
              title=""
              samples={sortedSamples}
              isLoading={voiceQuery.isLoading}
              onPlay={handlePlaySample}
              playingSampleId={playingSampleId}
              onAddToMyVoices={handleRequestAddToMyVoices}
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

        {/* 모든 목소리 섹션 */}
        {tab === 'library' &&
          sortedSamples.length > 0 &&
          !selectedCategory &&
          !normalizedSearch &&
          !hasFilters && (
            <VoiceListSection
              title="모든 목소리"
              samples={sortedSamples}
              isLoading={voiceQuery.isLoading}
              onPlay={handlePlaySample}
              playingSampleId={playingSampleId}
              onAddToMyVoices={handleRequestAddToMyVoices}
              onRemoveFromMyVoices={handleRemoveFromMyVoices}
              addingToMyVoices={addingToMyVoices}
              removingFromMyVoices={removingFromMyVoices}
              showActions={false}
              onEdit={undefined}
              onDelete={undefined}
              deletingId={null}
            />
          )}

        {/* 검색/필터 결과 전용 섹션 */}
        {tab === 'library' && !selectedCategory && (normalizedSearch || hasFilters) && (
          <VoiceListSection
            title="검색 결과"
            samples={sortedSamples}
            isLoading={voiceQuery.isLoading}
            onPlay={handlePlaySample}
            playingSampleId={playingSampleId}
            onAddToMyVoices={handleRequestAddToMyVoices}
            onRemoveFromMyVoices={handleRemoveFromMyVoices}
            addingToMyVoices={addingToMyVoices}
            removingFromMyVoices={removingFromMyVoices}
            showActions={false}
            onEdit={undefined}
            onDelete={undefined}
            deletingId={null}
          />
        )}

        {/* 내 보이스 목록 */}
        {tab === 'mine' && (
          <VoiceListSection
            title="내 목소리"
            samples={sortedSamples}
            isLoading={voiceQuery.isLoading}
            onPlay={handlePlaySample}
            playingSampleId={playingSampleId}
            onAddToMyVoices={handleRequestAddToMyVoices}
            onRemoveFromMyVoices={handleRemoveFromMyVoices}
            addingToMyVoices={addingToMyVoices}
            removingFromMyVoices={removingFromMyVoices}
            showActions={isMyTab}
            onEdit={handleEditSample}
            onDelete={handleDeleteSample}
            deletingId={deletingId}
            currentUserId={currentUser?._id}
          />
        )}

        <VoiceFiltersModal
          open={isFiltersModalOpen}
          onOpenChange={setIsFiltersModalOpen}
          filters={filters}
          onFiltersChange={setFilters}
          onApply={() => {
            console.log('Filters applied:', filters)
          }}
          tagOptions={tagOptions}
        />
        <VoicePurchaseModal
          open={isPurchaseModalOpen}
          sample={purchaseTarget}
          creditBalance={creditBalance}
          cost={CREDIT_COST_PER_VOICE_ADD}
          isProcessing={purchaseVoiceMutation.status === 'pending'}
          onClose={handleClosePurchaseModal}
          onConfirm={() => {
            void handleConfirmPurchase()
          }}
          onChargeCredits={handleNavigateToCredits}
        />
      </div>

      <FloatingVoiceButton onClick={() => navigate(routes.voiceCloning)} />

      {playerSample && (
        <VoicePlayerBar
          sample={playerSample}
          isPlaying={playingSampleId === playerSample.id}
          currentTime={playerCurrentTime}
          duration={playerDuration}
          isLoading={playerLoading}
          onPlayPause={togglePlayerPlayPause}
          onSeek={handleSeekPlayer}
          onSkip={handleSkipPlayer}
          onClose={handleClosePlayer}
        />
      )}
    </>
  )
}

function VoiceLibraryEmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="rounded-3xl border border-surface-4/80 bg-surface-1 p-10 text-center shadow-soft">
      <div className="mx-auto mb-6 h-40 w-40 max-w-[260px]">
        <EmptyStateIllustration />
      </div>
      <h3 className="text-xl font-semibold text-foreground">보이스 샘플이 없습니다</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        새로운 보이스를 클로닝하거나 업로드해 보이스 마켓을 시작해 보세요.
      </p>
      <div className="mt-6 flex justify-center">
        <Button size="lg" onClick={onCreate}>
          새 보이스 만들기
        </Button>
      </div>
    </div>
  )
}

function EmptyStateIllustration() {
  return (
    <svg viewBox="0 0 220 200" role="img" aria-hidden="true" className="h-full w-full">
      <defs>
        <linearGradient id="voiceMicGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.9" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.65" />
        </linearGradient>
      </defs>
      <circle cx="110" cy="110" r="90" fill="hsl(var(--primary) / 0.08)" />
      <circle cx="110" cy="90" r="55" fill="hsl(var(--primary) / 0.08)" />
      <rect x="95" y="35" width="30" height="90" rx="15" fill="url(#voiceMicGradient)" />
      <rect x="80" y="60" width="60" height="40" rx="12" fill="hsl(var(--primary) / 0.18)" />
      <rect x="88" y="68" width="44" height="24" rx="6" fill="hsl(var(--primary) / 0.28)" />
      <path
        d="M70 100c0 22 18 40 40 40s40-18 40-40"
        stroke="hsl(var(--primary))"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
      <rect x="101" y="134" width="18" height="42" rx="4" fill="hsl(var(--primary))" />
      <rect x="86" y="172" width="48" height="12" rx="6" fill="hsl(var(--primary) / 0.3)" />
      <circle cx="60" cy="55" r="12" fill="hsl(var(--primary) / 0.16)" />
      <circle cx="160" cy="55" r="12" fill="hsl(var(--primary) / 0.16)" />
      <text
        x="60"
        y="59"
        textAnchor="middle"
        fontSize="10"
        fontWeight="600"
        fill="hsl(var(--primary))"
      >
        A
      </text>
      <text
        x="160"
        y="59"
        textAnchor="middle"
        fontSize="10"
        fontWeight="600"
        fill="hsl(var(--primary))"
      >
        가
      </text>
    </svg>
  )
}

function FloatingVoiceButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      type="button"
      className="fixed bottom-16 right-[max(1rem,calc((100vw-80rem)/2+1rem))] z-40 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl shadow-black/20 transition hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-offset-2"
      onClick={onClick}
      aria-label="내 목소리 만들기"
    >
      <Plus className="h-6 w-6" />
    </Button>
  )
}
