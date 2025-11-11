import { useEffect, useMemo, useState } from 'react'

import type { WaveformBar } from '@/features/editor/components/audio-track/types'
import { resolveMediaUrl } from '@/shared/lib/media'

const BAR_COUNT = 256

const buildWaveform = (channelData: Float32Array): WaveformBar[] => {
  if (channelData.length === 0) return []
  const samplesPerBar = Math.max(1, Math.floor(channelData.length / BAR_COUNT))
  const bars: WaveformBar[] = []
  for (let index = 0; index < BAR_COUNT; index += 1) {
    const start = index * samplesPerBar
    if (start >= channelData.length) break
    const end = Math.min(start + samplesPerBar, channelData.length)
    let sum = 0
    for (let i = start; i < end; i += 1) {
      sum += Math.abs(channelData[i])
    }
    const avg = sum / (end - start || 1)
    bars.push({ id: index, height: Math.min(100, avg * 200) })
  }
  return bars
}

type FetchAudioResult = {
  arrayBuffer: ArrayBuffer
  playbackUrl: string
}

async function fetchAudioData(
  mediaUrl: string,
  signal: AbortSignal,
  withCredentials: boolean,
): Promise<FetchAudioResult> {
  const response = await fetch(mediaUrl, {
    signal,
    credentials: withCredentials ? 'include' : 'same-origin',
  })
  if (!response.ok) {
    throw new Error(`Failed to load audio (${response.status})`)
  }

  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    const payload = await response
      .clone()
      .json()
      .catch(() => null)
    const signedUrl = payload?.url ?? payload?.signedUrl ?? payload?.audio_url
    if (!signedUrl) {
      throw new Error('Signed audio URL is missing in the response body')
    }
    const audioResponse = await fetch(signedUrl, { signal, credentials: 'same-origin' })
    if (!audioResponse.ok) {
      throw new Error(`Failed to fetch signed audio (${audioResponse.status})`)
    }
    return { arrayBuffer: await audioResponse.arrayBuffer(), playbackUrl: signedUrl }
  }

  return { arrayBuffer: await response.arrayBuffer(), playbackUrl: mediaUrl }
}

export function useWaveformData(sourceKey?: string) {
  const [waveform, setWaveform] = useState<WaveformBar[] | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)
  const mediaUrl = resolveMediaUrl(sourceKey)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!mediaUrl) {
      setWaveform(undefined)
      return
    }
    const controller = new AbortController()
    let cancelled = false

    async function loadWaveform() {
      setIsLoading(true)
      setError(null)
      try {
        const { arrayBuffer, playbackUrl } = await fetchAudioData(mediaUrl, controller.signal, true)

        if (cancelled) return

        const htmlAudio = new Audio(playbackUrl)
        htmlAudio.preload = 'auto'
        htmlAudio.crossOrigin = 'anonymous'
        setAudioElement(htmlAudio)
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
        if (!AudioContextClass) throw new Error('Web Audio API is not supported in this browser')
        const audioContext = new AudioContextClass()
        try {
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
          if (cancelled) return
          const channelData =
            audioBuffer.numberOfChannels > 0 ? audioBuffer.getChannelData(0) : null
          if (!channelData) {
            setWaveform(undefined)
            return
          }

          const bars = buildWaveform(channelData)
          setWaveform(bars.length > 0 ? bars : undefined)
        } finally {
          await audioContext.close()
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    loadWaveform()
    return () => {
      cancelled = true
      controller.abort()
    }
  }, [mediaUrl])

  return useMemo(
    () => ({
      waveformData: waveform,
      isWaveformLoading: isLoading,
      waveformError: error,
      audioElement,
    }),
    [waveform, isLoading, error, audioElement],
  )
}
