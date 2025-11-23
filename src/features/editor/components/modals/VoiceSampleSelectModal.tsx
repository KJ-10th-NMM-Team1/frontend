import { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import { Search, Plus, Filter, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import ReactCountryFlag from 'react-country-flag'

import type { VoiceSample } from '@/entities/voice-sample/types'
import { useVoiceSamples } from '@/features/voice-samples/hooks/useVoiceSamples'
import {
  getPresetAvatarUrl,
  DEFAULT_AVATAR,
} from '@/features/voice-samples/components/voiceSampleFieldUtils'
import { useLanguage } from '@/features/languages/hooks/useLanguage'
import { env } from '@/shared/config/env'
import { routes } from '@/shared/config/routes'
import { VOICE_CATEGORIES, VOICE_CATEGORY_MAP } from '@/shared/constants/voiceCategories'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/Button'
import { Dialog, DialogContent, DialogTitle } from '@/shared/ui/Dialog'
import { Input } from '@/shared/ui/Input'
import { Spinner } from '@/shared/ui/Spinner'

import { VoiceSampleRowItem } from './VoiceSampleRowItem'

const languageCountryMap: Record<string, string> = {
  ko: 'KR',
  en: 'US',
  ja: 'JP',
  jp: 'JP',
  zh: 'CN',
  cn: 'CN',
  es: 'ES',
  fr: 'FR',
  de: 'DE',
  it: 'IT',
  pt: 'PT',
  ru: 'RU',
}

const getCountryCode = (code?: string) => {
  if (!code) return 'US'
  const normalized = code.toLowerCase()
  return languageCountryMap[normalized] ?? normalized.slice(0, 2).toUpperCase()
}

type VoiceSampleSelectModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (voiceSampleId: string) => void
  currentVoiceSampleId?: string
  trackLabel: string
}

const DEFAULT_VOICE_MODEL = 'clone'

export function VoiceSampleSelectModal({
  open,
  onOpenChange,
  onSelect,
  currentVoiceSampleId,
  trackLabel,
}: VoiceSampleSelectModalProps) {
  const navigate = useNavigate()
  const [selectedId, setSelectedId] = useState<string | undefined>(
    currentVoiceSampleId || DEFAULT_VOICE_MODEL,
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [playingSampleId, setPlayingSampleId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [avatarUrls, setAvatarUrls] = useState<Map<string, string>>(new Map())
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState<string | undefined>(undefined)
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined)
  const { data: languageResponse } = useLanguage()

  const { data: myVoicesData, isLoading: isLoadingMyVoices } = useVoiceSamples({
    myVoicesOnly: true,
  })
  const { data: defaultVoicesData, isLoading: isLoadingDefault } = useVoiceSamples({
    isBuiltin: true,
  })

  const isLoading = isLoadingMyVoices || isLoadingDefault

  const { mySamples, librarySamples, builtinSamples, cloneSample } = useMemo(() => {
    const my = myVoicesData?.samples || []
    const def = defaultVoicesData?.samples || []

    const myIds = new Set(my.map((s) => s.id))
    const library = def.filter((s) => !myIds.has(s.id))
    const builtin = def.filter((s) => s.isBuiltin)

    const clone: VoiceSample = {
      id: 'clone',
      name: '원본 음성',
      description: '원본 음성',
      attributes: '기본값',
      isPublic: true,
      isInMyVoices: false,
      addedCount: 0,
      isBuiltin: false,
    }

    return {
      mySamples: my,
      librarySamples: library,
      builtinSamples: builtin,
      cloneSample: clone,
    }
  }, [myVoicesData, defaultVoicesData])

  const filterSamples = useCallback(
    (samples: VoiceSample[]) => {
      let filtered = samples

      if (selectedLanguage) {
        filtered = filtered.filter(
          (sample) => sample.country?.toLowerCase() === selectedLanguage.toLowerCase(),
        )
      }

      if (selectedCategory) {
        filtered = filtered.filter((sample) => {
          if (Array.isArray(sample.category)) {
            return sample.category.includes(selectedCategory)
          }
          return sample.category === selectedCategory
        })
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        filtered = filtered.filter((sample) => {
          if (sample.name.toLowerCase().includes(query)) return true

          if (sample.tags?.some((tag) => tag.toLowerCase().includes(query))) return true

          if (sample.country?.toLowerCase().includes(query)) return true

          if (sample.gender?.toLowerCase().includes(query)) return true

          if (sample.category) {
            const categories = Array.isArray(sample.category) ? sample.category : [sample.category]
            for (const cat of categories) {
              if (cat.toLowerCase().includes(query)) return true
              const categoryLabel = VOICE_CATEGORY_MAP[cat as keyof typeof VOICE_CATEGORY_MAP]
              if (categoryLabel && categoryLabel.toLowerCase().includes(query)) return true
            }
          }
          return false
        })
      }
      return filtered
    },
    [searchQuery, selectedLanguage, selectedCategory],
  )

  const filteredMySamples = useMemo(() => filterSamples(mySamples), [mySamples, filterSamples])
  const filteredLibrarySamples = useMemo(
    () => filterSamples(librarySamples),
    [librarySamples, filterSamples],
  )
  const filteredBuiltinSamples = useMemo(
    () => filterSamples(builtinSamples),
    [builtinSamples, filterSamples],
  )

  const hasActiveFilters = Boolean(selectedLanguage || selectedCategory)

  useEffect(() => {
    if (open) {
      setSelectedId(currentVoiceSampleId || DEFAULT_VOICE_MODEL)
      setSearchQuery('')
    } else {
      stopAudio()
      setIsFilterOpen(false)
    }
  }, [open, currentVoiceSampleId])

  const handleResetFilters = () => {
    setSelectedLanguage(undefined)
    setSelectedCategory(undefined)
  }

  useEffect(() => {
    return () => stopAudio()
  }, [])

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setPlayingSampleId(null)
  }

  const getPresignedUrl = async (path: string): Promise<string | undefined> => {
    try {
      const apiBase = env.apiBaseUrl.startsWith('http')
        ? `${env.apiBaseUrl}/api`
        : env.apiBaseUrl || '/api'
      const pathSegments = path.split('/')
      const encodedPath = pathSegments.map((segment) => encodeURIComponent(segment)).join('/')
      const response = await fetch(`${apiBase}/storage/media/${encodedPath}`)
      if (!response.ok) throw new Error('URL 가져오기 실패')
      const data = (await response.json()) as { url: string }
      return data.url
    } catch {
      return undefined
    }
  }

  const resolveAvatarUrl = useCallback(
    async (sample: VoiceSample): Promise<string> => {
      if (avatarUrls.has(sample.id)) {
        return avatarUrls.get(sample.id)!
      }
      if (sample.avatarImagePath) {
        const url = await getPresignedUrl(sample.avatarImagePath)
        if (url) {
          setAvatarUrls((prev) => new Map(prev).set(sample.id, url))
          return url
        }
      }
      if (sample.avatarImageUrl && sample.avatarImageUrl.startsWith('http')) {
        setAvatarUrls((prev) => new Map(prev).set(sample.id, sample.avatarImageUrl!))
        return sample.avatarImageUrl
      }
      if (sample.avatarPreset) {
        const presetUrl = getPresetAvatarUrl(sample.avatarPreset)
        setAvatarUrls((prev) => new Map(prev).set(sample.id, presetUrl))
        return presetUrl
      }
      const defaultUrl = DEFAULT_AVATAR
      setAvatarUrls((prev) => new Map(prev).set(sample.id, defaultUrl))
      return defaultUrl
    },
    [avatarUrls],
  )

  useEffect(() => {
    const loadAvatars = async () => {
      const allSamples = [...mySamples, ...librarySamples]
      for (const sample of allSamples) {
        if (!avatarUrls.has(sample.id)) {
          await resolveAvatarUrl(sample)
        }
      }
    }
    if (!isLoading && (mySamples.length > 0 || librarySamples.length > 0)) {
      void loadAvatars()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mySamples.length, librarySamples.length, isLoading, resolveAvatarUrl])

  const handlePlayPreview = async (e: React.MouseEvent, sample: VoiceSample) => {
    e.stopPropagation()
    if (sample.id === 'clone') return

    const sampleId = String(sample.id)
    if (playingSampleId === sampleId) {
      stopAudio()
      return
    }
    if (audioRef.current) stopAudio()

    let audioUrl = sample.audio_sample_url
    if (audioUrl && audioUrl.includes('/storage/media/')) {
      const path = audioUrl.replace(/^.*\/storage\/media\//, '')
      audioUrl = await getPresignedUrl(path)
    } else if (!audioUrl && sample.file_path_wav) {
      audioUrl = await getPresignedUrl(sample.file_path_wav)
    }

    if (!audioUrl) return

    const audio = new Audio(audioUrl)
    audioRef.current = audio
    setPlayingSampleId(sampleId)
    audio.addEventListener('ended', () => stopAudio())
    audio.play().catch(() => stopAudio())
  }

  const handleSelect = (id: string) => {
    setSelectedId(id)
    onSelect(id)
    onOpenChange(false)
  }

  const handleNavigateToVoiceLibrary = () => {
    onOpenChange(false)
    navigate(routes.voiceLibrary)
  }

  const renderRow = (sample: VoiceSample) => {
    const isSelected = selectedId === sample.id
    const isPlaying = playingSampleId === String(sample.id)
    const canPlay = sample.id !== 'clone'
    const avatarUrl = avatarUrls.get(sample.id) || DEFAULT_AVATAR

    return (
      <VoiceSampleRowItem
        key={sample.id}
        sample={sample}
        avatarUrl={avatarUrl}
        isSelected={isSelected}
        isPlaying={isPlaying}
        canPlay={canPlay}
        onSelect={handleSelect}
        onPlay={(e, sample) => {
          void handlePlayPreview(e, sample)
        }}
      />
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[700px] max-h-[85vh] max-w-lg flex-col gap-0 overflow-hidden rounded-2xl border-none bg-gray-50 p-0 shadow-2xl ring-1 ring-black/5 md:rounded-3xl">
        <div className="z-10 flex flex-col border-b border-gray-200 bg-white p-4">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <DialogTitle className="text-lg font-bold tracking-tight text-gray-900">
                보이스 선택
              </DialogTitle>
              {trackLabel && (
                <p className="mt-1 text-xs text-gray-500">
                  <span className="font-semibold text-gray-900">{trackLabel}</span> 트랙에 적용할
                  목소리를 선택하세요.
                </p>
              )}
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex gap-2">
            <div className="group relative flex-1 transition-all">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-900" />
              <Input
                placeholder="어떤 목소리를 찾고 계신가요?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm transition-all focus-visible:border-violet-500 focus-visible:ring-1 focus-visible:ring-violet-500/20"
              />
            </div>

            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={cn(
                  'flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-all',
                  hasActiveFilters || isFilterOpen
                    ? 'border-violet-200 bg-violet-100 text-violet-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50',
                )}
              >
                <Filter className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">필터</span>
                {hasActiveFilters && (
                  <span className="ml-1 flex h-1.5 w-1.5 rounded-full bg-violet-600" />
                )}
              </button>

              {isFilterOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsFilterOpen(false)} />
                  <div className="absolute right-0 top-full z-20 mt-2 w-72 rounded-xl border border-gray-100 bg-white p-4 shadow-xl ring-1 ring-black/5 duration-200 animate-in fade-in zoom-in-95">
                    <div className="space-y-4">
                      <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                          언어
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            onClick={() => setSelectedLanguage(undefined)}
                            className={cn(
                              'rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
                              !selectedLanguage
                                ? 'border-violet-200 bg-violet-100 text-violet-700'
                                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50',
                            )}
                          >
                            전체
                          </button>
                          {languageResponse?.map((lang) => {
                            const flagCode = getCountryCode(lang.language_code)
                            return (
                              <button
                                key={lang.language_code}
                                onClick={() => setSelectedLanguage(lang.language_code)}
                                className={cn(
                                  'flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
                                  selectedLanguage === lang.language_code
                                    ? 'border-violet-200 bg-violet-100 text-violet-700'
                                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50',
                                )}
                              >
                                <ReactCountryFlag
                                  countryCode={flagCode}
                                  svg
                                  style={{ width: '0.875em', height: '0.875em' }}
                                  title={lang.name_ko}
                                />
                                {lang.name_ko}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                          카테고리
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            onClick={() => setSelectedCategory(undefined)}
                            className={cn(
                              'rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
                              !selectedCategory
                                ? 'border-violet-200 bg-violet-100 text-violet-700'
                                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50',
                            )}
                          >
                            전체
                          </button>
                          {VOICE_CATEGORIES.map((cat) => (
                            <button
                              key={cat.code}
                              onClick={() => setSelectedCategory(cat.code)}
                              className={cn(
                                'rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
                                selectedCategory === cat.code
                                  ? 'border-violet-200 bg-violet-100 text-violet-700'
                                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50',
                              )}
                            >
                              {cat.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
                        {hasActiveFilters && (
                          <Button
                            variant="outline"
                            onClick={handleResetFilters}
                            className="h-8 text-xs"
                            size="sm"
                          >
                            초기화
                          </Button>
                        )}
                        <Button
                          onClick={() => setIsFilterOpen(false)}
                          className="h-8 text-xs"
                          size="sm"
                        >
                          적용
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300 flex-1 overflow-y-auto bg-gray-50/50 p-2">
          {isLoading ? (
            <div className="flex h-60 items-center justify-center">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="space-y-6 pb-4">
              {(!searchQuery || filteredBuiltinSamples.length > 0) && (
                <div>
                  <div className="mx-2 mb-2 mt-2 flex items-center justify-between rounded-lg bg-gray-100/80 px-3 py-1.5">
                    <span className="text-xs font-bold text-gray-500">기본 보이스</span>
                    {!searchQuery && (
                      <span className="text-[10px] font-medium text-gray-400">
                        {filteredBuiltinSamples.length + 1}개
                      </span>
                    )}
                  </div>
                  {!searchQuery && renderRow(cloneSample)}
                  {filteredBuiltinSamples.length > 0 && (
                    <div className="space-y-1">{filteredBuiltinSamples.map(renderRow)}</div>
                  )}
                </div>
              )}

              {filteredMySamples.length > 0 && (
                <div>
                  <div className="mx-2 mb-2 mt-4 flex items-center justify-between rounded-lg bg-gray-100/80 px-3 py-1.5">
                    <span className="text-xs font-bold text-gray-500">내 보이스</span>
                    <span className="text-[10px] font-medium text-gray-400">
                      {filteredMySamples.length}개
                    </span>
                  </div>
                  <div className="space-y-1">{filteredMySamples.map(renderRow)}</div>
                </div>
              )}

              {filteredLibrarySamples.length > 0 && (
                <div>
                  <div className="mx-2 mb-2 mt-4 flex items-center justify-between rounded-lg bg-gray-100/80 px-3 py-1.5">
                    <span className="text-xs font-bold text-gray-500">라이브러리</span>
                    <span className="text-[10px] font-medium text-gray-400">
                      {filteredLibrarySamples.length}개
                    </span>
                  </div>
                  <div className="space-y-1">{filteredLibrarySamples.map(renderRow)}</div>
                </div>
              )}

              {filteredMySamples.length === 0 && filteredLibrarySamples.length === 0 && (
                <div className="flex h-64 flex-col items-center justify-center text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                    <Search className="h-8 w-8 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">검색 결과가 없습니다</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    다른 키워드나 필터로 다시 검색해보세요.
                  </p>
                  <Button
                    variant="ghost"
                    onClick={handleResetFilters}
                    className="mt-2 text-gray-900 hover:text-black"
                  >
                    필터 초기화
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 bg-white p-3">
          <Button
            className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-violet-600 text-sm font-semibold text-white shadow-md shadow-violet-200/50 transition-all hover:bg-violet-700 hover:shadow-lg hover:shadow-violet-200/50 active:scale-[0.99]"
            onClick={handleNavigateToVoiceLibrary}
          >
            <Plus className="h-3.5 w-3.5" />
            새로운 목소리 추가하기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
