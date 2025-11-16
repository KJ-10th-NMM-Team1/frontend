import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { Button } from '@/shared/ui/Button'
import { VoiceSampleForm } from '@/features/voice-samples/components/VoiceSampleForm'
import { routes } from '@/shared/config/routes'
import { useNavigate } from 'react-router-dom'

type CloneStep = 'choose' | 'record-intro' | 'recording' | 'review' | 'details'

export default function VoiceCloningPage() {
  const [step, setStep] = useState<CloneStep>('choose')
  const [mode, setMode] = useState<'upload' | 'record' | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [removeNoise, setRemoveNoise] = useState(true)
  const [micError, setMicError] = useState<string | null>(null)

  const [recordingState, setRecordingState] = useState<
    'idle' | 'recording' | 'converting' | 'ready'
  >('idle')
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [recordedDuration, setRecordedDuration] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const processedStreamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const recordedChunksRef = useRef<BlobPart[]>([])
  const timerRef = useRef<number | null>(null)

  const navigate = useNavigate()

  const supportsRecording =
    typeof window !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof MediaRecorder !== 'undefined'

  const resetRecording = useCallback((options?: { preserveDuration?: boolean }) => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      mediaStreamRef.current = null
    }
    if (processedStreamRef.current) {
      processedStreamRef.current.getTracks().forEach((track) => track.stop())
      processedStreamRef.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {})
      audioContextRef.current = null
    }
    if (timerRef.current) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
    recordedChunksRef.current = []
    setRecordingSeconds(0)
    if (!options?.preserveDuration) {
      setRecordedDuration(0)
    }
    setRecordingState('idle')
  }, [])

  useEffect(() => {
    return () => {
      resetRecording()
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl, resetRecording])

  const createProcessedStream = useCallback(async (stream: MediaStream) => {
    const audioContext = new AudioContext()
    const source = audioContext.createMediaStreamSource(stream)

    const highpass = audioContext.createBiquadFilter()
    highpass.type = 'highpass'
    highpass.frequency.value = 80

    const lowpass = audioContext.createBiquadFilter()
    lowpass.type = 'lowpass'
    lowpass.frequency.value = 8000

    const compressor = audioContext.createDynamicsCompressor()
    compressor.threshold.value = -30
    compressor.ratio.value = 12

    const destination = audioContext.createMediaStreamDestination()

    source.connect(highpass)
    highpass.connect(lowpass)
    lowpass.connect(compressor)
    compressor.connect(destination)

    audioContextRef.current = audioContext
    processedStreamRef.current = destination.stream
    return destination.stream
  }, [])

  const handleStartRecording = useCallback(async () => {
    if (!supportsRecording) {
      setMicError('이 브라우저에서는 녹음을 지원하지 않습니다.')
      return
    }
    setMicError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStreamRef.current = stream
      recordedChunksRef.current = []
      const processedStream = await createProcessedStream(stream)
      const options = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? { mimeType: 'audio/webm;codecs=opus' }
        : undefined
      const recorder = new MediaRecorder(processedStream, options)
      mediaRecorderRef.current = recorder
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data)
        }
      }
      recorder.onstop = () => {
        const finalDuration = recordingSeconds
        setRecordedDuration(finalDuration)
        const blob = new Blob(recordedChunksRef.current, { type: options?.mimeType ?? 'audio/webm' })
        const baseName = `voice-recording-${new Date().toISOString().replace(/[:.]/g, '-')}`
        setRecordingState('converting')
        void convertBlobToWav(blob, 16_000)
          .then((wavBlob) => {
            const wavFile = new File([wavBlob], `${baseName}.wav`, { type: 'audio/wav' })
            if (previewUrl) {
              URL.revokeObjectURL(previewUrl)
            }
            const url = URL.createObjectURL(wavBlob)
            setPreviewUrl(url)
            setSelectedFile(wavFile)
            setRecordingState('ready')
            setStep('review')
          })
          .catch((error) => {
            console.error('Failed to convert recording', error)
            setMicError('녹음 파일을 변환하는 중 문제가 발생했습니다.')
            setStep('record-intro')
          })
          .finally(() => {
            resetRecording({ preserveDuration: true })
          })
      }
      recorder.start()
      setRecordingSeconds(0)
      setRecordedDuration(0)
      timerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => {
          setRecordedDuration(prev + 1)
          return prev + 1
        })
      }, 1000)
      setRecordingState('recording')
      setStep('recording')
    } catch (error) {
      console.error('Failed to access microphone', error)
      setMicError('마이크 권한이 필요합니다.')
      resetRecording()
    }
  }, [createProcessedStream, previewUrl, resetRecording, supportsRecording])

  const handleStopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    if (timerRef.current) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const handleUploadSelect = (file: File | undefined) => {
    if (!file) return
    setMode('upload')
    setSelectedFile(file)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(URL.createObjectURL(file))
    setStep('details')
  }

  const handleUseRecordedSample = () => {
    if (!selectedFile) return
    setMode('record')
    setStep('details')
  }

  const formattedTime = useMemo(() => {
    const minutes = Math.floor(recordingSeconds / 60)
    const seconds = recordingSeconds % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }, [recordingSeconds])

  const handleResetAll = () => {
    resetRecording()
    setSelectedFile(null)
    setRecordingSeconds(0)
    setPreviewUrl(null)
    setMode(null)
    setStep('choose')
  }

  const renderStep = () => {
    switch (step) {
      case 'choose':
        return (
          <div className="border-surface-3 bg-surface-1/60 rounded-3xl border p-8 text-center">
            <div className="space-y-4">
              <div className="text-3xl">+</div>
              <h2 className="text-xl font-semibold">Instant Voice Cloning</h2>
              <p className="text-muted text-sm">
                10~60초 길이의 음성 샘플을 업로드하거나 직접 녹음하여 목소리의 톤과 스타일을 학습시켜
                보세요.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  파일 업로드
                </Button>
                <Button type="button" variant="primary" onClick={() => setStep('record-intro')}>
                  음성 녹음하기
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="audio/wav,audio/mpeg,audio/mp3"
                onChange={(e) => handleUploadSelect(e.target.files?.[0])}
              />
            </div>
          </div>
        )
      case 'record-intro':
        return (
          <div className="rounded-3xl border border-surface-3 bg-surface-1 p-8 shadow-soft">
            <div className="mb-6 flex justify-between text-sm text-muted">
              <button type="button" className="text-primary" onClick={handleResetAll}>
                ← 돌아가기
              </button>
              <div>기본 마이크</div>
            </div>
            <p className="text-muted text-xs font-semibold tracking-[0.3em]">읽어주세요</p>
            <p className="text-foreground mt-3 text-lg font-medium">
              “안녕하세요! 지금 저는 제 목소리를 샘플링하고 있습니다. 잠시 뒤 이 목소리가 텍스트를 자동으로
              읽어주게 될 거예요.”
            </p>
            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => setRemoveNoise((prev) => !prev)}
                className="text-sm text-muted flex items-center gap-2 rounded-full border border-surface-3 px-4 py-2"
              >
                AI 노이즈 제거
                <span
                  className={`inline-flex h-4 w-8 items-center rounded-full px-1 text-[10px] font-semibold ${
                    removeNoise ? 'bg-primary text-white justify-end' : 'bg-surface-3 justify-start text-muted'
                  }`}
                >
                  {removeNoise ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>
            <div className="mt-8 flex justify-center">
              <Button type="button" onClick={handleStartRecording} disabled={recordingState !== 'idle'}>
                녹음 시작
              </Button>
            </div>
            {micError ? <p className="text-danger mt-4 text-sm">{micError}</p> : null}
          </div>
        )
      case 'recording':
        return (
          <div className="rounded-3xl border border-surface-3 bg-surface-1 p-8 text-center">
            <p className="text-muted text-sm">녹음 중...</p>
            <p className="text-4xl font-bold mt-4">{formattedTime}</p>
            <div className="mt-6 flex justify-center gap-4">
              <Button type="button" variant="destructive" onClick={handleStopRecording}>
                녹음 종료
              </Button>
              <Button type="button" variant="ghost" onClick={handleResetAll}>
                취소
              </Button>
            </div>
          </div>
        )
      case 'review':
        return (
          <div className="rounded-3xl border border-surface-3 bg-surface-1 p-8">
            <button type="button" className="text-primary text-sm mb-4" onClick={() => setStep('record-intro')}>
              ← 다시 녹음하기
            </button>
            <h3 className="text-lg font-semibold">선택한 샘플</h3>
            <p className="text-muted text-sm mb-4">샘플을 재생해보고 품질이 괜찮다면 다음 단계로 이동하세요.</p>
            {recordingState === 'converting' ? (
              <p className="text-muted text-sm">파일 처리 중...</p>
            ) : (
              previewUrl && (
                <div className="space-y-2">
                  <audio controls className="w-full" src={previewUrl} />
                </div>
              )
            )}
            <div className="mt-4 text-xs text-muted">
              녹음 길이: {recordedDuration}s (최소 10초 이상이어야 합니다)
            </div>
            <div className="mt-6 flex justify-end">
              <Button
                type="button"
                onClick={handleUseRecordedSample}
                // disabled={!selectedFile || recordedDuration < 10}
              >
                샘플 사용하기
              </Button>
            </div>
          </div>
        )
      case 'details':
        return (
          <div className="rounded-3xl border border-surface-3 bg-surface-1 p-6 shadow-soft">
            <button type="button" className="text-primary text-sm mb-4" onClick={handleResetAll}>
              ← 처음으로
            </button>
            {selectedFile ? (
              <VoiceSampleForm
                initialFile={selectedFile}
                hideFileUpload={mode === 'record'}
                onCancel={handleResetAll}
                onSuccess={() => navigate(routes.voiceSamples)}
              />
            ) : (
              <p className="text-muted text-sm">사용할 샘플이 없습니다.</p>
            )}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-6 py-8">
      <div className="space-y-2 text-center">
        <p className="text-primary text-xs font-semibold tracking-[0.3em] uppercase">Voice cloning</p>
        <p className="text-muted text-sm">
          1분 이내의 샘플을 업로드하거나 직접 녹음하면, 해당 목소리로 TTS를 생성할 수 있습니다.
        </p>
      </div>
      {renderStep()}
    </div>
  )
}

async function convertBlobToWav(blob: Blob, targetSampleRate = 16_000): Promise<Blob> {
  const arrayBuffer = await blob.arrayBuffer()
  const audioContext = new AudioContext()
  let decodedBuffer: AudioBuffer
  try {
    decodedBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0))
  } catch (error) {
    await audioContext.close().catch(() => {})
    throw error
  }

  let renderedBuffer = decodedBuffer
  if (decodedBuffer.sampleRate !== targetSampleRate) {
    const offlineContext = new OfflineAudioContext(
      decodedBuffer.numberOfChannels,
      Math.max(1, Math.ceil(decodedBuffer.duration * targetSampleRate)),
      targetSampleRate,
    )
    const bufferSource = offlineContext.createBufferSource()
    bufferSource.buffer = decodedBuffer
    bufferSource.connect(offlineContext.destination)
    bufferSource.start(0)
    renderedBuffer = await offlineContext.startRendering()
  }

  const wavArrayBuffer = audioBufferToWav(renderedBuffer)
  await audioContext.close().catch(() => {})
  return new Blob([wavArrayBuffer], { type: 'audio/wav' })
}

function audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
  const numChannels = buffer.numberOfChannels
  const sampleRate = buffer.sampleRate
  const format = 1
  const bitDepth = 16
  const blockAlign = (numChannels * bitDepth) / 8
  const byteRate = sampleRate * blockAlign
  const dataLength = buffer.length * blockAlign
  const bufferLength = 44 + dataLength
  const arrayBuffer = new ArrayBuffer(bufferLength)
  const view = new DataView(arrayBuffer)

  writeString(view, 0, 'RIFF')
  view.setUint32(4, 36 + dataLength, true)
  writeString(view, 8, 'WAVE')
  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, format, true)
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, byteRate, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, bitDepth, true)
  writeString(view, 36, 'data')
  view.setUint32(40, dataLength, true)

  const interleaved = interleave(buffer)
  let offset = 44
  for (let i = 0; i < interleaved.length; i++, offset += 2) {
    let sample = Math.max(-1, Math.min(1, interleaved[i]))
    sample = sample < 0 ? sample * 0x8000 : sample * 0x7fff
    view.setInt16(offset, sample, true)
  }

  return arrayBuffer
}

function interleave(buffer: AudioBuffer): Float32Array {
  const length = buffer.length
  const result = new Float32Array(length * buffer.numberOfChannels)
  let offset = 0
  for (let i = 0; i < length; i++) {
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      result[offset++] = buffer.getChannelData(channel)[i]
    }
  }
  return result
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i))
  }
}
