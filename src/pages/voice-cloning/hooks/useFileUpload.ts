import { useCallback, useState } from 'react'
import type { DragEvent } from 'react'

import { isAudioFile } from '../utils/formatters'

interface UseFileUploadReturn {
  uploadError: string | null
  isDragOver: boolean
  handleFileSelect: (file: File | undefined) => void
  handleDrop: (event: DragEvent<HTMLDivElement>) => void
  handleDragOver: (event: DragEvent<HTMLDivElement>) => void
  handleDragLeave: (event: DragEvent<HTMLDivElement>) => void
}

interface UseFileUploadProps {
  onFileSelect?: (file: File, previewUrl: string) => void
  onError?: (error: string) => void
}

export function useFileUpload({
  onFileSelect,
  onError,
}: UseFileUploadProps = {}): UseFileUploadReturn {
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleFileSelect = useCallback(
    (file: File | undefined) => {
      if (!file) return
      if (!isAudioFile(file)) {
        const errorMsg = '오디오 형식의 파일만 업로드할 수 있습니다.'
        setUploadError(errorMsg)
        onError?.(errorMsg)
        return
      }
      setUploadError(null)
      const previewUrl = URL.createObjectURL(file)
      onFileSelect?.(file, previewUrl)
    },
    [onFileSelect, onError],
  )

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      setIsDragOver(false)
      const file = event.dataTransfer?.files?.[0]
      if (file) {
        handleFileSelect(file)
      }
    },
    [handleFileSelect],
  )

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    if (event.dataTransfer.types.includes('Files')) {
      event.preventDefault()
      setIsDragOver(true)
    }
  }, [])

  const handleDragLeave = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const related = event.relatedTarget as Node | null
    if (!related || !event.currentTarget.contains(related)) {
      setIsDragOver(false)
    }
  }, [])

  return {
    uploadError,
    isDragOver,
    handleFileSelect,
    handleDrop,
    handleDragOver,
    handleDragLeave,
  }
}
