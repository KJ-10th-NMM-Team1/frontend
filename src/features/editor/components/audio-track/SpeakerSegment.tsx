import { useMemo, useState, useRef, useCallback } from 'react'

import type { Segment } from '@/entities/segment/types'
import { useAudioWaveform } from '@/features/editor/hooks/useAudioWaveform'
import { useSegmentContextMenu } from '@/features/editor/hooks/useSegmentContextMenu'
import { useSegmentDrag } from '@/features/editor/hooks/useSegmentDrag'
import { useSegmentMerge } from '@/features/editor/hooks/useSegmentMerge'
import { findAdjacentSegments } from '@/features/editor/utils/segment-constraints'
import { timeToPixel } from '@/features/editor/utils/timeline-scale'
import { usePresignedUrl } from '@/shared/api/hooks'
import { useIntersectionObserverOnce } from '@/shared/lib/hooks/useIntersectionObserver'
import { cn } from '@/shared/lib/utils'
import { useEditorStore } from '@/shared/store/useEditorStore'

import { MergeButton } from './MergeButton'
import { SegmentContextMenu } from './SegmentContextMenu'
import { SegmentResizeHandle } from './SegmentResizeHandle'
import { SegmentLoadingSpinner, SegmentWaveform } from './SegmentWaveform'

type TrackLayout = {
  trackId: string
  yStart: number
  yEnd: number
}

type SpeakerSegmentProps = {
  segment: Segment
  duration: number
  scale: number
  color: string
  currentTrackId: string
  trackLayouts?: TrackLayout[]
  voiceSampleId?: string
  isAudioReady?: boolean
  trackSegments: Segment[]
}

