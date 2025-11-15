import { useEffect, useMemo, useState } from 'react'

import type { AssetEntry } from '@/entities/asset/types'
import {
  useYoutubePublishMutation,
  type YoutubePublishResponse,
} from '@/features/youtube/hooks/useYoutubeIntegration'
import { useUiStore } from '@/shared/store/useUiStore'
import { Button } from '@/shared/ui/Button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/shared/ui/Dialog'
import { Input } from '@/shared/ui/Input'
import { Label } from '@/shared/ui/Label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/Select'

type YoutubePublishDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  asset: AssetEntry | null
  projectId: string
  projectTitle: string
  languageCode: string
  languageLabel?: string
}

export function YoutubePublishDialog({
  open,
  onOpenChange,
  asset,
  projectId,
  projectTitle,
  languageCode,
  languageLabel,
}: YoutubePublishDialogProps) {
  const showToast = useUiStore((state) => state.showToast)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [privacyStatus, setPrivacyStatus] = useState<'private' | 'unlisted' | 'public'>(
    'unlisted',
  )
  const [tags, setTags] = useState('Dupilot')
  const publishMutation = useYoutubePublishMutation()

  useEffect(() => {
    if (!asset || !open) return
    const languageText = languageLabel ?? languageCode.toUpperCase()
    setTitle(`${projectTitle} (${languageText})`)
    setDescription(
      `Dupilot에서 자동 생성한 ${languageText} 더빙 영상입니다.\n원본 프로젝트: ${projectTitle}`,
    )
    setTags(`Dupilot,${languageCode}`)
    setPrivacyStatus('unlisted')
  }, [asset, open, projectTitle, languageCode, languageLabel])

  const isSubmitting = publishMutation.isPending
  const isFormValid = title.trim().length > 3

  const defaultChannelLabel = useMemo(() => languageLabel ?? languageCode.toUpperCase(), [
    languageLabel,
    languageCode,
  ])

  if (!asset) {
    return null
  }

  const handleSuccess = (response: YoutubePublishResponse) => {
    showToast({
      title: '유튜브 업로드 완료',
      description: `영상 ID: ${response.videoId}`,
    })
    onOpenChange(false)
  }

  const handleError = () => {
    showToast({
      title: '업로드 실패',
      description: 'YouTube 업로드 중 오류가 발생했습니다.',
    })
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!asset || !isFormValid || isSubmitting) return
    const tagList =
      tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean) || undefined

    publishMutation.mutate(
      {
        projectId,
        assetId: asset.asset_id,
        languageCode,
        title: title.trim(),
        description: description.trim(),
        privacyStatus,
        tags: tagList,
      },
      {
        onSuccess: handleSuccess,
        onError: handleError,
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogTitle>YouTube로 업로드</DialogTitle>
        <DialogDescription>
          선택한 더빙 영상을 연동된 YouTube 채널({defaultChannelLabel})로 바로 업로드합니다.
        </DialogDescription>
        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="youtube-title">영상 제목</Label>
            <Input
              id="youtube-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="영상 제목"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="youtube-description">설명</Label>
            <textarea
              id="youtube-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="border-surface-3 bg-white w-full rounded-lg border p-3 text-sm"
              rows={4}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>공개 범위</Label>
              <Select
                value={privacyStatus}
                onValueChange={(value) =>
                  setPrivacyStatus(value as 'private' | 'unlisted' | 'public')
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="공개 설정" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">비공개</SelectItem>
                  <SelectItem value="unlisted">일부 공개</SelectItem>
                  <SelectItem value="public">전체 공개</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="youtube-tags">태그 (쉼표로 구분)</Label>
              <Input
                id="youtube-tags"
                value={tags}
                onChange={(event) => setTags(event.target.value)}
                placeholder="Dupilot, dubbing, ai"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button type="submit" disabled={!isFormValid || isSubmitting}>
              {isSubmitting ? '업로드 중...' : '유튜브 업로드'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
