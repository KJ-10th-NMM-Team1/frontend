import type { Segment } from '@/entities/segment/types'

export type TrackRow =
  | {
      id: string
      label: string
      color: string
      type: 'waveform' | 'muted'
    }
  | {
      id: string
      label: string
      color: string
      type: 'speaker'
      segments: Segment[]
    }

export type WaveformBar = {
  id: number | string
  height: number
}
