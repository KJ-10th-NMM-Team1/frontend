import { useState } from 'react'

import { Download, FileAudio2, FileText, Play } from 'lucide-react'
import ReactCountryFlag from 'react-country-flag'

import type { AssetEntry } from '@/entities/asset/types'
import { useAssets } from '@/features/assets/hooks/useAssets'
import { useProject } from '@/features/projects/hooks/useProjects'
import { YoutubePublishDialog } from '@/features/youtube/components/YoutubePublishDialog'
import { useYoutubeStatus } from '@/features/youtube/hooks/useYoutubeIntegration'
import { trackEvent } from '@/shared/lib/analytics'
import { apiGet } from '@/shared/api/client'
import { Button } from '@/shared/ui/Button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/shared/ui/Dialog'

const languageCountryMap: Record<string, string> = {
  en: 'US',
  ko: 'KR',
  ja: 'JP',
  zh: 'CN',
  es: 'ES',
  fr: 'FR',
  de: 'DE',
  it: 'IT',
  pt: 'PT',
  ru: 'RU',
}

const getCountryCode = (code: string) => {
  const normalized = code.toLowerCase()
  return languageCountryMap[normalized] ?? normalized.slice(0, 2).toUpperCase()
}

type ExportDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  languageCode: string
  onMux: () => Promise<string | undefined> // result_key 반환
  isMuxing: boolean
}

export function ExportDialog({
  open,
  onOpenChange,
  projectId,
  languageCode,
  onMux,
  isMuxing,
}: ExportDialogProps) {
  const { data: project } = useProject(projectId)
  const { data: assets = [], isLoading: assetsLoading } = useAssets(projectId, languageCode)
  const { data: youtubeStatus } = useYoutubeStatus()
  const [selectedAsset, setSelectedAsset] = useState<AssetEntry | null>(null)
  const [publishOpen, setPublishOpen] = useState(false)
  const countryCode = getCountryCode(languageCode || 'en')
  const languageFlagIcon = (
    <ReactCountryFlag
      countryCode={countryCode}
      svg
      style={{ width: '1.25em', height: '1.25em' }}
      title={countryCode}
    />
  )
  const [selectedType, setSelectedType] = useState<
    'preview_video' | 'subtitle_srt' | 'dubbed_audio'
  >('preview_video')
  const canPublish = youtubeStatus?.connected && Boolean(projectId)

  const handleDownload = async (asset: AssetEntry) => {
    // Mux를 먼저 실행하고 result_key 받기
    const resultKey = await onMux()

    trackEvent('asset_download', {
      lang: languageCode,
      type: asset.asset_type,
      assetId: asset.asset_id,
    })
    try {
      // result_key가 있으면 이걸 사용 (가장 최신), 없으면 기존 asset.file_path 사용
      const filePath = resultKey || asset.file_path
      const response = await apiGet<{ url: string }>(`api/storage/media/${filePath}`)
      window.open(response.url, '_blank', 'noopener,noreferrer')
    } catch (error) {
      console.error('Failed to download asset', error)
    }
  }

  const handlePublishClick = async (asset: AssetEntry) => {
    // Mux를 먼저 실행하고 result_key 받기
    const resultKey = await onMux()

    trackEvent('asset_publish_youtube_click', {
      assetId: asset.asset_id,
      lang: languageCode,
    })
    // result_key가 있으면 업데이트된 asset 정보 사용
    const updatedAsset = resultKey ? { ...asset, file_path: resultKey } : asset
    setSelectedAsset(updatedAsset)
    setPublishOpen(true)
  }

  const handlePublishDialogChange = (nextOpen: boolean) => {
    setPublishOpen(nextOpen)
    if (!nextOpen) {
      setSelectedAsset(null)
    }
  }

  const filteredAsset = assets.find((asset) => asset.asset_type === selectedType) ?? null
  const hasAsset = Boolean(filteredAsset)

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-xl p-0">
          <div className="border-b border-surface-3 px-6 py-4">
            <DialogTitle>결과물 내보내기</DialogTitle>
          </div>
          <div className="space-y-5 px-6 py-5">
            <DialogDescription>
              더빙 영상 또는 자막을 다운로드하거나 YouTube로 업로드할 수 있습니다.
            </DialogDescription>
            <div className="rounded-3xl bg-surface-2 p-3">
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { type: 'preview_video' as const, label: 'Video', Icon: Play },
                  { type: 'subtitle_srt' as const, label: 'Subtitles', Icon: FileText },
                  { type: 'dubbed_audio' as const, label: 'Audio', Icon: FileAudio2 },
                ].map(({ type, label, Icon }) => {
                  const isActive = selectedType === type

                  return (
                    <button
                      key={type}
                      type="button"
                      className={`rounded-2xl border px-4 py-5 text-center text-sm font-semibold transition ${
                        isActive
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-surface-3 text-foreground hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedType(type)}
                    >
                      <Icon
                        className={`mx-auto mb-2 h-5 w-5 ${isActive ? 'text-primary' : 'text-gray-400'}`}
                      />
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl border border-dashed border-surface-3 px-4 py-3 text-sm">
                <p className="font-medium text-foreground">
                  {selectedType === 'preview_video'
                    ? '더빙 영상'
                    : selectedType === 'subtitle_srt'
                      ? '자막 파일'
                      : '오디오 파일'}{' '}
                  <span className="ml-1 inline-flex items-center align-middle">
                    {languageFlagIcon}
                  </span>
                </p>
                {assetsLoading ? (
                  <p className="text-xs text-gray-400">결과물을 확인하는 중...</p>
                ) : filteredAsset ? (
                  <p className="text-xs text-gray-400">{filteredAsset.created_at}</p>
                ) : (
                  <p className="text-xs text-gray-400">선택한 형식의 결과물이 없습니다.</p>
                )}
              </div>
              {selectedType === 'preview_video' ? (
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    disabled={assetsLoading || !filteredAsset || isMuxing}
                    onClick={() => {
                      if (filteredAsset) void handleDownload(filteredAsset)
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {isMuxing ? 'Mux 중...' : '다운로드'}
                  </Button>
                  <Button
                    type="button"
                    className="flex-1"
                    variant="secondary"
                    disabled={assetsLoading || !canPublish || !filteredAsset || isMuxing}
                    title={
                      canPublish
                        ? 'YouTube로 업로드'
                        : '마이페이지에서 유튜브 계정을 먼저 연동하세요.'
                    }
                    onClick={() => {
                      if (filteredAsset) void handlePublishClick(filteredAsset)
                    }}
                  >
                    {isMuxing ? 'Mux 중...' : 'YouTube 업로드'}
                  </Button>
                </div>
              ) : (
                <Button
                  className="w-full"
                  disabled={assetsLoading || !filteredAsset || isMuxing}
                  onClick={() => {
                    if (filteredAsset) void handleDownload(filteredAsset)
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  {isMuxing ? 'Mux 중...' : '선택한 형식 다운로드'}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {project ? (
        <YoutubePublishDialog
          open={publishOpen}
          onOpenChange={handlePublishDialogChange}
          asset={selectedAsset}
          projectId={projectId}
          projectTitle={project.title}
          languageCode={languageCode}
          languageLabel={countryCode}
        />
      ) : null}
    </>
  )
}
