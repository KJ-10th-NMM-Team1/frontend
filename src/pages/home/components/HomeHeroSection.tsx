import { useEffect, useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import { Link } from 'react-router-dom'

import { routes } from '@/shared/config/routes'
import { trackEvent } from '@/shared/lib/analytics'
import { Button } from '@/shared/ui/Button'

type SampleLanguage = 'ko' | 'en'

interface HomeHeroSectionProps {
  title: React.ReactNode
  description: string
  videoSrc: string
  videoPoster?: string
  samples: {
    ko: { label: string; audioSrc: string }
    en: { label: string; audioSrc: string }
  }
}

export function HomeHeroSection({
  title,
  description,
  videoSrc,
  videoPoster,
  samples,
}: HomeHeroSectionProps) {
  const [language, setLanguage] = useState<SampleLanguage>('ko')
  const [isPlaying, setIsPlaying] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRefs = useRef<Record<SampleLanguage, HTMLAudioElement> | null>(null)
  const currentAudioLangRef = useRef<SampleLanguage>('ko')

  // 오디오 객체 초기화
  useEffect(() => {
    audioRefs.current = {
      ko: Object.assign(new Audio(samples.ko.audioSrc), { loop: true, preload: 'auto' }),
      en: Object.assign(new Audio(samples.en.audioSrc), { loop: true, preload: 'auto' }),
    }

    return () => {
      // 컴포넌트 언마운트 시 오디오 정지
      if (audioRefs.current) {
        Object.values(audioRefs.current).forEach(audio => audio.pause())
      }
    }
  }, [samples])

  const getActiveAudio = () => audioRefs.current?.[currentAudioLangRef.current]

  const playBoth = async (audioOverride?: HTMLAudioElement) => {
    const video = videoRef.current
    const audio = audioOverride ?? getActiveAudio()
    if (!video || !audio) return
    
    // 비디오와 오디오 싱크 맞추기
    if (Math.abs(audio.currentTime - video.currentTime) > 0.1) {
       audio.currentTime = video.currentTime
    }
    
    try {
      await Promise.all([video.play(), audio.play()])
      setIsPlaying(true)
    } catch (err) {
      console.error('Playback failed:', err)
      setIsPlaying(false)
    }
  }

  const pauseBoth = () => {
    videoRef.current?.pause()
    getActiveAudio()?.pause()
    setIsPlaying(false)
  }

  const togglePlay = () => {
    if (isPlaying) {
      pauseBoth()
    } else {
      void playBoth()
    }
  }

  const switchLanguage = (lang: SampleLanguage) => {
    if (!audioRefs.current || !videoRef.current || lang === language) return

    const video = videoRef.current
    const nextAudio = audioRefs.current[lang]
    const prevAudio = getActiveAudio()

    prevAudio?.pause()
    
    // 시간 동기화 (비디오 기준)
    nextAudio.currentTime = video.currentTime

    currentAudioLangRef.current = lang
    setLanguage(lang)

    if (isPlaying) {
      void playBoth(nextAudio)
    }
  }

  return (
    <section className="space-y-10 lg:space-y-14">
      <div className="space-y-6 text-center">
        <h1 className="text-foreground text-balance text-4xl font-semibold leading-tight md:text-5xl">
          {title}
        </h1>
        <p className="text-muted text-lg leading-relaxed">
          {description}
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
          <div className={`absolute inset-0 bg-gradient-to-br opacity-80`} />
          <div className="relative">
            <div className="pb-[56.25%]" />
            <div className="absolute inset-0 flex flex-col justify-between p-6 text-white">
              <div className="flex flex-wrap items-start justify-between gap-4"></div>
              <div className="relative mt-6 w-full overflow-hidden rounded-2xl bg-black/40">
                <video
                  ref={videoRef}
                  muted
                  playsInline
                  className="h-full w-full object-cover"
                  src={videoSrc}
                  poster={videoPoster}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
                <div className="absolute inset-x-0 bottom-6 z-20 flex justify-center gap-4">
                  {(['ko', 'en'] as SampleLanguage[]).map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation()
                        switchLanguage(code)
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
                  className="absolute inset-0 z-10 flex items-center justify-center"
                >
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
  )
}
