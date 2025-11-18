import type { DragEvent, RefObject } from 'react'

import { Button } from '@/shared/ui/Button'

interface ChooseStepProps {
  isDragOver: boolean
  uploadError: string | null
  fileInputRef: RefObject<HTMLInputElement>
  onDragOver: (event: DragEvent<HTMLDivElement>) => void
  onDragLeave: (event: DragEvent<HTMLDivElement>) => void
  onDrop: (event: DragEvent<HTMLDivElement>) => void
  onFileSelect: (file: File | undefined) => Promise<void>
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
    <div className="flex flex-col p-12">
      {/* Icon Flow */}
      <div className="mb-8 flex items-center justify-center gap-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
          <svg
            className="h-8 w-8 text-purple-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
        </div>
        <svg
          className="h-6 w-6 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
          <svg
            className="h-8 w-8 text-purple-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </div>
        <svg
          className="h-6 w-6 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
          <svg
            className="h-8 w-8 text-purple-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      </div>

      {/* Description */}
      <p className="mb-16 text-center text-base leading-relaxed text-gray-600">
        마이크를 활성화하여 직접 녹음하거나,
        <br />
        오디오 파일을 업로드하여 목소리를 학습시키세요.
      </p>

      {/* Drag & Drop Area */}
      {/* <div
        className={`mb-8 rounded-2xl border-2 border-dashed p-12 text-center transition-all ${
          isDragOver
            ? 'border-purple-500 bg-purple-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        }`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <div className="mb-4 flex justify-center">
          <svg
            className="h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>
        <p className="text-sm text-gray-600">파일을 여기에 끌어다 놓거나</p>
        <p className="text-xs text-gray-500">지원 형식: WAV, MP3, M4A (최대 10MB)</p>
      </div> */}

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <Button
          type="button"
          variant="secondary"
          className="rounded-full px-6 py-3 text-sm font-semibold"
          onClick={() => fileInputRef.current?.click()}
        >
          파일 업로드
        </Button>
        <Button
          type="button"
          variant="primary"
          className="flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
          onClick={onRecordClick}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
          음성 녹음 시작
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="audio/wav,audio/mpeg,audio/mp3,audio/m4a"
        onChange={(e) => void onFileSelect(e.target.files?.[0])}
      />

      {uploadError && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-center text-sm text-red-600">
          {uploadError}
        </div>
      )}
    </div>
  )
}
