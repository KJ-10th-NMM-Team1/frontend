import { useCallback, useState } from 'react'
import type { DragEvent } from 'react'

import { isAudioFile } from '../utils/formatters'

// Helper function to get audio duration from file
async function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = new Audio()
    const objectUrl = URL.createObjectURL(file)

    audio.addEventListener('loadedmetadata', () => {
      URL.revokeObjectURL(objectUrl)
      resolve(Math.floor(audio.duration))
    })

    audio.addEventListener('error', () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Failed to load audio file'))
    })

    audio.src = objectUrl
  })
}

interface UseFileUploadReturn {
  uploadError: string | null
  isDragOver: boolean
  handleFileSelect: (file: File | undefined) => Promise<void>
  handleDrop: (event: DragEvent<HTMLDivElement>) => void
  handleDragOver: (event: DragEvent<HTMLDivElement>) => void
  handleDragLeave: (event: DragEvent<HTMLDivElement>) => void
}

interface UseFileUploadProps {
  onFileSelect?: (file: File, previewUrl: string, duration: number) => void
  onError?: (error: string) => void
}

export function useFileUpload({
  onFileSelect,
  onError,
}: UseFileUploadProps = {}): UseFileUploadReturn {
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleFileSelect = useCallback(
    async (file: File | undefined) => {
      if (!file) return
      if (!isAudioFile(file)) {
        const errorMsg = '오디오 형식의 파일만 업로드할 수 있습니다.'
        setUploadError(errorMsg)
        onError?.(errorMsg)
        return
      }
      setUploadError(null)

      try {
        const duration = await getAudioDuration(file)
        const previewUrl = URL.createObjectURL(file)
        onFileSelect?.(file, previewUrl, duration)
      } catch (error) {
        console.error('Failed to get audio duration', error)
        const errorMsg = '오디오 파일을 처리하는 중 문제가 발생했습니다.'
        setUploadError(errorMsg)
        onError?.(errorMsg)
      }
    },
    [onFileSelect, onError],
  )

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      setIsDragOver(false)
      const file = event.dataTransfer?.files?.[0]
      if (file) {
        void handleFileSelect(file)
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
