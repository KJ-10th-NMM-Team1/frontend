import { Globe, Languages } from 'lucide-react'

import { useProject } from '@/features/projects/hooks/useProjects'
import { Button } from '@/shared/ui/Button'
import { cn } from '@/shared/lib/utils'
import { useEditorStore } from '@/shared/store/useEditorStore'

type LanguageSelectorProps = {
  projectId: string
  currentLanguageCode: string
}

type LanguageOption = {
  code: string
  label: string
  isOriginal: boolean
}

export function LanguageSelector({ projectId, currentLanguageCode }: LanguageSelectorProps) {
  const { data: project } = useProject(projectId)
  const { audioPlaybackMode, setAudioPlaybackMode } = useEditorStore((state) => ({
    audioPlaybackMode: state.audioPlaybackMode,
    setAudioPlaybackMode: state.setAudioPlaybackMode,
  }))

  if (!project) {
    return null
  }

  // Build language options: original + targets
  const languageOptions: LanguageOption[] = [
    {
      code: 'original',
      label: `원어`,
      isOriginal: true,
    },
    ...(project.targets?.map((target) => ({
      code: target.language_code,
      label: target.language_code.toUpperCase(),
      isOriginal: false,
    })) || []),
  ]

  return (
    <div className="flex items-center gap-2">
      {languageOptions.map((option) => {
        const isSelected = audioPlaybackMode === option.code

        return (
          <Button
            key={option.code}
            variant={isSelected ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setAudioPlaybackMode(option.code)}
            className={cn(
              'gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all',
              isSelected
                ? 'shadow-sm'
                : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
            )}
          >
            {option.isOriginal ? (
              <Globe className="h-3.5 w-3.5" />
            ) : (
              <Languages className="h-3.5 w-3.5" />
            )}
            <span>{option.label}</span>
          </Button>
        )
      })}
    </div>
  )
}
