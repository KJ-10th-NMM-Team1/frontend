import { useEffect, useMemo, useRef, useState } from 'react'

import { cn } from '@/shared/lib/utils'

import { WavyBackground } from './AudioWaveBackground'
import './audio-toggle.css'

export interface Speaker {
  id: string
  name: string
  language: string
  avatarColor: string
  audioSrc: string
}

export interface AudioScript {
  language: string
  label: string
  text: string
  speakers: Speaker[]
}

interface HomeAudioComparisonSectionProps {
  title: string
  description: string
  scripts: AudioScript[]
}

export function HomeAudioComparisonSection({
  title,
  description,
  scripts,
}: HomeAudioComparisonSectionProps) {
  const [selectedLangIndex, setSelectedLangIndex] = useState(0)
  const [activeSpeakerId, setActiveSpeakerId] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const currentScript = scripts[selectedLangIndex]

  // 언어가 바뀌면 화자 선택 초기화 및 오디오 정지
  useEffect(() => {
    stopAudio()
    setActiveSpeakerId(null)
  }, [selectedLangIndex])

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setIsPlaying(false)
  }

  const playSpeaker = (speaker: Speaker) => {
    if (activeSpeakerId === speaker.id) {
      if (isPlaying) {
        audioRef.current?.pause()
        setIsPlaying(false)
      } else {
        const currentAudio = audioRef.current
        if (currentAudio) {
          void currentAudio
            .play()
            .then(() => setIsPlaying(true))
            .catch((error) => {
              console.error('Audio playback failed', error)
              setIsPlaying(false)
            })
        }
      }
      return
    }

    stopAudio()
    
    const audio = new Audio(speaker.audioSrc)
    audio.onended = () => setIsPlaying(false)
    audioRef.current = audio
    
    setActiveSpeakerId(speaker.id)
    void audio
      .play()
      .then(() => setIsPlaying(true))
      .catch((error) => {
        console.error('Audio playback failed', error)
        setIsPlaying(false)
      })
  }

  const waveColors = useMemo(
    () => ['#8583fdff', '#60a5fa', '#74b0f5ff', '#a4f6fcff'],
    [],
  )

  return (
    // ★ 수정된 부분: <section> 대신 <WavyBackground>가 감싸줍니다.
    <WavyBackground
      // 1. 전체 섹션의 높이와 배경 설정 (다시 화이트 배경으로 복구)
      containerClassName="relative overflow-hidden py-16 lg:py-24 bg-white" 
      // 2. 내부 컨텐츠의 최대 너비 설정 (기존 div className 역할)
      className="mx-auto max-w-7xl px-6"
      // 3. 파형 디자인 커스텀
      colors={waveColors}
      
      // 배경색 (파도 뒤에 깔리는 색)
      backgroundFill="white"
      waveOpacity={0.3} 
      blur={10}
      speed="fast"
      waveWidth={50}
    >

      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-gray-900">{title}</h2>
        <p className="mt-4 text-lg text-gray-500">{description}</p>
      </div>

      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Left: Script & Language Selector */}
        <div className="flex flex-col gap-6">
          <div className="flex gap-2">
            {scripts.map((script, idx) => (
              <button
                key={script.language}
                onClick={() => setSelectedLangIndex(idx)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors z-10",
                  selectedLangIndex === idx
                    ? "bg-primary text-primary-foreground"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {script.label}
              </button>
            ))}
          </div>

          {/* 1. Outer Box: Glassmorphism (투명한 유리) - 복구됨 */}
          <div className="relative w-full min-h-[320px] overflow-hidden rounded-[2.5rem] bg-white/5 p-4 sm:p-4 shadow-[20px_20px_40px_rgba(15,23,42,0.25)]">

            {/* ★ [치트키 1] 유리 뒤에 숨겨진 '오로라' (이게 비쳐야 유리처럼 보입니다) */}
            <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur-3xl" />

            {/* 2. 내부 컨텐츠 배치 */}
            <div className="relative z-10 flex h-full flex-col gap-5">
              
              {/* A. 상단: 텍스트 박스 - Neomorphism Inner (파인 효과) - 유지됨 */}
              <div className="flex-1 flex items-center justify-center rounded-[2rem] bg-[#f2f2f2] p-8 shadow-[inset_8px_8px_10px_#bebebe,inset_-20px_-20px_60px_#ffffff]">
                {/* 
                  - bg-[#e0e5ec]: 뉴모피즘 기본 배경색 (불투명)
                  - shadow-[inset_...]: 안쪽으로 파인 듯한 입체감 (Inner Shadow)
                */}
                <p className="text-xl font-medium leading-relaxed text-gray-700">
                  "{currentScript.text}"
                </p>
              </div>

              {/* B. 하단: Footer */}
              <div className="flex items-center justify-end gap-2 px-4 opacity-70">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Powered by Dupilot
                </span>
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                </span>
              </div>

            </div>
          </div>
        </div>

        {/* Right: Speaker List */}
        <div className="flex flex-col justify-center gap-4">
          <h3 className="text-lg font-semibold text-gray-900">Select a Voice</h3>
          <div className="grid gap-3">
            {currentScript.speakers.map((speaker) => {
              const isActive = activeSpeakerId === speaker.id

              return (
                <div
                  key={speaker.id}
                  className={cn(
                    // 기본 글래스 카드 스타일
                    "group flex items-center justify-between rounded-2xl border border-white/20 bg-white/10 p-4",
                    "backdrop-blur-xl shadow-[0_12px_35px_rgba(15,23,42,0.35)] transition-all duration-200",
                    // 상태별 스타일
                    isActive
                      ? "border-primary/70 bg-white/20 shadow-[0_18px_45px_rgba(37,99,235,0.55)]"
                      : "hover:bg-white/15 hover:border-white/40 hover:shadow-[0_16px_40px_rgba(15,23,42,0.45)]"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="flex h-12 w-12 items-center justify-center rounded-full text-white shadow-md ring-2 ring-white/40"
                      style={{ backgroundColor: speaker.avatarColor }}
                    >
                      {speaker.name.charAt(0)}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-900">{speaker.name}</div>
                      <div className="text-sm text-gray-500">Natural AI Voice</div>
                    </div>
                  </div>
                  
                  {/* Custom Toggle Button */}
                  <div className="toggle-cont scale-75 origin-right">
                    <input 
                      className="toggle-input" 
                      type="checkbox" 
                      checked={isActive && isPlaying}
                      readOnly
                    />
                    <label 
                      className="toggle-label" 
                      onClick={(e) => {
                        e.stopPropagation()
                        playSpeaker(speaker)
                      }}
                    >
                      <div className="cont-label-play">
                        <span className="label-play"></span>
                      </div>
                    </label>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </WavyBackground>
  )
}
