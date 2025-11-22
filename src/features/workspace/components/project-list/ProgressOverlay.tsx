import { useState } from 'react'

import { AlertCircle } from 'lucide-react'
import ReactCountryFlag from 'react-country-flag'

import { PROGRESS_STATUS_MESSAGES } from '@/features/projects/constants/notificationMessages'

import type { NormalizedTarget } from './projectDataNormalizer'

interface ProgressOverlayProps {
  progress: number
  targets: NormalizedTarget[]
  message?: string
  isFailed?: boolean
  isCompleted?: boolean
}

export function ProgressOverlay({
  progress,
  targets,
  message,
  isFailed,
  isCompleted,
}: ProgressOverlayProps) {
  const [isHovered, setIsHovered] = useState(false)

  if (isCompleted) return null

  const defaultStatusMessage = isFailed
    ? PROGRESS_STATUS_MESSAGES.failed
    : progress === 0
      ? PROGRESS_STATUS_MESSAGES.pending
      : PROGRESS_STATUS_MESSAGES.processing
  const displayStatusMessage = message ?? defaultStatusMessage

  return (
    <>
      {/* 커스텀 스크롤바 스타일 (이 컴포넌트에만 적용) */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px; /* 스크롤바 너비 */
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent; /* 트랙 배경 투명 */
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2); /* 핸들 색상 (반투명 흰색) */
          border-radius: 10px; /* 둥근 핸들 */
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3); /* 호버 시 약간 더 밝게 */
        }
      `}</style>

      <div
        className={`absolute inset-0 z-10 flex flex-col transition-all duration-300 ${isHovered ? 'justify-start bg-black/90 pt-4 backdrop-blur-sm' : 'items-center justify-center bg-black/60'} `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* 1. 헤더 섹션 (전체 진행도) */}
        <div
          className={`flex w-full shrink-0 flex-col px-4 transition-all duration-300 ${isHovered ? 'mb-2 items-start' : 'scale-110 items-center'} `}
        >
          {isFailed ? (
            <div className="flex flex-col items-center text-rose-500">
              <AlertCircle className="mb-2 h-8 w-8" strokeWidth={1.5} />
              <span className="text-sm font-bold">변환 실패</span>
            </div>
          ) : (
            <>
              {/* 호버 시 레이아웃 변경 */}
              <div
                className={`flex w-full items-center gap-3 transition-all duration-300 ${isHovered ? 'justify-between border-b border-white/10 pb-2' : 'flex-col justify-center'}`}
              >
                {/* 왼쪽: 퍼센트 및 라벨 */}
                <div className="flex flex-col">
                  {isHovered && (
                    <span className="mb-0.5 text-[10px] font-medium text-gray-400">
                      전체 진행도
                    </span>
                  )}
                  <span
                    className={`font-bold leading-none text-white ${isHovered ? 'text-2xl' : 'text-3xl drop-shadow-md'}`}
                  >
                    {progress}%
                  </span>
                </div>

                {/* 오른쪽: 상태 뱃지 (호버 시에만 표시) */}
                <div
                  className={`whitespace-nowrap rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/80 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'hidden opacity-0'} `}
                >
                  {displayStatusMessage}
                </div>
              </div>

              {/* 기본 프로그레스 바 (호버 아닐 때만 표시) */}
              {!isHovered && (
                <div className="mt-3 h-1 w-16 overflow-hidden rounded-full bg-white/30">
                  <div
                    className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* 2. 상세 리스트 섹션 (커스텀 스크롤바 적용) */}
        <div
          className={`custom-scrollbar w-full overflow-y-auto px-4 transition-all duration-300 ease-out ${isHovered ? 'flex-1 translate-y-0 py-2 opacity-100' : 'h-0 translate-y-4 overflow-hidden opacity-0'} `}
        >
          {targets.length > 0 && (
            <div className="flex flex-col gap-4">
              {targets.map((target) => (
                <div key={target.languageCode} className="group flex items-center gap-3">
                  {/* 국기 아이콘: 원형 컨테이너 안에 온전한 국기 배치 */}
                  <div className="relative flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/5">
                    {/* ReactCountryFlag는 사각형이므로, 약간 작게 스타일링해서 중앙에 오게 함 */}
                    <ReactCountryFlag
                      countryCode={target.countryCode}
                      svg
                      style={{
                        width: '1.2em', // 컨테이너보다 약간 작게
                        height: '1.2em',
                        borderRadius: '2px', // 국기 자체도 살짝 둥글게
                        objectFit: 'contain',
                      }}
                    />
                  </div>

                  {/* 언어 코드 및 진행바 */}
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <div className="flex items-baseline justify-between text-[11px]">
                      <span className="font-medium text-gray-300">
                        {target.languageCode.toUpperCase()}
                      </span>
                      <span className="font-bold text-white/90">{target.progress}%</span>
                    </div>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-white/70 to-white transition-all duration-300 group-hover:from-white/90 group-hover:to-white"
                        style={{ width: `${target.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
