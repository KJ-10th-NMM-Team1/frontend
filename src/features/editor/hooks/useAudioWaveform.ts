/**
 * React Query hook for audio waveform generation
 */

import { useQuery } from '@tanstack/react-query'

import { generateWaveformData, type WaveformResult } from '../utils/audio-waveform'

/**
 * Hook to generate and cache waveform data
 *
 * @param audioUrl - URL of the audio file
 * @param enabled - Whether to enable the query
 * @param samples - Number of waveform samples
 * @returns Query result with waveform data and audio duration
 */
export function useAudioWaveform(
  audioUrl: string | null | undefined,
  enabled = true,
  samples = 35,
) {
  return useQuery<WaveformResult>({
    queryKey: ['waveform', audioUrl, samples] as const,
    queryFn: async () => {
      if (!audioUrl) throw new Error('No audio URL provided')
      return generateWaveformData(audioUrl, samples)
    },
    enabled: !!audioUrl && enabled,
    staleTime: Infinity, // Waveform data never changes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    retry: 2,
  })
}
