import ReactCountryFlag from 'react-country-flag'

import { useProgressAnimation } from '@/features/projects/hooks/useProgressAnimation'

interface AnimatedTargetFlagProps {
  projectId: string
  languageCode: string
  languageLabel: string
  countryCode: string
  sseProgress?: number
  fallbackProgress: number
}

/**
 * 애니메이션이 적용된 타겟 언어 국기
 * SSE로 받은 진행도를 부드럽게 증가시켜 표시
 */
export function AnimatedTargetFlag({
  projectId,
  languageCode,
  languageLabel,
  countryCode,
  sseProgress,
  fallbackProgress,
}: AnimatedTargetFlagProps) {
  const animatedProgress = useProgressAnimation({
    projectId,
    languageCode,
    sseProgress,
  })

  // 애니메이션 진행도가 없으면 fallback 사용
  const progress = animatedProgress ?? fallbackProgress

  return (
    <div
      className="relative h-5 w-8 overflow-hidden rounded border border-gray-300"
      title={`${languageLabel} ${progress}%`}
    >
      {/* 배경 (grayscale) */}
      <div className="absolute inset-0 grayscale">
        <ReactCountryFlag
          countryCode={countryCode}
          svg
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
          }}
        />
      </div>

      {/* 진행도 오버레이 (컬러) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          clipPath: `polygon(0 0, ${progress}% 0, ${progress}% 100%, 0 100%)`,
        }}
      >
        <ReactCountryFlag
          countryCode={countryCode}
          svg
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
          }}
        />
      </div>
    </div>
  )
}
