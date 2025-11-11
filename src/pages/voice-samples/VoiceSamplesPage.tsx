import { useEffect, useMemo, useRef, useState } from 'react'

import { useQuery } from '@tanstack/react-query'
import { Search, Waves } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import type { VoiceSample } from '@/entities/voice-sample/types'
import { getCurrentUser } from '@/features/auth/api/authApi'
import { VoiceSampleCard } from '@/features/voice-samples/components/VoiceSampleCard'
import { useVoiceSamples } from '@/features/voice-samples/hooks/useVoiceSamples'
import { VoiceSampleCreationModal } from '@/features/voice-samples/modals/VoiceSampleCreationModal'
import { VoiceSampleEditModal } from '@/features/voice-samples/modals/VoiceSampleEditModal'
import { env } from '@/shared/config/env'
import { useAuthStore } from '@/shared/store/useAuthStore'
import { Checkbox } from '@/shared/ui/Checkbox'
import { Input } from '@/shared/ui/Input'
import { Label } from '@/shared/ui/Label'
import { Spinner } from '@/shared/ui/Spinner'

export default function VoiceSamplesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showMySamplesOnly, setShowMySamplesOnly] = useState(false)
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedSample, setSelectedSample] = useState<VoiceSample | null>(null)
  const [editingSample, setEditingSample] = useState<VoiceSample | null>(null)

  // 현재 사용자 정보를 부모에서 한 번만 조회
  const { data: currentUser } = useQuery({
    queryKey: ['auth', 'current-user'],
    queryFn: getCurrentUser,
    staleTime: Infinity,
  })

  // 체크박스가 체크되면 해당 필터를 적용하여 API 호출
  const { data, isLoading } = useVoiceSamples({
    favoritesOnly: showFavoritesOnly,
    mySamplesOnly: showMySamplesOnly,
    q: searchTerm.trim() || undefined,
  })

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

  const handlePlay = async (sample: VoiceSample) => {
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

    // presigned URL을 가져오는 헬퍼 함수
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

    if (sample.audio_sample_url) {
      // audio_sample_url이 /api/storage/media/로 시작하면 presigned URL 가져오기
      if (
        sample.audio_sample_url.startsWith('/api/storage/media/') ||
        sample.audio_sample_url.includes('/storage/media/')
      ) {
        const path = sample.audio_sample_url.replace(/^.*\/storage\/media\//, '')
        audioUrl = await getPresignedUrl(path)
      } else {
        // 이미 presigned URL이거나 직접 접근 가능한 URL
        audioUrl = sample.audio_sample_url
      }
    } else if (sample.file_path_wav) {
      // storage/media 엔드포인트에서 presigned URL 가져오기
      audioUrl = await getPresignedUrl(sample.file_path_wav)
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

  // API에서 이미 필터링된 데이터를 사용
  const filteredSamples = useMemo(() => {
    return data?.samples || []
  }, [data?.samples])

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
                checked={showMySamplesOnly}
                onCheckedChange={(checked) => setShowMySamplesOnly(checked === true)}
              />
              <Label htmlFor="my-samples" className="cursor-pointer text-sm">
                내 샘플
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="favorites"
                checked={showFavoritesOnly}
                onCheckedChange={(checked) => setShowFavoritesOnly(checked === true)}
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
            {filteredSamples.map((sample) => {
              // id 비교를 위해 문자열로 변환
              const sampleId = sample.id ? String(sample.id).trim() : undefined
              const isSelected =
                selectedSample?.id && sampleId
                  ? String(selectedSample.id).trim() === sampleId
                  : false
              const isPlaying =
                playingSampleId && sampleId ? String(playingSampleId).trim() === sampleId : false

              // owner 여부를 부모에서 계산하여 prop으로 전달
              const currentUserId = currentUser ? String(currentUser._id || '') : null
              const ownerId = sample.owner_id ? String(sample.owner_id) : null
              const isOwner = currentUserId && ownerId && currentUserId === ownerId

              return (
                <VoiceSampleCard
                  key={sample.id}
                  sample={sample}
                  isSelected={isSelected}
                  isPlaying={isPlaying}
                  isOwner={isOwner}
                  onSelect={setSelectedSample}
                  onPlay={handlePlay}
                  onEdit={(sample) => {
                    setEditingSample(sample)
                    setIsEditModalOpen(true)
                  }}
                />
              )
            })}
          </div>
        )}
      </section>

      <VoiceSampleCreationModal open={isModalOpen} onOpenChange={setIsModalOpen} />
      <VoiceSampleEditModal
        open={isEditModalOpen}
        onOpenChange={(open) => {
          setIsEditModalOpen(open)
          if (!open) {
            setEditingSample(null)
          }
        }}
        sample={editingSample}
      />
    </div>
  )
}
