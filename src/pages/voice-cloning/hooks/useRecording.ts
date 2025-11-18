import { useCallback, useEffect, useRef, useState } from 'react'

import { convertBlobToWav } from '../utils/audioConverter'
import { createProcessedStream, supportsRecording } from '../utils/audioProcessor'

export type RecordingState = 'idle' | 'recording' | 'converting' | 'ready'

interface UseRecordingReturn {
  recordingState: RecordingState
  recordingSeconds: number
  recordedDuration: number
  micError: string | null
  startRecording: () => Promise<void>
  stopRecording: () => void
  resetRecording: (options?: { preserveDuration?: boolean }) => void
}

interface UseRecordingProps {
  onRecordingComplete?: (file: File, previewUrl: string, duration: number) => void
  onRecordingError?: (error: string) => void
}

export function useRecording({
  onRecordingComplete,
  onRecordingError,
}: UseRecordingProps = {}): UseRecordingReturn {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle')
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [recordedDuration, setRecordedDuration] = useState(0)
  const [micError, setMicError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const processedStreamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const recordedChunksRef = useRef<BlobPart[]>([])
  const timerRef = useRef<number | null>(null)

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
    }
  }, [resetRecording])

  const startRecording = useCallback(async () => {
    if (!supportsRecording()) {
      const errorMsg = '이 브라우저에서는 녹음을 지원하지 않습니다.'
      setMicError(errorMsg)
      onRecordingError?.(errorMsg)
      return
    }
    setMicError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStreamRef.current = stream
      recordedChunksRef.current = []

      const { processedStream, audioContext } = createProcessedStream(stream)
      audioContextRef.current = audioContext
      processedStreamRef.current = processedStream

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
        const blob = new Blob(recordedChunksRef.current, {
          type: options?.mimeType ?? 'audio/webm',
        })
        const baseName = `voice-recording-${new Date().toISOString().replace(/[:.]/g, '-')}`
        setRecordingState('converting')

        void convertBlobToWav(blob, 16_000)
          .then((wavBlob) => {
            const wavFile = new File([wavBlob], `${baseName}.wav`, { type: 'audio/wav' })
            const url = URL.createObjectURL(wavBlob)
            setRecordingState('ready')
            onRecordingComplete?.(wavFile, url, finalDuration)
          })
          .catch((error) => {
            console.error('Failed to convert recording', error)
            const errorMsg = '녹음 파일을 변환하는 중 문제가 발생했습니다.'
            setMicError(errorMsg)
            onRecordingError?.(errorMsg)
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
    } catch (error) {
      console.error('Failed to access microphone', error)
      const errorMsg = '마이크 권한이 필요합니다.'
      setMicError(errorMsg)
      onRecordingError?.(errorMsg)
      resetRecording()
    }
  }, [onRecordingComplete, onRecordingError, recordingSeconds, resetRecording])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    if (timerRef.current) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  return {
    recordingState,
    recordingSeconds,
    recordedDuration,
    micError,
    startRecording,
    stopRecording,
    resetRecording,
  }
}
