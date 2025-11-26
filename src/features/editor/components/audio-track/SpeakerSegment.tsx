import { useRef, useState, useMemo, useCallback } from 'react'

import { Type, AudioWaveform } from 'lucide-react'

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
import { useTracksStore } from '@/shared/store/useTracksStore'

import { MergeButton } from './MergeButton'
import { SegmentContextMenu } from './SegmentContextMenu'
import { SegmentResizeHandle } from './SegmentResizeHandle'
import { SegmentLoadingSpinner, SegmentWaveform } from './SegmentWaveform'
import { SegmentTextOverlay } from './SegmentTextOverlay'

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
  const { activeSegmentId, setActiveSegment, isSegmentLoading, isTextMode, toggleTextMode } =
    useEditorStore((state) => ({
      activeSegmentId: state.activeSegmentId,
      setActiveSegment: state.setActiveSegment,
      isSegmentLoading: state.isSegmentLoading,
      isTextMode: state.isTextMode,
      toggleTextMode: state.toggleTextMode,
    }))
  const updateSegment = useTracksStore((state) => state.updateSegment)

  const isFocused = activeSegmentId === segment.id
  const showTextOverlay = isFocused && isTextMode
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

  // Handle click to focus segment
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      // Don't focus if we're dragging
      if (isDragging) return
      // Prevent focusing on resize handles
      if ((e.target as HTMLElement).closest('[data-resize-handle]')) return

      setActiveSegment(segment.id)
    },
    [isDragging, segment.id, setActiveSegment],
  )

  // Text change handlers
  const handleSourceChange = useCallback(
    (value: string) => {
      updateSegment(segment.id, { source_text: value })
    },
    [segment.id, updateSegment],
  )

  const handleTargetChange = useCallback(
    (value: string) => {
      updateSegment(segment.id, { target_text: value })
    },
    [segment.id, updateSegment],
  )

  return (
    <>
      <div
        ref={ref}
        onPointerDown={onPointerDown}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        className={cn(
          'group absolute top-3 z-10 flex h-[60px] items-center justify-between rounded-2xl border px-3 text-xs font-semibold',
          (isLoading || isGenerating || !isAudioReady) && 'opacity-60',
          isDragging && 'cursor-grabbing opacity-60 shadow-lg',
          !isDragging && !isFocused && 'cursor-grab transition-opacity',
          isFocused && 'ring-2 ring-offset-1',
          isFocused && !showTextOverlay && 'cursor-grab',
          showTextOverlay && 'cursor-text',
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
          // Focus 시 ring color 설정
          // @ts-expect-error CSS custom property
          '--tw-ring-color': isFocused ? color : undefined,
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

        {/* Waveform visualization - dimmed when in text mode */}
        <div
          className={cn(
            'pointer-events-none absolute inset-0 transition-opacity duration-150',
            showTextOverlay && 'opacity-30',
          )}
        >
          {!isVisible ? null : isLoading || isGenerating || !isAudioReady ? (
            <SegmentLoadingSpinner color={color} size="sm" />
          ) : waveformData ? (
            <SegmentWaveform
              waveformData={waveformData.data}
              color={color}
              widthPx={widthPx}
              height={60}
              audioDuration={waveformData.duration}
              segmentDuration={segment.end - segment.start}
            />
          ) : null}
        </div>

        {/* Text overlay when focused and in text mode */}
        {showTextOverlay && (
          <SegmentTextOverlay
            sourceText={segment.source_text || ''}
            targetText={segment.target_text || ''}
            onSourceChange={handleSourceChange}
            onTargetChange={handleTargetChange}
            color={color}
          />
        )}

        {/* Toggle button for text/waveform mode - only show when focused */}
        {isFocused && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              toggleTextMode()
            }}
            className="absolute -top-2 right-2 z-20 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-md transition-transform hover:scale-110"
            style={{ color }}
            title={isTextMode ? '파형 보기' : '텍스트 편집'}
          >
            {isTextMode ? <AudioWaveform className="h-3 w-3" /> : <Type className="h-3 w-3" />}
          </button>
        )}

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
