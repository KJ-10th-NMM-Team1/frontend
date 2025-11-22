import { useRef } from 'react'

import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'

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
  // Smooth Background Transition
  // ---------------------------------------------------------------------------
  // 섹션 진입 시 화이트(#ffffff)에서 다크 그레이(#111111)로 서서히 변경
  // 스크롤의 앞부분(0 ~ 0.1) 구간 동안 색상 변경
  const backgroundColor = useTransform(
    scrollYProgress,
    [0, 0.1],
    ['#ffffff', '#111111']
  )

  return (
    <motion.section 
      ref={containerRef} 
      className="relative h-[600vh]"
      style={{ backgroundColor }} // 배경색 애니메이션 적용
    >
      {/* 
        Sticky Container: 
        배경은 여기서 고정됩니다 (Static Background).
        내용물만 스크롤에 따라 교체됩니다.
      */}
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden perspective-1000">
        
        {/* Three.js Shooting Star Background (Fade In) */}
        <motion.div 
          className="absolute inset-0"
          style={{ opacity: useTransform(scrollYProgress, [0, 0.15], [0, 1]) }}
        >
          <EditorFeaturesBackground scrollYProgress={scrollYProgress} />
        </motion.div>

        {/* Static Background Elements (Optional Texture) */}
        {/* 배경색이 변하므로 텍스처는 투명도 조절하거나 제거 */}
        <motion.div 
            style={{ opacity: useTransform(scrollYProgress, [0, 0.1], [0, 1]) }}
            className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.05)_0%,_rgba(0,0,0,0)_100%)] pointer-events-none" 
        />
        
        {/* Features Stack (Drum) */}
        <div className="relative h-full w-full px-6 md:px-12 lg:px-24">
          {features.map((feature, index) => {
            // Calculate range for this feature
            const rangeStart = index * (1 / features.length)
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
  
  // ---------------------------------------------------------------------------
  // Scroll Hold Logic (Plateau)
  // ---------------------------------------------------------------------------
  // 등장(25%) -> 유지(50%) -> 퇴장(25%)
  // 유지 구간을 충분히 확보
  const enterEnd = start + duration * 0.25
  const exitStart = end - duration * 0.25

  // ---------------------------------------------------------------------------
  // 1. Video Animation (Drum Scroll)
  // ---------------------------------------------------------------------------
  const videoOpacity = useTransform(
    scrollYProgress,
    [start, enterEnd, exitStart, end],
    [0, 1, 1, 0]
  )

  const videoRotateX = useTransform(
    scrollYProgress,
    [start, enterEnd, exitStart, end],
    [-45, 0, 0, 45]
  )

  const videoY = useTransform(
    scrollYProgress,
    [start, enterEnd, exitStart, end],
    ['60%', '0%', '0%', '-60%']
  )

  const videoScale = useTransform(
    scrollYProgress,
    [start, enterEnd, exitStart, end],
    [0.8, 1, 1, 0.8]
  )

  // ---------------------------------------------------------------------------
  // 2. Text Animation (Staggered & Slower)
  // ---------------------------------------------------------------------------
  // 텍스트는 우측에서 천천히 들어옴.
  // Title이 먼저 들어오고, Description이 뒤따라 들어옴 (Stagger).
  
  // Title Animation
  const titleEnterStart = start + (duration * 0.1) // 영상보다 살짝 늦게 시작
  const titleEnterEnd = enterEnd + (duration * 0.05) // 천천히 안착
  
  const titleX = useTransform(
    scrollYProgress,
    [titleEnterStart, titleEnterEnd, exitStart, end],
    [60, 0, 0, 60] // 우측(100) -> 정면(0) -> 정면(0) -> 우측(100)
  )
  
  const titleOpacity = useTransform(
    scrollYProgress,
    [titleEnterStart, titleEnterEnd, exitStart, end],
    [0, 1, 1, 0]
  )

  // Description Animation (More Delay)
  const descEnterStart = titleEnterStart + (duration * 0.05)
  const descEnterEnd = titleEnterEnd + (duration * 0.05)

  const descX = useTransform(
    scrollYProgress,
    [descEnterStart, descEnterEnd, exitStart, end],
    [60, 0, 0, 60]
  )

  const descOpacity = useTransform(
    scrollYProgress,
    [descEnterStart, descEnterEnd, exitStart, end],
    [0, 1, 1, 0]
  )

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
              rotateX: videoRotateX,
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
        <div className="flex h-full w-[45%] flex-col justify-center px-4 text-white">
          
          {/* Title */}
          <motion.div
            style={{ x: titleX, opacity: titleOpacity }}
            className="mb-6 flex items-center gap-4"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-lg font-bold shadow-lg">
              {index + 1}
            </span>
            <h3 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl drop-shadow-lg">
              {feature.title}
            </h3>
          </motion.div>

          {/* Description */}
          <motion.p
            style={{ x: descX, opacity: descOpacity }}
            className="whitespace-pre-wrap text-lg leading-relaxed text-gray-300 md:text-xl drop-shadow-md"
          >
            {feature.description}
          </motion.p>

        </div>

      </div>
    </div>
  )
}
