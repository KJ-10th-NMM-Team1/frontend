import { useEffect } from 'react'
import type { RefObject } from 'react'

/**
 * Hook for audio player controls with spacebar toggle
 */
export function useAudioPlayer(audioRef: RefObject<HTMLAudioElement>, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return

    const handleSpaceToggle = (event: KeyboardEvent) => {
      if (event.code !== 'Space' && event.key !== ' ') return

      const targetTag = (event.target as HTMLElement | null)?.tagName
      if (targetTag && ['INPUT', 'TEXTAREA', 'SELECT'].includes(targetTag)) {
        return
      }

      const audio = audioRef.current
      if (!audio) return

      event.preventDefault()
      if (audio.paused) {
        void audio.play()
      } else {
        audio.pause()
      }
    }

    window.addEventListener('keydown', handleSpaceToggle)
    return () => {
      window.removeEventListener('keydown', handleSpaceToggle)
    }
  }, [audioRef, enabled])
}
