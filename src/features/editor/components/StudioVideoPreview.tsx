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
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // 비디오가 로드되지 않았으면 스킵
    if (video.readyState < 2) return

    // 차이가 0.1초 이상일 때만 동기화 (무한 루프 방지)
    const timeDiff = Math.abs(video.currentTime - playhead)
    if (timeDiff > 0.1) {
      video.currentTime = playhead
    }
  }, [playhead])

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
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progress = duration > 0 ? (playhead / duration) * 100 : 0

  return (
    <section className="border-surface-3 bg-surface-1 flex h-full flex-col shadow-soft">
      {/* <header className="flex items-center justify-between text-sm">
        <span className="text-muted font-medium">{activeLanguage} 영상</span>
        <span className="text-muted">
          {duration}s · {playbackRate.toFixed(1)}x
        </span>
      </header> */}
      <div className="border-surface-3 relative overflow-hidden border bg-black/5">
        <div className="pb-[56.25%]" />
        <div className="absolute inset-0 flex items-center justify-center">
          {videoSrc ? (
            <video
              ref={videoRef}
              controls={false}
              autoPlay={false}
              className={'h-auto max-h-[32em] min-h-[20em] w-full bg-black'}
              src={videoSrc}
              preload="metadata"
              muted
            >
              <track kind="captions" />
            </video>
          ) : (
            <div className="text-muted flex h-full items-center justify-center text-sm">
              비디오를 불러올 수 없습니다
            </div>
          )}
        </div>
      </div>

      {/* 재생 진행도 프로그레스 바 */}
      <div
        className="bg-surface-3 relative h-1 w-full cursor-pointer"
        onClick={handleProgressClick}
        role="progressbar"
        aria-valuenow={playhead}
        aria-valuemin={0}
        aria-valuemax={duration}
      >
        <div
          className="bg-primary absolute left-0 top-0 h-full transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 재생 컨트롤 바 */}
      <div className="border-surface-3 flex items-center justify-between border-t px-4 py-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={togglePlayPause}
          className="hover:bg-surface-3"
          aria-label={isPlaying ? '일시정지' : '재생'}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <div className="text-foreground font-mono text-xs">{formatTime(playhead)}</div>
      </div>
    </section>
  )
}
