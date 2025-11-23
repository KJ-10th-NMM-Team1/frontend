import { Globe } from 'lucide-react'
import ReactCountryFlag from 'react-country-flag'

import { cn } from '@/shared/lib/utils'
import { getCountryCode } from '@/features/workspace/components/project-list/episodeCardUtils'

import type { LanguageOption } from '../hooks/useEditorLanguageSelection'

interface LanguageButtonProps {
  option: LanguageOption
  isSelected: boolean
  onClick: () => void
}

/**
 * 에디터 언어 선택 버튼 (국기 플래그 표시)
 * - 완료된 언어는 컬러로 활성화
 * - 미완료 언어는 grayscale로 비활성화
 * - 원어는 "원" 텍스트로 표시
 */
export function LanguageButton({ option, isSelected, onClick }: LanguageButtonProps) {
  const countryCode = option.isOriginal ? '' : getCountryCode(option.code)

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!option.isAvailable}
      className={cn(
        'relative flex items-center justify-center gap-1.5 rounded-full px-3 text-xs font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50',
        isSelected
          ? 'bg-secondary-container text-on-secondary-container shadow-sm'
          : 'opacity-80 hover:bg-surface-container-high',
        // 원어/타겟 구분 없이 통일된 크기감
        'h-full min-w-[70px]',
      )}
      title={`${option.label}${option.isAvailable ? '' : ' (처리 중)'} ${option.progress}%`}
    >
      {option.isOriginal ? (
        <>
          <Globe className="h-3.5 w-3.5" />
          <span>원어</span>
        </>
      ) : (
        <>
          <div
            className={cn(
              'flex h-3.5 w-3.5 items-center justify-center overflow-hidden rounded-full',
              !option.isAvailable && 'grayscale',
            )}
          >
            <ReactCountryFlag
              countryCode={countryCode}
              svg
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>
          <span>{option.label}</span>
        </>
      )}
    </button>
  )
}
