import { useState } from 'react'

import { ChevronDown, X } from 'lucide-react'
import ReactCountryFlag from 'react-country-flag'

import type { ProjectSummary } from '@/entities/project/types'
import { PROGRESS_STATUS_MESSAGES } from '@/features/projects/constants/notificationMessages'
import { useProjectProgressStore } from '@/features/projects/stores/useProjectProgressStore'

import { getCountryCode } from './episodeCardUtils'

interface ProgressOverlayProps {
  project: ProjectSummary
  progress: number
  message?: string
  isFailed?: boolean
  isCompleted?: boolean
}

/**
 * 썸네일 진행도 오버레이 컴포넌트
 * - 가로 프로그레스바 (5px, 카드 40% 폭)
 * - 진행 메시지 표시
 * - 왼쪽 하단 상세보기 아이콘
 * - 실패시 X 마크
 * - 완료시 오버레이 제거
 */
export function ProgressOverlay({
  project,
  progress,
  message,
  isFailed,
  isCompleted,
}: ProgressOverlayProps) {
  const [showDetails, setShowDetails] = useState(false)

  // SSE Store에서 타겟별 진행도 가져오기
  const sseProgressData = useProjectProgressStore((state) => state.getProjectProgress(project.id))

  // 완료되면 오버레이 없음
  if (isCompleted) {
    return null
  }

  // 상태 기반 메시지 결정
  const statusMessage = isFailed
    ? PROGRESS_STATUS_MESSAGES.failed
    : progress === 0
      ? PROGRESS_STATUS_MESSAGES.pending
      : PROGRESS_STATUS_MESSAGES.processing

  // 타겟별 진행도 데이터 준비
  const targetProgresses = project.targets.map((target) => {
    const sseTarget = sseProgressData?.targets[target.language_code]
    return {
      language: target.language_code.toLowerCase(),
      progress: sseTarget?.progress ?? target.progress,
      countryCode: getCountryCode(target.language_code.toLowerCase()),
    }
  })

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/60">
      {/* 실패 상태 X 마크 */}
      {isFailed && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <X className="h-16 w-16 text-white/20" strokeWidth={1.5} />
        </div>
      )}

      {/* 상세보기 패널 (hover시 전체 오버레이) */}
      {showDetails ? (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/75 backdrop-blur-sm"
          onMouseEnter={() => setShowDetails(true)}
          onMouseLeave={() => setShowDetails(false)}
        >
          <div className="w-[70%] max-w-[260px] rounded-lg bg-black/60 shadow-2xl backdrop-blur-md">
            {/* 전체 진행도 섹션 */}
            <div className="border-b border-white/10 p-3 pb-3">
              <div className="text-center">
                <div className="mb-2 text-[10px] font-medium text-white/50">전체 진행도</div>
                <div className="mt-1 flex items-baseline justify-center gap-2">
                  <div className="text-2xl font-bold text-white">{progress}%</div>
                  <div className="text-[10px] text-white/60">{statusMessage}</div>
                </div>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/20">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isFailed ? 'bg-red-500/80' : 'bg-white/90'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* 타겟별 진행도 섹션 */}
            {targetProgresses.length > 0 && (
              <div className="px-3 pt-3">
                <div className="mb-2 text-[10px] font-medium text-white/50">언어별 진행도</div>
                <div className="max-h-[120px] space-y-2 overflow-y-auto pb-3">
                  {targetProgresses.map((target) => (
                    <div key={target.language} className="flex items-center gap-2">
                      <div className="h-5 w-5 flex-shrink-0 overflow-hidden rounded border border-white/20 bg-white/5">
                        <ReactCountryFlag
                          countryCode={target.countryCode}
                          svg
                          style={{
                            width: '100%',
                            height: '100%',
                            display: 'block',
                          }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="h-1 w-full overflow-hidden rounded-full bg-white/15">
                          <div
                            className="h-full rounded-full bg-white/70 transition-all duration-300"
                            style={{ width: `${target.progress}%` }}
                          />
                        </div>
                      </div>
                      <div className="w-8 flex-shrink-0 text-right text-[10px] font-medium text-white/70">
                        {target.progress}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 상세보기 버튼 (패널 위에 표시) */}
          <button
            className="absolute bottom-2 left-2 rounded bg-white/10 p-1 backdrop-blur transition-all hover:bg-white/20"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
          >
            <ChevronDown className="h-5 w-5 rotate-180 text-white/80 transition-transform" />
          </button>
        </div>
      ) : (
        /* 기본 진행도 표시 (hover 안했을 때) */
        <>
          <div className="flex flex-col items-center">
            <div className="mb-1 flex items-baseline gap-2 text-center">
              <div className="text-lg font-bold text-white">{progress}%</div>
              <div className="mt-1 text-[10px] text-white/70">{statusMessage}</div>
            </div>
            <div className="flex h-1 w-32 overflow-hidden rounded-full bg-white/30">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isFailed ? 'bg-red-500' : 'bg-white'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* 상세보기 버튼 */}
          <button
            className="absolute bottom-2 left-2 rounded bg-white/10 p-1 backdrop-blur transition-all hover:bg-white/20"
            onMouseEnter={() => setShowDetails(true)}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
          >
            <ChevronDown className="h-5 w-5 text-white/80 transition-transform" />
          </button>
        </>
      )}
    </div>
  )
}
