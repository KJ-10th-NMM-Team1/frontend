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
      voiceSampleId?: string // 보이스 샘플 매핑을 위한 ID
    }
