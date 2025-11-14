import { useEffect, useState, useRef } from 'react'

import { Play, Pause } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import { routes } from '../../shared/config/routes'
import { trackEvent } from '../../shared/lib/analytics'
import { useAuthStore } from '../../shared/store/useAuthStore'
import { Button } from '../../shared/ui/Button'
import { Card, CardDescription, CardHeader, CardTitle } from '../../shared/ui/Card'
import WorkspacePage from '../workspace/WorkspacePage'

type SampleLanguage = 'ko' | 'en'

const previewVideo = '/media/welcom/preview.mp4'
const previewPoster = ''
const samples = {
  ko: { label: '한국어', audioSrc: '/media/welcom/korean_audio.mp3' },
  en: { label: 'English', audioSrc: '/media/welcom/english_audio.mp3' },
}


export default function HomePage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)  
  const [language, setLanguage] = useState<SampleLanguage>('en')
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRefs = useRef<Record<SampleLanguage, HTMLAudioElement> | null>(null)
  if (!audioRefs.current) {
    audioRefs.current = {
      ko: Object.assign(new Audio(samples.ko.audioSrc), { loop: true, preload: 'auto' }),
      en: Object.assign(new Audio(samples.en.audioSrc), { loop: true, preload: 'auto' }),
    }
  }
  const currentAudioLangRef = useRef<SampleLanguage>('en')
  const [currentAudioLang, setCurrentAudioLang] = useState<SampleLanguage>('en')

  const getActiveAudio = () => audioRefs.current?.[currentAudioLangRef.current]
  const [isPlaying, setIsPlaying] = useState(false)  

  // 인증 시
  useEffect(() => {
    if (isAuthenticated) {
      navigate(routes.workspace, { replace: true })
    }
  }, [isAuthenticated, navigate])

  if (isAuthenticated) {
    return <WorkspacePage />
  }

  // 재생/일시정지 버튼에서 비디오/오디오 함께 제어
  const playBoth = async (audioOverride?: HTMLAudioElement) => {
    const video = videoRef.current
    const audio = audioOverride ?? getActiveAudio()
    if (!video || !audio) return
    audio.currentTime = video.currentTime
    await Promise.all([video.play(), audio.play()])
    setIsPlaying(true)
  }

  const pauseBoth = () => {
    videoRef.current?.pause()
    getActiveAudio()?.pause()
    setIsPlaying(false)
  }
  const togglePlay = () => {
    if (isPlaying) {
      pauseBoth()
      return
    }
    void playBoth()
  }

  const updateAudioLanguage = (lang: SampleLanguage) => {
    currentAudioLangRef.current = lang
    setCurrentAudioLang(lang)
  }

  // 언어 전환 버튼
  const switchLanguage = (lang: SampleLanguage) => {
    if (!audioRefs.current || !videoRef.current || lang === currentAudioLang) return

    const video = videoRef.current
    const nextAudio = audioRefs.current[lang]
    const prevAudio = getActiveAudio()   

    prevAudio?.pause()
    video.currentTime = 0
    nextAudio.currentTime = 0

    updateAudioLanguage(lang)
    setLanguage(lang)

    if (isPlaying) {
    void playBoth(nextAudio)
    }
  }
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-6 py-16">
      <section className="space-y-10 lg:space-y-14">
        <div className="space-y-6 text-center">
          <h1 className="text-foreground text-balance text-4xl font-semibold leading-tight md:text-5xl">
            AI 기반 자동 더빙으로 <br className="hidden md:inline" />
            글로벌 콘텐츠를 만드세요
          </h1>
          <p className="text-muted text-lg leading-relaxed">
            원본 영상을 선택한 언어로 자동 더빙하여 전 세계 시청자에게 전달하세요. 자연스러운 음성과
            정확한 타이밍의 영상을 만들어 드립니다.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              size="lg"
              onClick={() => trackEvent('sample_play', { lang: language })}
              className="group px-6"
            >
              <Play className="h-4 w-4 transition-transform group-hover:scale-110" />
              <Link to={routes.login}>Get started</Link>
            </Button>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-4xl">
          <div className="border-surface-3 bg-surface-1 relative w-full overflow-hidden rounded-3xl border shadow-soft">
            <div
              className={`absolute inset-0 bg-gradient-to-br opacity-80`}
            />
            <div className="relative">
              <div className="pb-[56.25%]" />
              <div className="absolute inset-0 flex flex-col justify-between p-6 text-white">
                <div className="flex flex-wrap items-start justify-between gap-4">
                </div>
                <div className="relative mt-6 w-full overflow-hidden rounded-2xl bg-black/40">
                <video
                  ref={videoRef}
                  muted
                  playsInline
                  className="h-full w-full object-cover"
                  src={previewVideo}
                  poster={previewPoster}
                />
                  <div className="absolute inset-x-0 bottom-6 z-20 flex justify-center gap-4">
                  {(['ko', 'en'] as SampleLanguage[]).map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation()
                        void switchLanguage(code)
                      }}
                      className={`pointer-events-auto flex h-8 w-20 items-center justify-center rounded-full text-sm font-semibold transition
                        ${code === language ? 'bg-white text-black shadow-lg' : 'bg-black/60 text-white/80'}`}
                      aria-label={`${samples[code].label} 선택`}
                    >
                      {samples[code].label}
                    </button>
                  ))}
                  </div>
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="absolute inset-0 z-10 flex items-center justify-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-black/60 text-white shadow-lg transition hover:scale-105">
                      {isPlaying ? <Pause size={36} /> : <Play size={36} />}
                    </div>
                  </button>    
                </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-white/70">
                      Preview Language
                    </p>
                  </div>                
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {[
          {
            title: 'AI 자동 더빙 (Upload & Dub)',
            description:
              '당신의 유튜브 링크를 붙여넣으세요. AI가 당신의 콘텐츠를 즉시 분석하여, 여러 타겟 언어(영어, 일본어 등)의 더빙 초안을 단 몇 분 만에 생성합니다.',
          },
          {
            title: '간편한 더빙 에디터 (Edit & Apply)',
            description:
              '클릭 한 번으로 수정하세요. 웹 에디터에서 텍스트를 수정하고, 오디오트랙을 드래그하여 타이밍을 조절하세요.',
          },
          {
            title: '즉시 글로벌 배포 (Publish & Grow)',
            description:
              '새로운 1억 명의 시청자를 만나보세요. 완성된 다국어 더빙 오디오 트랙을 다운로드하여, 당신의 유튜브 채널 다국어 오디오 기능에 바로 업로드하세요.',
          },
        ].map((item) => (
          <Card key={item.title} className="border-surface-4 bg-surface-1/80 border p-6">
            <CardHeader className="mb-3">
              <CardTitle>{item.title}</CardTitle>
            </CardHeader>
            <CardDescription className="text-muted text-base leading-relaxed">
              {item.description}
            </CardDescription>
          </Card>
        ))}
      </section>
    </div>
  )
}
