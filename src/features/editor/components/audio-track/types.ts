import type { Segment } from '@/entities/segment/types'

export type TrackRow =
  | {
      id: string
      label: string
      color: string
      type: 'waveform' | 'muted'
      size?: 'small' | 'medium' | 'large'
    }
  | {
      id: string
      label: string
      color: string
      type: 'speaker'
      segments: Segment[]
      size?: 'medium'
    }
