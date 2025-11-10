import { useEffect, useMemo, useRef, useState } from 'react'

import { Search, Waves } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import type { VoiceSample } from '@/entities/voice-sample/types'
import { VoiceSampleCard } from '@/features/voice-samples/components/VoiceSampleCard'
import { useVoiceSamples } from '@/features/voice-samples/hooks/useVoiceSamples'
import { VoiceSampleCreationModal } from '@/features/voice-samples/modals/VoiceSampleCreationModal'
import { env } from '@/shared/config/env'
import { useAuthStore } from '@/shared/store/useAuthStore'
import { Checkbox } from '@/shared/ui/Checkbox'
import { Input } from '@/shared/ui/Input'
import { Label } from '@/shared/ui/Label'
import { Spinner } from '@/shared/ui/Spinner'

export default function VoiceSamplesPage() {
  const { data, isLoading } = useVoiceSamples()
  const [searchTerm, setSearchTerm] = useState('')
  const [showMySamples, setShowMySamples] = useState(true)
  const [showFavorites, setShowFavorites] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSample, setSelectedSample] = useState<VoiceSample | null>(null)

  // 현재 재생 중인 오디오 추적
  const currentAudioRef = useRef<HTMLAudioElement | null>(null)
  const [playingSampleId, setPlayingSampleId] = useState<string | null>(null)
  // Audio 객체 캐시 제거 (이전 코드에서 삭제)

  // Audio 객체 정리 함수
  const cleanupAudio = (audio: HTMLAudioElement | null) => {
    if (!audio) return

    // 재생 정지
    audio.pause()
    audio.currentTime = 0

    // 이벤트 리스너 제거를 위해 새 Audio 객체로 교체
    // src를 비워서 메모리 해제
    audio.src = ''
    audio.load()
  }

  const handlePlay = (sample: VoiceSample) => {
    // id가 없으면 재생 불가
    if (!sample.id) {
      console.warn('음성 샘플 ID가 없습니다:', sample)
      return
    }

    // id 비교를 위해 문자열로 변환
    const sampleId = String(sample.id)

    // 같은 샘플이 재생 중이면 정지
    if (playingSampleId && String(playingSampleId) === sampleId && currentAudioRef.current) {
      cleanupAudio(currentAudioRef.current)
      currentAudioRef.current = null
      setPlayingSampleId(null)
      return
    }

    // 다른 샘플이 재생 중이면 먼저 정리
    if (currentAudioRef.current) {
      cleanupAudio(currentAudioRef.current)
      currentAudioRef.current = null
      setPlayingSampleId(null)
    }

    // 음성 파일 URL 결정: audio_sample_url > file_path_wav (storage API) > previewUrl
    let audioUrl: string | undefined

    if (sample.audio_sample_url) {
      audioUrl = sample.audio_sample_url
    } else if (sample.file_path_wav) {
      const apiBase = env.apiBaseUrl.startsWith('http')
        ? `${env.apiBaseUrl}/api`
        : env.apiBaseUrl || '/api'
      const pathSegments = sample.file_path_wav.split('/')
      const encodedPath = pathSegments.map((segment) => encodeURIComponent(segment)).join('/')
      audioUrl = `${apiBase}/storage/media/${encodedPath}`
    } else if (sample.previewUrl) {
      audioUrl = sample.previewUrl
    }

    if (!audioUrl) {
      console.warn('음성 파일 URL을 찾을 수 없습니다:', sample)
      return
    }

    // Audio 객체 생성 및 재생
    const audio = new Audio(audioUrl)
    currentAudioRef.current = audio
    setPlayingSampleId(sampleId)

    // 재생 종료 시 정리
    audio.addEventListener('ended', () => {
      cleanupAudio(currentAudioRef.current)
      currentAudioRef.current = null
      setPlayingSampleId(null)
    })

    // 재생 시작
    audio.play().catch((error) => {
      console.error('음성 파일 재생 실패:', error)
      cleanupAudio(currentAudioRef.current)
      currentAudioRef.current = null
      setPlayingSampleId(null)
    })
  }

  // 컴포넌트 언마운트 시 오디오 정리
  useEffect(() => {
    return () => {
      if (currentAudioRef.current) {
        cleanupAudio(currentAudioRef.current)
        currentAudioRef.current = null
        setPlayingSampleId(null)
      }
    }
  }, [])

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const navigate = useNavigate()

  const filteredSamples = useMemo(() => {
    const samples = data?.samples || []
    let filtered = samples

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase()
      filtered = filtered.filter(
        (sample) =>
          sample.name.toLowerCase().includes(term) ||
          sample.description?.toLowerCase().includes(term) ||
          sample.attributes?.toLowerCase().includes(term),
      )
    }

    // My samples filter (show all if checked)
    if (!showMySamples) {
      // TODO: 실제로는 사용자 소유 샘플만 필터링
      filtered = []
    }

    // Favorites filter
    if (!showFavorites) {
      filtered = filtered.filter((sample) => !sample.isFavorite)
    }

    return filtered
  }, [data?.samples, searchTerm, showMySamples, showFavorites])

  if (!isAuthenticated) {
    navigate('/auth/login', { replace: true })
    return null
  }

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-10 px-12 py-12">
      <section className="flex-1 space-y-10">
        {/* Create Voice Sample Button */}
        <button
          type="button"
          className="bg-primary text-primary-foreground hover:bg-primary shadow-primary/30 translation hover:bg-primary-hover flex h-28 w-full items-center gap-4 rounded-[24px] px-8 text-left text-2xl font-semibold text-white shadow-lg outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
          onClick={() => setIsModalOpen(true)}
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-white">
            <Waves className="h-10 w-10" aria-hidden />
          </span>

          <div className="flex flex-col gap-1">
            <span className="leading-tight">음성샘플 만들기</span>
            <span className="text-sm leading-tight">나만의 음성 샘플을 만들어보세요</span>
          </div>
        </button>

        {/* Search Bar */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="text-muted pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="음성샘플 검색"
              className="h-14 rounded-[999px] pl-14 pr-6 text-base shadow-soft"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="my-samples"
                checked={showMySamples}
                onCheckedChange={(checked) => setShowMySamples(checked === true)}
              />
              <Label htmlFor="my-samples" className="cursor-pointer text-sm">
                내 샘플
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="favorites"
                checked={showFavorites}
                onCheckedChange={(checked) => setShowFavorites(checked === true)}
              />
              <Label htmlFor="favorites" className="cursor-pointer text-sm">
                즐겨찾기
              </Label>
            </div>
          </div>
        </div>

        {/* Voice Samples Grid */}
        {isLoading ? (
          <div className="border-surface-3 bg-surface-1 flex items-center justify-center rounded-3xl border py-20">
            <Spinner size="lg" />
            <span className="text-muted ml-3 text-sm">음성샘플 불러오는 중…</span>
          </div>
        ) : filteredSamples.length === 0 ? (
          <div className="border-surface-3 bg-surface-1 flex flex-col items-center justify-center rounded-3xl border py-20">
            <Waves className="text-muted h-12 w-12" />
            <p className="text-muted mt-4 text-sm">음성샘플이 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredSamples.map((sample, index) => {
              // 고유한 key 생성: id가 있으면 사용, 없으면 index 사용
              const uniqueKey = sample.id ? `${sample.id}-${index}` : `sample-${index}`
              // id 비교를 위해 문자열로 변환 (id가 없으면 undefined 처리)
              const sampleId = sample.id ? String(sample.id).trim() : undefined
              const isSelected =
                selectedSample?.id && sampleId
                  ? String(selectedSample.id).trim() === sampleId
                  : false
              const isPlaying =
                playingSampleId && sampleId ? String(playingSampleId).trim() === sampleId : false

              return (
                <VoiceSampleCard
                  key={uniqueKey}
                  sample={sample}
                  isSelected={isSelected}
                  isPlaying={isPlaying}
                  onSelect={setSelectedSample}
                  onPlay={handlePlay}
                />
              )
            })}
          </div>
        )}
      </section>

      <VoiceSampleCreationModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  )
}
