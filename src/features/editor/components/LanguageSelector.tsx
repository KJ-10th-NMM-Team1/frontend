import { Check, ChevronDown } from 'lucide-react'

import { useProject } from '@/features/projects/hooks/useProjects'
import { Button } from '@/shared/ui/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/Dropdown'
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
      label: `원어 (${project.source_language?.toUpperCase() || 'Original'})`,
      isOriginal: true,
    },
    ...(project.targets?.map((target) => ({
      code: target.language_code,
      label: target.language_code.toUpperCase(),
      isOriginal: false,
    })) || []),
  ]

  const selectedOption =
    languageOptions.find((opt) => opt.code === audioPlaybackMode) || languageOptions[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium shadow-sm hover:bg-gray-50"
        >
          {selectedOption.label}
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[180px]">
        {languageOptions.map((option, index) => (
          <div key={option.code}>
            {index === 1 && <DropdownMenuSeparator />}
            <DropdownMenuItem
              onClick={() => setAudioPlaybackMode(option.code)}
              className="flex items-center justify-between"
            >
              <span>{option.label}</span>
              {audioPlaybackMode === option.code && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