export function SpeakerSegment({
  segment,
  duration,
  scale,
  color,
  currentTrackId,
  trackLayouts,
  voiceSampleId,
  isAudioReady = true,
  trackSegments,
}: SpeakerSegmentProps) {
  const isSegmentLoading = useEditorStore((state) => state.isSegmentLoading)
  const startPx = timeToPixel(segment.start, duration, scale)
  const widthPx = Math.max(timeToPixel(segment.end - segment.start, duration, scale), 64)

  // Check if this segment is currently generating audio
  const isGenerating = isSegmentLoading(segment.id)

  // Merge functionality
  const { handleMerge } = useSegmentMerge()

  // Find next segment and check if it's touching (no gap)
  // Only show merge button on the left segment (current segment)
  // to avoid duplicate buttons between two segments
  const nextTouchingSegment = useMemo(() => {
    const { next } = findAdjacentSegments(trackSegments, segment.id)

    // Check if next segment is actually touching (no gap)
    const isTouching = next && next.start === segment.end

    return isTouching ? next : null
  }, [trackSegments, segment.id, segment.end])

  // Drag functionality (supports both horizontal and vertical movement)
  const { onPointerDown, isDragging, verticalOffset } = useSegmentDrag({
    segment,
    duration,
    scale,
    currentTrackId,
    trackLayouts,
  })

  // Context menu functionality
  const {
    isOpen: isContextMenuOpen,
    position: contextMenuPosition,
    handleContextMenu,
    handleClose: handleContextMenuClose,
    handleGenerateFixed,
    handleGenerateDynamic,
  } = useSegmentContextMenu({
    segment,
    voiceSampleId,
  })

  // Lazy loading for waveform visualization (뷰포트에 진입했을 때만 파형 로드)
  const [ref, isVisible] = useIntersectionObserverOnce<HTMLDivElement>({
    rootMargin: '300px', // 뷰포트 진입 300px 전부터 로드 시작
    threshold: 0.01, // 1%만 보여도 로드 시작
  })

  // Step 1: Get presigned URL (always enabled for audio playback)
  const { data: audioSrc, isLoading: urlLoading } = usePresignedUrl(segment.segment_audio_url, {
    staleTime: 5 * 60 * 1000,
    enabled: true, // 항상 로드 (재생을 위해 필요)
  })

  // Step 2: Generate waveform from audio URL (only when URL is available)
  // 리사이즈 중에는 파형 업데이트 방지 (마우스를 놓았을 때만 업데이트)
  const [isResizing, setIsResizing] = useState(false)
  const stableSamplesRef = useRef<number | null>(null)

  const BAR_UNIT = 2.5 // 바 하나당 차지하는 공간 (더 촘촘하게)
  const availableWidth = widthPx - 16 // 좌우 padding 8px씩 제외
  const currentOptimalSamples = Math.max(Math.floor(availableWidth / BAR_UNIT), 20) // 최소 20개

  // 리사이즈 중이 아닐 때만 샘플 수 업데이트
  if (!isResizing) {
    stableSamplesRef.current = currentOptimalSamples
  }
  const samplesForQuery = stableSamplesRef.current ?? currentOptimalSamples

  // 리사이즈 콜백
  const handleResizeStart = useCallback(() => setIsResizing(true), [])
  const handleResizeEnd = useCallback(() => setIsResizing(false), [])

  const { data: waveformData, isLoading: waveformLoading } = useAudioWaveform(
    audioSrc,
    !!audioSrc && isVisible, // URL 있고 visible일 때만 파형 생성
    samplesForQuery,
  )

  const isLoading = isVisible && (urlLoading || waveformLoading)

  const hexToRgba = (hex: string, alpha: number) => {
    const normalized = hex.replace('#', '')
    if (normalized.length !== 6) return hex
    const r = parseInt(normalized.slice(0, 2), 16)
    const g = parseInt(normalized.slice(2, 4), 16)
    const b = parseInt(normalized.slice(4, 6), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  const backgroundColor = color.startsWith('#') ? hexToRgba(color, 0.12) : color

  return (
    <>
      <div
        ref={ref}
        onPointerDown={onPointerDown}
        onContextMenu={handleContextMenu}
        className={cn(
          'group absolute top-3 z-10 flex h-[60px] items-center justify-between rounded-2xl border px-3 text-xs font-semibold',
          (isLoading || isGenerating || !isAudioReady) && 'opacity-60',
          isDragging && 'cursor-grabbing opacity-60 shadow-lg',
          !isDragging && 'cursor-grab transition-opacity',
          !isAudioReady && 'border-dashed',
        )}
        style={{
          left: `${startPx}px`,
          width: `${widthPx}px`,
          backgroundColor,
          borderColor: color,
          color: color,
          // Y축 드래그 시 마우스를 따라 이동
          transform: verticalOffset !== 0 ? `translateY(${verticalOffset}px)` : undefined,
          transition: verticalOffset !== 0 ? 'none' : undefined,
        }}
      >
        {/* Left resize handle */}
        <SegmentResizeHandle
          segment={segment}
          duration={duration}
          scale={scale}
          edge="start"
          color={color}
          trackSegments={trackSegments}
          onResizeStart={handleResizeStart}
          onResizeEnd={handleResizeEnd}
        />

        {/* Waveform visualization */}
        {!isVisible ? null : isLoading || isGenerating || !isAudioReady || isResizing ? ( // 뷰포트 밖: 플레이스홀더 (아무것도 표시 안함)
          // 로딩 중 또는 오디오 생성 중 또는 오디오 준비 안됨 또는 리사이즈 중: 스피너
          <SegmentLoadingSpinner color={color} size="sm" />
        ) : waveformData ? (
          // 로드 완료: 파형 표시
          <SegmentWaveform
            waveformData={waveformData.data}
            color={color}
            widthPx={widthPx}
            height={60}
            audioDuration={waveformData.duration}
            segmentDuration={segment.end - segment.start}
          />
        ) : null}

        {/* Right resize handle */}
        <SegmentResizeHandle
          segment={segment}
          duration={duration}
          scale={scale}
          edge="end"
          color={color}
          trackSegments={trackSegments}
          onResizeStart={handleResizeStart}
          onResizeEnd={handleResizeEnd}
        />

        {/* Merge button - show only when there's a touching next segment */}
        {/* This prevents duplicate buttons between two segments */}
        {nextTouchingSegment && (
          <MergeButton
            currentSegment={segment}
            nextSegment={nextTouchingSegment}
            onMerge={handleMerge}
            color={color}
          />
        )}
      </div>

      {/* Context Menu */}
      <SegmentContextMenu
        isOpen={isContextMenuOpen}
        position={contextMenuPosition}
        onClose={handleContextMenuClose}
        onGenerateFixed={handleGenerateFixed}
        onGenerateDynamic={handleGenerateDynamic}
      />
    </>
  )
}
