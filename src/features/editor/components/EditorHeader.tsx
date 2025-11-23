import { AlertCircle, Check, Loader2, Save, Upload, Video } from 'lucide-react'

import { Breadcrumbs } from '@/shared/ui/Breadcrumbs'
import { Button } from '@/shared/ui/Button'

import { LanguageSelector } from './LanguageSelector'

const LogoIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="mr-2 h-7 w-7"
  >
    <path
      d="M12 2.5L3.5 7.2V16.8L12 21.5L20.5 16.8V7.2L12 2.5Z"
      className="fill-foreground"
    />
    <path d="M10 8.5L16 12L10 15.5V8.5Z" className="fill-background" />
  </svg>
)

interface EditorHeaderProps {
  projectId: string
  selectedLanguage: string
  saveStatus: 'idle' | 'saving' | 'saved' | 'error'
  hasChanges: boolean
  isMuxing: boolean
  isLoading: boolean
  onLanguageChange: (languageCode: string) => void
  onSaveClick: () => void
  onExportClick: () => void
  onMuxClick: () => void
}

/**
 * 에디터 상단 헤더
 *
 * - Breadcrumbs
 * - Save indicator
 * - Save/Export/Mux 버튼
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
  onSaveClick,
  onExportClick,
  onMuxClick,
}: EditorHeaderProps) {
  return (
    <div className="relative flex items-center justify-between border-b border-outline/40 bg-background/90 px-4 py-3 backdrop-blur">
      {/* Left: Logo + Breadcrumbs */}
      <div className="flex items-center gap-3">
        <div className="text-xs rounded-full border border-outline/30 bg-surface-1 px-3 py-1.5 shadow-soft">
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
          variant={saveStatus === 'saved' ? 'primary' : 'secondary'}
          size="sm"
          onClick={onSaveClick}
          disabled={saveStatus === 'saving' || !hasChanges}
          className="h-9 w-[100px] rounded-2xl px-4"
        >
          {saveStatus === 'saving' ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              저장 중...
            </>
          ) : saveStatus === 'saved' ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              저장 완료
            </>
          ) : saveStatus === 'error' ? (
            <>
              <AlertCircle className="mr-2 h-4 w-4" />
              저장 실패
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              저장하기
            </>
          )}
        </Button>
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
  )
}
