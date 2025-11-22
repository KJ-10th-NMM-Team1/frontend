import { Upload, Video } from 'lucide-react'

import { Breadcrumbs } from '@/shared/ui/Breadcrumbs'
import { Button } from '@/shared/ui/Button'

import { LanguageSelector } from './LanguageSelector'
import { SaveIndicator } from './SaveIndicator'

interface EditorHeaderProps {
  projectId: string
  selectedLanguage: string
  saveStatus: 'idle' | 'saving' | 'saved' | 'error'
  hasChanges: boolean
  isMuxing: boolean
  isLoading: boolean
  onLanguageChange: (languageCode: string) => void
  onExportClick: () => void
  onMuxClick: () => void
}

/**
 * 에디터 상단 헤더
 *
 * - Breadcrumbs
 * - Save indicator
 * - Export/Mux 버튼
 * - 언어 선택기
 */
export function EditorHeader({
  projectId,
  selectedLanguage,
  saveStatus,
  hasChanges,
  isMuxing,
  isLoading,
  onLanguageChange,
  onExportClick,
  onMuxClick,
}: EditorHeaderProps) {
  return (
    <div className="relative flex items-center justify-between border-b-[3px] px-4 py-2">
      {/* Left: Breadcrumbs */}
      <div className="flex items-center">
        <div className="text-xs">
          <Breadcrumbs
            items={[
              { label: '홈', href: '/' },
              { label: `프로젝트`, href: `/projects/${projectId}` },
              { label: '에디터' },
            ]}
            className="opacity-50"
          />
        </div>
      </div>

      {/* Center: Language Selector */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <LanguageSelector
          projectId={projectId}
          currentLanguageCode={selectedLanguage}
          onLanguageChange={onLanguageChange}
        />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        <SaveIndicator status={saveStatus} hasChanges={hasChanges} />
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            onClick={onExportClick}
            className="h-9 w-[100px] rounded-2xl px-4"
          >
            <Upload className="mr-2 h-4 w-4" />
            내보내기
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={onMuxClick}
            disabled={isMuxing || isLoading}
            className="h-9 w-[100px] rounded-2xl px-4"
          >
            <Video className="mr-2 h-4 w-4" />
            {isMuxing ? 'Mux 중...' : 'Mux'}
          </Button>
        </div>
      </div>
    </div>
  )
}
