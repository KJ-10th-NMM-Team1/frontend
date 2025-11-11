import { useEffect, useRef, type FC } from 'react'

interface VideoPlayerProps {
  src: string
  active: boolean
}

const VideoPlayer: FC<VideoPlayerProps> = ({ active, src }) => {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const v = ref.current
    if (!v) return
    if (!active) v.pause()
  }, [active])

  return (
    <video
      ref={ref}
      src={src}
      controls
      preload="metadata"
      playsInline
      className={active ? 'h-auto max-h-[32em] min-h-[20em] w-full bg-black' : 'hidden'}
    />
  )
}

export default VideoPlayer
