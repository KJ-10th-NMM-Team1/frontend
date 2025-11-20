import { useMemo, useRef } from 'react'

import { useNavigate } from 'react-router-dom'

import { routes } from '@/shared/config/routes'

import { ChooseStep } from './components/ChooseStep'
import { DetailsStep } from './components/DetailsStep'
import { RecordIntroStep } from './components/RecordIntroStep'
import { RecordingStep } from './components/RecordingStep'
import { ReviewStep } from './components/ReviewStep'
import { VoiceCloningLayout } from './components/VoiceCloningLayout'
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
    setRecordedDuration,
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
      onFileSelect: (file, url, duration) => {
        // Revoke old preview URL if exists
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl)
        }
        setMode('upload')
        setSelectedFile(file)
        setPreviewUrl(url)
        setRecordedDuration(duration)
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

  const getStepContent = () => {
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
  return (
    <VoiceCloningLayout
      step={step}
      title="VOICE CLONING"
      subtitle={
        step === 'choose'
          ? '나만의 AI 목소리를 만들어보세요'
          : step === 'record-intro'
            ? '음성 녹음 준비'
            : step === 'recording'
              ? '녹음 진행 중'
              : step === 'review'
                ? '녹음 샘플 검토'
                : '음성 샘플 정보 입력'
      }
      description={
        step === 'choose'
          ? '10~60초 길이의 음성 샘플을 업로드하거나 직접 녹음하여 목소리의 톤과 스타일을 학습시켜 보세요.'
          : step === 'record-intro'
            ? '마이크를 사용하여 10~60초 분량의 음성을 녹음해주세요.'
            : step === 'recording'
              ? '제공된 문장을 자연스럽게 읽어주세요.'
              : step === 'review'
                ? '녹음된 샘플을 확인하고 품질을 검토해주세요.'
                : '음성 샘플의 이름과 설명을 입력해주세요.'
      }
    >
      {getStepContent()}
    </VoiceCloningLayout>
  )
}
