import { useMemo } from 'react'

import { ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useLanguage } from '@/features/languages/hooks/useLanguage'
import { routes } from '@/shared/config/routes'
import { trackEvent } from '@/shared/lib/analytics'
import { Button } from '@/shared/ui/Button'

type ProjectStudioPanelProps = {
  projectId: string
  selectedLanguageCode: string
  isSourceLanguage: boolean
}

export function ProjectStudioPanel({
  projectId,
  selectedLanguageCode,
  isSourceLanguage,
}: ProjectStudioPanelProps) {
  const { data: languageData } = useLanguage()

  const languageNameMap = useMemo(() => {
    const items = languageData?.items ?? []
    return items.reduce<Record<string, string>>((acc, item) => {
      acc[item.code] = item.nameKo
      return acc
    }, {})
  }, [languageData])

  const selectedLanguageLabel = languageNameMap[selectedLanguageCode] ?? selectedLanguageCode

  const buttonLabel = isSourceLanguage ? '더빙 스튜디오 열기' : `더빙 스튜디오 열기(${selectedLanguageLabel})`
  return (
    <aside className="border-surface-3 flex items-center rounded-3xl border bg-white p-6">
      <div className="space-y-3">
        <p className="text-foreground text-lg font-semibold">더빙 스튜디오</p>
        <p className="text-muted text-sm">더빙 스튜디오에서 더빙 영상을 직접 편집해보세요</p>
        <Button
          asChild
          onClick={() => trackEvent('enter_editor_click', { projectId })}
          className="w-full"
          variant={isSourceLanguage ? 'secondary' : 'primary'} // 필요시          
        >
          {isSourceLanguage ? (
            <div className="inline-flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              {buttonLabel}
            </div>
          ) : (
            <Link to={routes.editor(projectId, selectedLanguageCode)}>
              <ExternalLink className="h-4 w-4" />
              {buttonLabel}
            </Link>
          )}
        </Button>
      </div>
    </aside>
  )
}
