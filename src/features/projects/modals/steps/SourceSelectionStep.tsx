import { useMemo, useState } from 'react'

import { Link2 } from 'lucide-react'

import { trackEvent } from '@/shared/lib/analytics'
import { Button } from '@/shared/ui/Button'
import { DialogDescription, DialogTitle } from '@/shared/ui/Dialog'
import { Input } from '@/shared/ui/Input'
import { ValidationMessage } from '@/shared/ui/ValidationMessage'

import type { SourceSelectionResult } from '../types'

const YOUTUBE_PATTERN =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/)([\w-]{11})([&?]\S*)?$/i

type SourceSelectionStepProps = {
  initialMode?: 'youtube' | 'file'
  initialYoutubeUrl?: string
  previousUploadSummary?: string | null
  onSubmit: (values: SourceSelectionResult) => void
  onCancel: () => void
}

export function SourceSelectionStep({
  initialMode = 'file',
  initialYoutubeUrl = '',
  previousUploadSummary,
  onSubmit,
  onCancel,
}: SourceSelectionStepProps) {
  const [mode, setMode] = useState<'youtube' | 'file'>(initialMode)
  const [youtubeUrl, setYoutubeUrl] = useState(initialYoutubeUrl)
  const [file, setFile] = useState<File | undefined>()
  const [fileError, setFileError] = useState<string | null>(null)

  const isYoutubeValid = YOUTUBE_PATTERN.test(youtubeUrl.trim())
  const hasPersistedFile = Boolean(previousUploadSummary)

  const canProceed = mode === 'youtube' ? isYoutubeValid : Boolean(file) || hasPersistedFile

  const fileSummary = useMemo(() => {
    if (file) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1)
      return `${file.name} • ${sizeMb}MB`
    }
    return previousUploadSummary
  }, [file, previousUploadSummary])

  const handleFileChange = (nextFile?: File) => {
    if (!nextFile) return
    if (nextFile.size > 1024 * 1024 * 1024) {
      setFileError('1GB 이하의 파일만 업로드 가능합니다.')
      return
    }
    setFileError(null)
    setFile(nextFile)
    setMode('file')
    trackEvent('create_upload_start', { name: nextFile.name })
    setTimeout(() => trackEvent('create_upload_done', { name: nextFile.name }), 300)
  }

  const handleYoutubeChange = (value: string) => {
    setYoutubeUrl(value)
    if (value.trim()) {
      setMode('youtube')
    }
  }

  const handleSubmit = () => {
    if (!canProceed) return
    onSubmit({
      mode,
      youtubeUrl: mode === 'youtube' ? youtubeUrl.trim() : undefined,
      file: mode === 'file' ? file : undefined,
    })
  }

  return (
    <div className="space-y-2">
      <div className="mb-6">
        <DialogTitle>1단계 — 제작 소스 연결</DialogTitle>
        <DialogDescription>
          YouTube 링크를 불러오거나, 로컬에서 원본 영상을 업로드해 AI 더빙을 생성합니다
        </DialogDescription>
      </div>

      <div className="space-y-4">
        {/* <Label htmlFor="youtube-url">YouTube 링크</Label> */}
        <div>
          <div className="border-surface-4 bg-surface-1 flex items-center gap-3 rounded-2xl border px-4">
            <Link2 className="text-muted h-5 w-5" />
            <Input
              id="youtube-url"
              placeholder="https://youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={(event) => handleYoutubeChange(event.target.value)}
              className="border-none px-0 focus-visible:ring-0"
            />
          </div>
          <ValidationMessage
            message={
              !isYoutubeValid && youtubeUrl.trim().length > 0
                ? '올바른 YouTube 링크를 입력하세요.'
                : undefined
            }
          />
        </div>
      </div>
      <div className="text-muted text-center">OR</div>
      <div className="space-y-1">
        <input
          id="project-source-upload"
          type="file"
          accept="video/*"
          className="sr-only"
          onChange={(event) => handleFileChange(event.target.files?.[0])}
        />
        <Button asChild className="h-12 w-full">
          <label htmlFor="project-source-upload" className="cursor-pointer text-center font-medium">
            파일 업로드
          </label>
        </Button>

        {fileSummary ? (
          <p className="text-muted space-y-2">
            {/* 선택된 파일 */}
            <div className="text-muted overflow-hidden text-ellipsis whitespace-nowrap font-medium">
              {fileSummary}
            </div>
          </p>
        ) : null}
        <ValidationMessage message={fileError ?? undefined} />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="ghost" type="button" onClick={onCancel}>
          취소
        </Button>
        <Button type="button" onClick={handleSubmit} disabled={!canProceed}>
          다음
        </Button>
      </div>
    </div>
  )
}
