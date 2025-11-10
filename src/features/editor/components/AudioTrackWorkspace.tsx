import type { Segment } from '@/entities/segment/types'

import { AudioTimeline } from './audio-track/AudioTimeline'
import { AudioTimelineControls } from './audio-track/AudioTimelineControls'
import { AudioTrackHeader } from './audio-track/AudioTrackHeader'
import { AudioTrackSidebar } from './audio-track/AudioTrackSidebar'
import { useAudioTimeline } from './audio-track/useAudioTimeline'

type AudioTrackWorkspaceProps = {
  segments: Segment[]
  duration: number
}

export function AudioTrackWorkspace({ segments, duration }: AudioTrackWorkspaceProps) {
  const {
    playbackRate,
    setPlaybackRate,
    trackRows,
    timelineTicks,
    waveformData,
    timelineRef,
    playheadPercent,
    onTimelinePointerDown,
    rowHeight,
    playhead,
    setPlayhead,
    isPlaying,
    togglePlayback,
    formatTime,
  } = useAudioTimeline(segments, duration)

  return (
    <section className="border-surface-3 bg-surface-1 flex flex-col gap-4 rounded-3xl border p-5 shadow-soft">
      <AudioTrackHeader
        playbackRate={playbackRate}
        onDecreaseRate={() => setPlaybackRate(Math.max(playbackRate - 0.1, 0.5))}
        onIncreaseRate={() => setPlaybackRate(Math.min(playbackRate + 0.1, 2))}
      />
      <div className="border-surface-3 grid rounded-2xl border lg:grid-cols-[220px,1fr]">
        <AudioTrackSidebar trackRows={trackRows} />
        <div className="bg-surface-1 flex flex-col">
          <AudioTimelineControls
            playhead={playhead}
            duration={duration}
            setPlayhead={setPlayhead}
            togglePlayback={togglePlayback}
            isPlaying={isPlaying}
            formatTime={formatTime}
          />
          <AudioTimeline
            trackRows={trackRows}
            timelineTicks={timelineTicks}
            waveformData={waveformData}
            timelineRef={timelineRef}
            playheadPercent={playheadPercent}
            onTimelinePointerDown={onTimelinePointerDown}
            rowHeight={rowHeight}
            duration={duration}
          />
        </div>
      </div>
    </section>
  )
}
