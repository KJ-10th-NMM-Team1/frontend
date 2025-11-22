import { useProject } from '@/features/projects/hooks/useProjects'
import { useProjectProgressStore } from '@/features/projects/stores/useProjectProgressStore'
import { useEditorStore } from '@/shared/store/useEditorStore'

import { useEditorLanguageSelection } from '../hooks/useEditorLanguageSelection'

import { LanguageButton } from './LanguageButton'

type LanguageSelectorProps = {
  projectId: string
  currentLanguageCode: string
  onLanguageChange?: (languageCode: string) => void
}

/**
 * 에디터 언어 선택기
 * - 완료된 번역 언어만 활성화
 * - 미완료 언어는 비활성화 (grayscale)
 * - SSE 진행률에 따라 실시간 업데이트
 */
export function LanguageSelector({
  projectId,
  currentLanguageCode,
  onLanguageChange,
}: LanguageSelectorProps) {
  const { data: project } = useProject(projectId)
  const sseProgress = useProjectProgressStore((state) => state.getProjectProgress(projectId))
  const setAudioPlaybackMode = useEditorStore((state) => state.setAudioPlaybackMode)

  const { languageOptions } = useEditorLanguageSelection({
    project,
    sseProgress,
  })

  if (!project) {
    return null
  }

  return (
    <div className="inline-flex h-9 items-center gap-0.5 rounded-full p-1">
      {languageOptions.map((option) => {
        const isSelected = currentLanguageCode === option.code

        return (
          <LanguageButton
            key={option.code}
            option={option}
            isSelected={isSelected}
            onClick={() => {
              // 활성화된 언어만 선택 가능
              if (option.isAvailable) {
                setAudioPlaybackMode(option.code)
                onLanguageChange?.(option.code)
              }
            }}
          />
        )
      })}
    </div>
  )
}
