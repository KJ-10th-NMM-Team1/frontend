import type { Segment } from '@/entities/segment/types'

import { useEditorHotkeys } from '../hooks/useEditorHotkeys'

import { AudioTimeline } from './audio-track/AudioTimeline'
import { AudioTimelineControls } from './audio-track/AudioTimelineControls'
import { AudioTrackSidebar } from './audio-track/AudioTrackSidebar'
import { useAudioTimeline } from './audio-track/useAudioTimeline'

type AudioTrackWorkspaceProps = {
  segments: Segment[]
  duration: number
}

export function AudioTrackWorkspace({ segments, duration }: AudioTrackWorkspaceProps) {
  const {
    // playbackRate,
    // setPlaybackRate,
    trackRows,
    timelineTicks,
    waveformData,
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
  } = useAudioTimeline(segments, duration)

  // Register editor hotkeys
  useEditorHotkeys({
    playhead,
    setPlayhead,
    duration,
    setPlaying,
    togglePlayback,
  })
  return (
    <section className="border-surface-3 bg-surface-1 flex h-full flex-col border-t shadow-soft">
      <div className="border-surface-3 flex h-full flex-col rounded-2xl border">
        {/* Controls - 항상 상단에 고정 */}
        <AudioTimelineControls
          playhead={playhead}
          duration={duration}
          setPlayhead={setPlayhead}
          togglePlayback={togglePlayback}
          isPlaying={isPlaying}
          formatTime={formatTime}
        />

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
              waveformData={waveformData}
              timelineRef={timelineRef}
              playheadPercent={playheadPercent}
              onTimelinePointerDown={onTimelinePointerDown}
              getTrackRowHeight={getTrackRowHeight}
              duration={duration}
              playhead={playhead}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
