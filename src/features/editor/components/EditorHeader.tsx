import { AlertCircle, Check, Loader2, Save, Upload } from 'lucide-react'

import { Breadcrumbs } from '@/shared/ui/Breadcrumbs'
import { Button } from '@/shared/ui/Button'

import { LanguageSelector } from './LanguageSelector'

interface EditorHeaderProps {
  projectId: string
  selectedLanguage: string
  saveStatus: 'idle' | 'saving' | 'saved' | 'error'
  hasChanges: boolean
  isLoading: boolean
  onLanguageChange: (languageCode: string) => void
  onSaveClick: () => void
  onExportClick: () => void
}

/**
 * 에디터 상단 헤더
 *
 * - Breadcrumbs
 * - Save indicator
 * - Save/Export 버튼
 * - 언어 선택기
 */
export function EditorHeader({
  projectId,
  selectedLanguage,
  saveStatus,
  hasChanges,
  onLanguageChange,
  onSaveClick,
  onExportClick,
}: EditorHeaderProps) {
  return (
    <div className="border-outline/20 relative flex items-center justify-between border-b bg-background/90 px-4 py-3 backdrop-blur">
      {/* Left: Logo + Breadcrumbs */}
      <div className="flex items-center gap-3">
        <div className="border-outline/30 rounded-full border bg-surface-1 px-3 py-1.5 text-xs shadow-soft">
          <Breadcrumbs
            items={[
              { label: '홈', href: '/' },
              { label: `에피소드`, href: `/projects/${projectId}` },
              { label: '에디터' },
            ]}
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
      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={onExportClick}
          className="h-9 w-[110px] rounded-2xl px-4"
        >
          <Upload className="h-4 w-4" />
          내보내기
        </Button>

        <Button
          type="button"
          size="sm"
          onClick={onSaveClick}
          disabled={saveStatus === 'saving' || !hasChanges}
          className="h-9 w-[110px] rounded-2xl px-4"
        >
          {saveStatus === 'saving' ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              저장 중...
            </>
          ) : saveStatus === 'saved' ? (
            <>
              <Check className="h-4 w-4" />
              저장 완료
            </>
          ) : saveStatus === 'error' ? (
            <>
              <AlertCircle className="h-4 w-4" />
              저장 실패
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              저장하기
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
