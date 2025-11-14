import { Download, Play } from 'lucide-react'

import type { AssetEntry } from '@/entities/asset/types'
import type { ProjectDetail, ProjectTarget } from '@/entities/project/types'
import VideoPlayer from '@/features/projects/components/VideoPlayer'
import { useProjectAssets } from '@/features/projects/hooks/useProjectAssets'
import { trackEvent } from '@/shared/lib/analytics'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/Button'

type ProjectLanguagePanelProps = {
  project: ProjectDetail
  activeLanguage: string
  activeTarget?: ProjectTarget
  onLanguageChange: (language: string) => void
  version: 'original' | 'translated'
  onVersionChange: (version: 'original' | 'translated') => void
  languageNameMap?: Record<string, string>
}

export function ProjectLanguagePanel({
  project,
  activeLanguage,
  onLanguageChange,
  version,
  onVersionChange,
  languageNameMap = {},
}: ProjectLanguagePanelProps) {
  const targetLanguageCodes = project.targets?.map((target) => target.language_code) ?? []
  const uniqueTargetLanguages = Array.from(new Set(targetLanguageCodes))
  const targetStatusMap =
    project.targets?.reduce<Record<string, ProjectTarget['status']>>((acc, target) => {
      acc[target.language_code] = target.status
      return acc
    }, {}) ?? {}

  const { assetsByLanguage, videoUrlMap } = useProjectAssets(project)
  const assets = assetsByLanguage[activeLanguage] ?? []

  return (
    <div className="border-surface-3 bg-surface-1 space-y-3 rounded-3xl border p-6 shadow-soft">
      <LanguagePreview
        assets={assets}
        version={version}
        onVersionChange={onVersionChange}
        videoSource={project.video_source}
        sourceLanguage={project.source_language}
        targetLanguages={uniqueTargetLanguages}
        targetStatusMap={targetStatusMap}
        onLanguageChange={onLanguageChange}
        activeLanguage={activeLanguage}
        languageNameMap={languageNameMap}
        videoUrlMap={videoUrlMap}
      />
    </div>
  )
}

type LanguagePreviewProps = {
  assets: AssetEntry[]
  version: 'original' | 'translated'
  onVersionChange: (version: 'original' | 'translated') => void
  videoSource?: string
  sourceLanguage: string
  targetLanguages: string[]
  targetStatusMap: Record<string, ProjectTarget['status']>
  onLanguageChange: (language: string) => void
  activeLanguage: string
  languageNameMap: Record<string, string>
  videoUrlMap: Record<string, string>
}

function LanguagePreview({
  assets,
  version,
  onVersionChange,
  videoSource,
  sourceLanguage,
  targetLanguages,
  targetStatusMap,
  onLanguageChange,
  activeLanguage,
  languageNameMap,
  videoUrlMap,
}: LanguagePreviewProps) {
  const languageButtons = [sourceLanguage, ...targetLanguages].map((lang) => {
    const displayName = languageNameMap[lang] ?? lang
    const isCompleted = lang === sourceLanguage ? true : targetStatusMap[lang] === 'completed'
    return {
      label: lang === sourceLanguage ? `${displayName}(원본)` : displayName,
      language: lang,
      disabled: !isCompleted,
    }
  })

  const previewAsset = assets.find(
    (asset) => asset.asset_type === 'preview_video', //|| asset.asset_type === 'dubbed_video',
  )
  const translatedSource = previewAsset?.file_path
  const previewSource = version === 'original' ? videoSource : (translatedSource ?? videoSource)
  const languageLabel = languageNameMap[activeLanguage] ?? activeLanguage
  const videoSrc = previewSource ? videoUrlMap[previewSource] : undefined

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {languageButtons.map(({ label, language: buttonLang, disabled }) => {
          const isActive = buttonLang === activeLanguage
          const buttonClass = cn('rounded-full px-3 py-1 text-xs transition')
          return (
            <Button
              key={label}
              variant={isActive ? 'primary' : 'ghost'}
              size="sm"
              className={buttonClass}
              disabled={disabled}
              aria-pressed={isActive}
              onClick={() => {
                onLanguageChange(buttonLang)
                if (buttonLang === sourceLanguage) {
                  onVersionChange('original')
                } else {
                  onVersionChange('translated')
                }
              }}
            >
              {label}
            </Button>
          )
        })}
      </div>
      <div className="border-surface-3 bg-surface-1 relative overflow-hidden rounded-lg border">
        {Object.entries(videoUrlMap).map(([path, url]) => (
          <VideoPlayer key={path} src={url} active={url === videoSrc} />
        ))}

        {!previewSource && (
          <div className="bg-surface-2 text-muted flex h-64 flex-col items-center justify-center gap-3">
            <Play className="h-8 w-8" />
            <p className="text-sm">더빙 영상 미리보기 (모의)</p>
          </div>
        )}
      </div>
      <div className="space-y-2">
        <p className="text-foreground mb-3 text-sm font-semibold">결과물</p>
        <div className="space-y-2">
          {assets.map((asset) => (
            <div
              key={asset.asset_id}
              className={cn(
                'border-surface-4 bg-surface-1 text-muted flex items-center justify-between rounded-2xl border px-4 py-3 text-sm',
              )}
            >
              <div>
                <p className="text-foreground font-medium">
                  {asset.asset_type === 'preview_video' ? '더빙 영상' : '자막'} • {languageLabel}
                </p>
                <p className="text-muted text-xs">{asset.created_at}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  trackEvent('asset_download', {
                    lang: languageLabel,
                    type: asset.asset_type,
                    assetId: asset.asset_id,
                  })
                }
              >
                <Download className="h-4 w-4" />
                다운로드
              </Button>
            </div>
          ))}
        </div>
        {assets.length === 0 ? (
          <div className="border-surface-4 bg-surface-2 text-muted rounded-2xl border border-dashed px-4 py-6 text-center text-sm">
            아직 산출물이 없습니다. 파이프라인 진행을 기다려주세요.
          </div>
        ) : null}
      </div>
    </div>
  )
}
