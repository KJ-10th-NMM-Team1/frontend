import { useRef, useState, useEffect } from 'react'

import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'

import { TextReveal } from '@/shared/ui/TextReveal'

import { EditorFeaturesBackground } from './EditorFeaturesBackground'

// -----------------------------------------------------------------------------
// 3D Configuration (User Adjustable)
// -----------------------------------------------------------------------------
const VIDEO_CONFIG = {
  rotateX: 0,    // 기본 위아래 기울기 (0 = 정면)
  rotateY: 12,   // 좌우 기울기 (양수: 왼쪽이 가깝게, 음수: 오른쪽이 가깝게)
  rotateZ: -2,   // 회전 기울기 (양수: 시계방향, 음수: 반시계방향)
  perspective: 1200, // 원근감 깊이 (작을수록 왜곡이 심함)
}

export interface FeatureItem {
  title: string
  description: string
  mediaSrc: string
  mediaType: 'video' | 'image'
}

interface HomeEditorFeaturesSectionProps {
  title: string
  description: string
  features: FeatureItem[]
}

export function HomeEditorFeaturesSection({
  title,
  description,
  features,
}: HomeEditorFeaturesSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  // ---------------------------------------------------------------------------
  // Slide-in Background Transition
  // ---------------------------------------------------------------------------
  // 오른쪽에서 밤색깔 화면이 튀어나오도록 애니메이션 (진입)
  // 그리고 마지막에 왼쪽으로 나가도록 애니메이션 (퇴장)
  const backgroundX = useTransform(
    scrollYProgress,
    [0, 0.05, 0.95, 1], // 진입(0~5%), 유지(5~95%), 퇴장(95~100%)
    ['100%', '0%', '0%', '-100%']
  )

  return (
    <motion.section 
      ref={containerRef} 
      className="relative h-[600vh]"
    >
      {/* 
        Sticky Container: 
        배경은 여기서 고정됩니다 (Static Background).
        내용물만 스크롤에 따라 교체됩니다.
      */}
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden perspective-1000">
        
        {/* Sliding Dark Background */}
        <motion.div 
            className="absolute inset-0 bg-[#111111] z-0"
            style={{ x: backgroundX }}
        />

        {/* Three.js Shooting Star Background (Fade In & Out) */}
        <motion.div 
          className="absolute inset-0 z-0"
          style={{ opacity: useTransform(scrollYProgress, [0, 0.15, 0.95, 1], [0, 1, 1, 0]) }}
        >
          <EditorFeaturesBackground scrollYProgress={scrollYProgress} />
        </motion.div>

        {/* Static Background Elements (Optional Texture) */}
        <motion.div 
            style={{ opacity: useTransform(scrollYProgress, [0, 0.1, 0.95, 1], [0, 1, 1, 0]) }}
            className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.05)_0%,_rgba(0,0,0,0)_100%)] pointer-events-none z-0" 
        />
        
        {/* Features Stack (Drum) */}
        <div className="relative h-full w-full px-6 md:px-12 lg:px-24">
          {features.map((feature, index) => {
            // Calculate range for this feature
            // 첫 번째 아이템에 약간의 버퍼(0.05)를 두어, 스크롤이 시작된 후에 애니메이션이 시작되도록 함
            const rangeStart = index === 0 ? 0.05 : index * (1 / features.length)
            const rangeEnd = (index + 1) * (1 / features.length)
            
            return (
              <FeatureSlide
                key={index}
                feature={feature}
                index={index}
                total={features.length}
                scrollYProgress={scrollYProgress}
                range={[rangeStart, rangeEnd]}
              />
            )
          })}
        </div>
      </div>
    </motion.section>
  )
}

interface FeatureSlideProps {
  feature: FeatureItem
  index: number
  total: number
  scrollYProgress: MotionValue<number>
  range: [number, number]
}

