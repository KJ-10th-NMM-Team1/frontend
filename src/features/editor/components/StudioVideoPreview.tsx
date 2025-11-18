import { useEffect, useRef } from 'react'

import { useQuery } from '@tanstack/react-query'
import { Pause, Play } from 'lucide-react'
import { shallow } from 'zustand/shallow'

import { apiGet } from '@/shared/api/client'
import { queryKeys } from '@/shared/config/queryKeys'
import { useEditorStore } from '@/shared/store/useEditorStore'
import { Button } from '@/shared/ui/Button'

type StudioVideoPreviewProps = {
  activeLanguage: string
  duration: number
  playbackRate: number
  videoSource?: string
}

export function StudioVideoPreview({
  activeLanguage,
  duration,
  playbackRate,
  videoSource,
}: StudioVideoPreviewProps) {
  // video_only_source가 있으면 우선 사용, 없으면 video_source 사용
  const sourcePath = videoSource

  // Presigned URL 가져오기
  const { data: videoSrc } = useQuery({
    queryKey: queryKeys.storage.presignedUrl(sourcePath || ''),
    queryFn: () =>
      sourcePath
        ? apiGet<{ url: string }>(`api/storage/media/${sourcePath}`).then((data) => data.url)
        : Promise.resolve(undefined),
    enabled: !!sourcePath,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const videoRef = useRef<HTMLVideoElement>(null)
  const lastSyncedPlayheadRef = useRef<number>(0)
  const { playhead, isPlaying, setPlayhead, setPlaying } = useEditorStore(
    (state) => ({
      playhead: state.playhead,
      isPlaying: state.isPlaying,
      setPlayhead: state.setPlayhead,
      setPlaying: state.setPlaying,
    }),
    shallow,
  )

  // playhead와 비디오 currentTime 동기화 (playhead -> video)
  // 최적화: 재생 중이 아닐 때만 동기화 (재생 중에는 비디오가 자체적으로 재생)
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // 비디오가 로드되지 않았으면 스킵
    if (video.readyState < 2) return

    // 재생 중에는 동기화하지 않음 (60fps 업데이트로 인한 성능 저하 방지)
    if (isPlaying) {
      lastSyncedPlayheadRef.current = playhead
      return
    }

    // 일시정지 상태에서만 동기화
    // 수동 탐색(seek)이나 외부에서 playhead 변경 시에만 비디오 위치 업데이트
    const timeDiff = Math.abs(video.currentTime - playhead)
    const playheadChanged = Math.abs(playhead - lastSyncedPlayheadRef.current) > 0.01

    if (playheadChanged && timeDiff > 0.05) {
      video.currentTime = playhead
      lastSyncedPlayheadRef.current = playhead
    }
  }, [playhead, isPlaying])

  // 비디오의 play/pause 이벤트로 isPlaying 상태 동기화
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handlePlay = () => {
      setPlaying(true)
    }
    const handlePause = () => {
      setPlaying(false)
    }

    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    return () => {
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
    }
  }, [setPlaying])

  // isPlaying 상태와 비디오 재생 동기화 (store -> video)
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // 비디오가 실제로 재생 중인지 확인
    const isVideoPlaying = !video.paused && !video.ended && video.readyState > 2

    if (isPlaying && !isVideoPlaying) {
      void video.play().catch(console.error)
    } else if (!isPlaying) {
      video.pause()
    }
  }, [isPlaying])

  // 비디오의 timeupdate 이벤트로 playhead 업데이트 (video -> playhead)
  // useEffect(() => {
  //   const video = videoRef.current
  //   if (!video) return

  //   const handleTimeUpdate = () => {
  //     // 비디오가 실제로 재생 중일 때만 playhead 업데이트
  //     const isVideoPlaying = !video.paused && !video.ended
  //     if (isVideoPlaying) {
  //       // 차이가 0.05초 이상일 때만 업데이트 (너무 자주 업데이트 방지)
  //       const timeDiff = Math.abs(video.currentTime - playhead)
  //       if (timeDiff > 0.05) {
  //         setPlayhead(video.currentTime)
  //       }
  //     }
  //   }

  //   // 비디오의 재생바를 드래그했을 때 (seeked 이벤트)
  //   const handleSeeked = () => {
  //     // 재생바를 드래그했을 때는 즉시 playhead 업데이트
  //     const timeDiff = Math.abs(video.currentTime - playhead)
  //     if (timeDiff > 0.05) {
  //       setPlayhead(video.currentTime)
  //     }
  //   }

  //   video.addEventListener('timeupdate', handleTimeUpdate)
  //   video.addEventListener('seeked', handleSeeked)
  //   return () => {
  //     video.removeEventListener('timeupdate', handleTimeUpdate)
  //     video.removeEventListener('seeked', handleSeeked)
  //   }
  // }, [playhead, setPlayhead])

  // playbackRate 동기화
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.playbackRate = playbackRate
  }, [playbackRate])

  const togglePlayPause = () => {
    setPlaying(!isPlaying)
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    const newTime = percentage * duration
    setPlayhead(newTime)
    setPlaying(false)
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progress = duration > 0 ? (playhead / duration) * 100 : 0

  return (
    <section className="flex h-full flex-col border-surface-3 bg-surface-1 shadow-soft">
      {/* <header className="flex items-center justify-between text-sm">
        <span className="text-muted font-medium">{activeLanguage} 영상</span>
        <span className="text-muted">
          {duration}s · {playbackRate.toFixed(1)}x
        </span>
      </header> */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden border border-surface-3 bg-black">
        {videoSrc ? (
          <video
            ref={videoRef}
            controls={false}
            autoPlay={false}
            className="h-full w-full object-contain"
            src={videoSrc}
            preload="metadata"
            muted
          >
            <track kind="captions" />
          </video>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">
            비디오를 불러올 수 없습니다
          </div>
        )}
      </div>

      {/* 재생 진행도 프로그레스 바 */}
      <div
        className="relative h-1 w-full cursor-pointer bg-surface-3"
        onClick={handleProgressClick}
        role="progressbar"
        aria-valuenow={playhead}
        aria-valuemin={0}
        aria-valuemax={duration}
      >
        <div
          className="absolute left-0 top-0 h-full bg-primary transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 재생 컨트롤 바 */}
      <div className="flex items-center justify-between border-t border-surface-3 px-4 py-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={togglePlayPause}
          className="hover:bg-surface-3"
          aria-label={isPlaying ? '일시정지' : '재생'}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <div className="font-mono text-xs text-foreground">{formatTime(playhead)}</div>
      </div>
    </section>
  )
}
