import { useEffect, useState } from 'react'

export type CloneStep = 'choose' | 'record-intro' | 'recording' | 'review' | 'details'

interface UseVoiceCloningStateReturn {
  step: CloneStep
  mode: 'upload' | 'record' | null
  selectedFile: File | null
  previewUrl: string | null
  removeNoise: boolean
  setStep: (step: CloneStep) => void
  setMode: (mode: 'upload' | 'record' | null) => void
  setSelectedFile: (file: File | null) => void
  setPreviewUrl: (url: string | null) => void
  setRemoveNoise: (value: boolean) => void
  resetAll: () => void
}

export function useVoiceCloningState(): UseVoiceCloningStateReturn {
  const [step, setStep] = useState<CloneStep>('choose')
  const [mode, setMode] = useState<'upload' | 'record' | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [removeNoise, setRemoveNoise] = useState(true)

  // Cleanup preview URL on unmount or when it changes
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const resetAll = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setSelectedFile(null)
    setPreviewUrl(null)
    setMode(null)
    setStep('choose')
  }

  return {
    step,
    mode,
    selectedFile,
    previewUrl,
    removeNoise,
    setStep,
    setMode,
    setSelectedFile,
    setPreviewUrl,
    setRemoveNoise,
    resetAll,
  }
}
