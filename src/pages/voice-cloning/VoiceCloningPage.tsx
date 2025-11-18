import { useMemo, useRef } from 'react'

import { useNavigate } from 'react-router-dom'

import { routes } from '@/shared/config/routes'

import { ChooseStep } from './components/ChooseStep'
import { DetailsStep } from './components/DetailsStep'
import { RecordIntroStep } from './components/RecordIntroStep'
import { RecordingStep } from './components/RecordingStep'
import { ReviewStep } from './components/ReviewStep'
import { useAudioPlayer } from './hooks/useAudioPlayer'
import { useFileUpload } from './hooks/useFileUpload'
import { useRecording } from './hooks/useRecording'
import { useVoiceCloningState } from './hooks/useVoiceCloningState'
import { formatTime } from './utils/formatters'

export default function VoiceCloningPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const reviewAudioRef = useRef<HTMLAudioElement | null>(null)

  const {
    step,
    selectedFile,
    previewUrl,
    removeNoise,
    setStep,
    setMode,
    setSelectedFile,
    setPreviewUrl,
    setRemoveNoise,
    resetAll,
  } = useVoiceCloningState()

  const {
    recordingState,
    recordingSeconds,
    recordedDuration,
    micError,
    startRecording,
    stopRecording,
    resetRecording,
  } = useRecording({
    onRecordingComplete: (file, url) => {
      // Revoke old preview URL if exists
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
      setSelectedFile(file)
      setPreviewUrl(url)
      setMode('record')
      setStep('review')
    },
    onRecordingError: () => {
      setStep('record-intro')
    },
  })

  const { uploadError, isDragOver, handleFileSelect, handleDrop, handleDragOver, handleDragLeave } =
    useFileUpload({
      onFileSelect: (file, url) => {
        // Revoke old preview URL if exists
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl)
        }
        setMode('upload')
        setSelectedFile(file)
        setPreviewUrl(url)
        setStep('review')
      },
    })

  // Enable audio player controls only in review step
  useAudioPlayer(reviewAudioRef, step === 'review')

  const formattedTime = useMemo(() => formatTime(recordingSeconds), [recordingSeconds])

  const handleResetAll = () => {
    resetRecording()
    resetAll()
  }

  const handleStartRecordingFlow = async () => {
    setStep('recording')
    await startRecording()
  }

  const handleProceedWithSample = () => {
    if (!selectedFile) return
    setStep('details')
  }

  const renderStep = () => {
    switch (step) {
      case 'choose':
        return (
          <ChooseStep
            isDragOver={isDragOver}
            uploadError={uploadError}
            fileInputRef={fileInputRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onFileSelect={handleFileSelect}
            onRecordClick={() => setStep('record-intro')}
          />
        )
      case 'record-intro':
        return (
          <RecordIntroStep
            removeNoise={removeNoise}
            recordingState={recordingState}
            micError={micError}
            onRemoveNoiseToggle={() => setRemoveNoise(!removeNoise)}
            onStartRecording={handleStartRecordingFlow}
            onBack={handleResetAll}
          />
        )
      case 'recording':
        return (
          <RecordingStep
            formattedTime={formattedTime}
            onStopRecording={stopRecording}
            onCancel={handleResetAll}
          />
        )
      case 'review':
        return (
          <ReviewStep
            recordingState={recordingState}
            recordedDuration={recordedDuration}
            previewUrl={previewUrl}
            audioRef={reviewAudioRef}
            onRetry={() => setStep('record-intro')}
            onProceed={handleProceedWithSample}
          />
        )
      case 'details':
        return (
          <DetailsStep
            selectedFile={selectedFile}
            onBack={handleResetAll}
            onSuccess={() => navigate(routes.voiceLibrary)}
          />
        )
      default:
        return null
    }
  }

  return <div className="mx-auto max-w-4xl space-y-6 px-6 py-8">{renderStep()}</div>
}
