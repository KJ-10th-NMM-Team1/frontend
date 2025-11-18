import type { DragEvent, RefObject } from 'react'

import { Button } from '@/shared/ui/Button'

interface ChooseStepProps {
  isDragOver: boolean
  uploadError: string | null
  fileInputRef: RefObject<HTMLInputElement>
  onDragOver: (event: DragEvent<HTMLDivElement>) => void
  onDragLeave: (event: DragEvent<HTMLDivElement>) => void
  onDrop: (event: DragEvent<HTMLDivElement>) => void
  onFileSelect: (file: File | undefined) => void
  onRecordClick: () => void
}

export function ChooseStep({
  isDragOver,
  uploadError,
  fileInputRef,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileSelect,
  onRecordClick,
}: ChooseStepProps) {
  return (
    <div
      className={`rounded-3xl border border-dashed p-10 text-center transition ${
        isDragOver
          ? 'border-primary bg-primary/5 shadow-lg'
          : 'border-primary/60 bg-surface-1/60'
      }`}
      style={{ cursor: 'copy' }}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="space-y-4">
        <div className="text-3xl">+</div>
        <h2 className="pri text-xl font-semibold">Instant Voice Cloning</h2>
        <p className="text-sm text-muted">
          10~60초 길이의 음성 샘플을 업로드하거나 직접 녹음하여 목소리의 톤과 스타일을 학습시켜
          보세요.
        </p>
        <p className="text-xs text-muted">파일을 끌어와 놓거나 업로드 버튼으로 선택하세요.</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            type="button"
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
          >
            파일 업로드
          </Button>
          <Button type="button" variant="primary" onClick={onRecordClick}>
            음성 녹음하기
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="audio/wav,audio/mpeg,audio/mp3"
          onChange={(e) => onFileSelect(e.target.files?.[0])}
        />
        {uploadError ? <p className="text-sm text-danger">{uploadError}</p> : null}
      </div>
    </div>
  )
}
