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
  languageCode?: string
  onSave?: () => void
}

export function AudioTrackWorkspace({
  segments,
  duration,
  originalAudioSrc,
  backgroundAudioSrc,
  languageCode,
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
    setPlaying,
    togglePlayback,
    isInitialLoadComplete,
    readyAudioIds,
    loadingProgress,
  } = useAudioTimeline(segments, duration, originalAudioSrc, backgroundAudioSrc, languageCode)

  // Register editor hotkeys
  useEditorHotkeys({
    playhead,
    setPlayhead,
    duration,
    setPlaying,
    togglePlayback,
    onSave,
  })

  return (
    <section className="flex h-full flex-col">
      <div className="flex h-full flex-col">
        {/* Controls - 항상 상단에 고정 */}
        <AudioTimelineControls />

        {/* 인라인 로딩 인디케이터 - 타임라인을 언마운트하지 않고 상태만 표시 */}
        {!isInitialLoadComplete && loadingProgress.totalCount > 0 && (
          <div className="border-outline/20 flex items-center gap-2 border-b bg-surface-2 px-4 py-2">
            <Spinner size="sm" />
            <span className="text-muted-foreground text-xs">
              오디오 세그먼트 로딩 중... ({loadingProgress.readyCount}/{loadingProgress.totalCount})
            </span>
            <div className="ml-2 h-1.5 flex-1 overflow-hidden rounded-full bg-surface-3">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{
                  width: `${(loadingProgress.readyCount / loadingProgress.totalCount) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Timeline 영역 - 스크롤 가능 */}
        <div className="timeline-scroll-container grid flex-1 overflow-auto lg:grid-cols-[220px,1fr]">
          {/* Sidebar */}
          <div className="border-outline/80 sticky left-0 z-40 hidden border-r bg-surface-1 lg:block">
            <AudioTrackSidebar trackRows={trackRows} getTrackRowHeight={getTrackRowHeight} />
          </div>

          {/* Timeline */}
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
