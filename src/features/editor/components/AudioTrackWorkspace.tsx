import type { Segment } from '@/entities/segment/types'
import { Spinner } from '@/shared/ui/Spinner'

import { useEditorHotkeys } from '../hooks/useEditorHotkeys'

import { AudioTimeline } from './audio-track/AudioTimeline'
import { AudioTimelineControls } from './audio-track/AudioTimelineControls'
import { AudioTrackSidebar } from './audio-track/AudioTrackSidebar'
import { useAudioTimeline } from './audio-track/useAudioTimeline'

type AudioTrackWorkspaceProps = {
  segments: Segment[]
  duration: number
  originalAudioSrc?: string
  backgroundAudioSrc?: string
  onSave?: () => void
}

export function AudioTrackWorkspace({
  segments,
  duration,
  originalAudioSrc,
  backgroundAudioSrc,
  onSave,
}: AudioTrackWorkspaceProps) {
  // Segments are now managed directly in tracks store via useAudioTimeline

  const {
    // playbackRate,
    // setPlaybackRate,
    trackRows,
    timelineTicks,
    originalWaveformData,
    originalWaveformLoading,
    backgroundWaveformData,
    backgroundWaveformLoading,
    timelineRef,
    playheadPercent,
    onTimelinePointerDown,
    getTrackRowHeight,
    playhead,
    setPlayhead,
    isPlaying,
    setPlaying,
    togglePlayback,
    formatTime,
    isInitialLoadComplete,
    readyAudioIds,
  } = useAudioTimeline(segments, duration, originalAudioSrc, backgroundAudioSrc)

  // Register editor hotkeys
  useEditorHotkeys({
    playhead,
    setPlayhead,
    duration,
    setPlaying,
    togglePlayback,
    onSave,
  })
  // Show loading indicator while initial segments are loading
  if (!isInitialLoadComplete) {
    return (
      <section className="border-surface-3 bg-surface-1 flex h-full flex-col border-t">
        <div className="border-surface-3 flex h-full flex-col items-center justify-center rounded-lg border">
          <Spinner size="lg" />
          <p className="text-muted mt-3 text-sm">초기 오디오 세그먼트 로딩 중...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="border-surface-3 bg-surface-1 flex h-full flex-col border-t">
      <div className="border-surface-3 flex h-full flex-col rounded-lg border">
        {/* Controls - 항상 상단에 고정 */}
        <AudioTimelineControls />

        {/* Timeline 영역 - 스크롤 가능 */}
        <div className="timeline-scroll-container grid flex-1 overflow-auto lg:grid-cols-[220px,1fr]">
          {/* Sidebar - sticky로 좌측 고정 */}
          <div className="border-surface-3 bg-surface-1 sticky left-0 z-40 hidden border-r lg:block">
            {/* Sidebar 콘텐츠 */}
            <AudioTrackSidebar trackRows={trackRows} getTrackRowHeight={getTrackRowHeight} />
          </div>

          {/* Timeline 콘텐츠 */}
          <div className="bg-surface-1">
            <AudioTimeline
              trackRows={trackRows}
              timelineTicks={timelineTicks}
              originalWaveformData={originalWaveformData}
              originalWaveformLoading={originalWaveformLoading}
              backgroundWaveformData={backgroundWaveformData}
              backgroundWaveformLoading={backgroundWaveformLoading}
              timelineRef={timelineRef}
              playheadPercent={playheadPercent}
              onTimelinePointerDown={onTimelinePointerDown}
              getTrackRowHeight={getTrackRowHeight}
              duration={duration}
              playhead={playhead}
              readyAudioIds={readyAudioIds}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
