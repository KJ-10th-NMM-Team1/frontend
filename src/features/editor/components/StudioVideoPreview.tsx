import { useEffect, useRef, useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'
import { Pause, Play } from 'lucide-react'
import { shallow } from 'zustand/shallow'

import { apiGet } from '@/shared/api/client'
import { queryKeys } from '@/shared/config/queryKeys'
import { useEditorStore } from '@/shared/store/useEditorStore'
import { Button } from '@/shared/ui/Button'
import { throttle } from '@/shared/lib/utils/throttle'
import { getKeyframeTime, VIDEO_SEEK_CONFIG } from '@/features/editor/utils/video-keyframe'

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
  const seekingTimeoutRef = useRef<number>()
  const isFastSeekingRef = useRef<boolean>(false)
  const prevScrubbingRef = useRef<boolean>(false)

  const { playhead, isPlaying, isScrubbing, setPlayhead, setPlaying } = useEditorStore(
    (state) => ({
      playhead: state.playhead,
      isPlaying: state.isPlaying,
      isScrubbing: state.isScrubbing,
      setPlayhead: state.setPlayhead,
      setPlaying: state.setPlaying,
    }),
    shallow,
  )

  // Throttled video seeking function (100ms)
  // playhead는 즉시 업데이트되지만, 실제 비디오 시킹은 throttle 적용
  const seekVideo = useMemo(
    () =>
      throttle((video: HTMLVideoElement, targetTime: number, scrubbing: boolean) => {
        if (scrubbing) {
          // 스크러빙 중: 키프레임 기반 시킹 (빠른 시킹)
          const timeDiff = Math.abs(video.currentTime - targetTime)

          if (timeDiff > VIDEO_SEEK_CONFIG.FINE_SEEK_THRESHOLD) {
            // 큰 점프: 키프레임으로 이동
            const keyframeTime = getKeyframeTime(targetTime, VIDEO_SEEK_CONFIG.GOP_SIZE)

            // fastSeek API 사용 (지원하는 브라우저만)
            if ('fastSeek' in video && typeof (video as HTMLVideoElement & { fastSeek?: (time: number) => void }).fastSeek === 'function') {
              isFastSeekingRef.current = true
              const videoWithFastSeek = video as HTMLVideoElement & { fastSeek: (time: number) => void }
              videoWithFastSeek.fastSeek(keyframeTime)
            } else {
              video.currentTime = keyframeTime
            }
          } else {
            // 미세 조정: 정확한 프레임으로 이동
            video.currentTime = targetTime
          }
        } else {
          // 일반 시킹: 정확한 위치로 이동
          video.currentTime = targetTime
        }

        // Timeout으로 시킹 완료 대기
        if (seekingTimeoutRef.current) {
          clearTimeout(seekingTimeoutRef.current)
        }
        seekingTimeoutRef.current = window.setTimeout(() => {
          isFastSeekingRef.current = false
        }, VIDEO_SEEK_CONFIG.SEEK_TIMEOUT)
      }, VIDEO_SEEK_CONFIG.SCRUB_THROTTLE),
    [],
  )

  // playhead와 비디오 currentTime 동기화 (playhead -> video)
  // 최적화: 재생 중이 아닐 때만 동기화, 스크러빙 시 throttle 적용
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
    const timeDiff = Math.abs(video.currentTime - playhead)
    const playheadChanged = Math.abs(playhead - lastSyncedPlayheadRef.current) > 0.01

    if (playheadChanged && timeDiff > 0.05) {
      // Throttled seeking (스크러빙 중에만 throttle, 일반 시킹은 즉시 반영)
      seekVideo(video, playhead, isScrubbing)
      lastSyncedPlayheadRef.current = playhead
    }
  }, [playhead, isPlaying, isScrubbing, seekVideo])

  // 스크러빙 끝났을 때 정확한 위치로 보정
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // 스크러빙이 끝났을 때 (true → false)
    if (prevScrubbingRef.current && !isScrubbing) {
      // 정확한 위치로 시킹
      video.currentTime = playhead
    }

    prevScrubbingRef.current = isScrubbing
  }, [isScrubbing, playhead])

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
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            비디오를 불러올 수 없습니다
          </div>
        )}
      </div>

      {/* 재생 진행도 프로그레스 바 */}
      <div
        className="relative h-[6px] w-full cursor-pointer bg-surface-3"
        onClick={handleProgressClick}
        role="progressbar"
        aria-valuenow={playhead}
        aria-valuemin={0}
        aria-valuemax={duration}
      >
        <div
          className="absolute left-0 top-0 h-full bg-primary/80 transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 재생 컨트롤 바 */}
      <div className="flex items-center justify-between border-t border-surface-3 px-4 py-1">
        <Button
          size="sm"
          onClick={togglePlayPause}
          className="border-0 bg-opacity-0 text-gray-500 hover:bg-surface-3"
          aria-label={isPlaying ? '일시정지' : '재생'}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <div className="font-mono text-xs text-foreground">{formatTime(playhead)}</div>
      </div>
    </section>
  )
}