function FeatureSlide({ feature, index, total, scrollYProgress, range }: FeatureSlideProps) {
  const [start, end] = range
  const duration = end - start
  
  // Initialize based on current scroll position
  const [isActive, setIsActive] = useState(() => {
    const current = scrollYProgress.get()
    // 0.95 이상이면 섹션 퇴장이므로 비활성화 (TextReveal 퇴장 애니메이션 트리거)
    return current >= start && current <= end && current < 0.95
  })

  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (latest) => {
      // 0.95 이상이면 섹션 퇴장이므로 비활성화
      const isVisible = latest >= start && latest <= end && latest < 0.95
      if (isVisible !== isActive) {
        setIsActive(isVisible)
      }
    })
    return unsubscribe
  }, [scrollYProgress, start, end, isActive])
  
  // ---------------------------------------------------------------------------
  // Scroll Hold Logic (Plateau)
  // ---------------------------------------------------------------------------
  // 등장(25%) -> 유지(50%) -> 퇴장(25%)
  // 유지 구간을 충분히 확보
  const enterEnd = start + duration * 0.25
  const exitStart = end - duration * 0.25

  // ---------------------------------------------------------------------------
  // 1. Video Animation (Vertical Slide)
  // ---------------------------------------------------------------------------
  const videoOpacity = useTransform(
    scrollYProgress,
    [start, enterEnd, exitStart, end],
    [0, 1, 1, 0]
  )

  const videoY = useTransform(
    scrollYProgress,
    [start, enterEnd, exitStart, end],
    ['100%', '0%', '0%', '-100%']
  )

  const videoScale = useTransform(
    scrollYProgress,
    [start, enterEnd, exitStart, end],
    [0.9, 1, 1, 0.9]
  )

  // ---------------------------------------------------------------------------
  // 2. Text Animation (Staggered & Slower)
  // ---------------------------------------------------------------------------
  // 텍스트는 우측에서 천천히 들어옴.
  // Title이 먼저 들어오고, Description이 뒤따라 들어옴 (Stagger).
  

  return (
    <div className="absolute inset-0 flex h-full w-full items-center justify-center pointer-events-none">
      <div className="flex h-full w-full max-w-7xl items-center justify-between gap-8 md:gap-16">
        
        {/* Left: 3D Floating Media (55%) - Drum Effect */}
        <div 
          className="relative flex h-full w-[55%] items-center justify-center"
          style={{ perspective: `${VIDEO_CONFIG.perspective}px` }}
        >
          <motion.div
            style={{
              opacity: videoOpacity,
              y: videoY,
              scale: videoScale,
              rotateY: VIDEO_CONFIG.rotateY,
              rotateZ: VIDEO_CONFIG.rotateZ,
            }}
            className="relative aspect-[4/3] w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-gray-900 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          >
            {/* Glass Reflection Overlay */}
            <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-tr from-white/10 to-transparent opacity-40" />
            
            {feature.mediaType === 'video' ? (
              <video
                src={feature.mediaSrc}
                className="h-full w-full object-cover opacity-90"
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              <img
                src={feature.mediaSrc}
                alt={feature.title}
                className="h-full w-full object-cover opacity-90"
              />
            )}
          </motion.div>
        </div>

        {/* Right: Text (45%) - Staggered Slide In */}
        <div className="flex h-full w-[45%] flex-col pt-[42vh] px-4 text-white">
          

          {/* Title */}
          <div
            className="mb-6 flex items-center gap-4"
          >
            <span className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-lg font-bold shadow-lg transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
              {index + 1}
            </span>
            <h3 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl drop-shadow-lg">
              <TextReveal text={feature.title} delay={200} repeat={true} trigger={isActive} />
            </h3>
          </div>

          {/* Description */}
          <div
            className="whitespace-pre-wrap text-lg leading-relaxed text-gray-300 md:text-xl drop-shadow-md"
          >
            <TextReveal text={feature.description} delay={400} mode="word" staggerMode="oddEven" repeat={true} trigger={isActive} />
          </div>

        </div>

      </div>
    </div>
  )
}
