import { Play } from 'lucide-react'

import { Button } from '@/shared/ui/Button'

type StudioVideoPreviewProps = {
  activeLanguage: string
  duration: number
  playbackRate: number
}

export function StudioVideoPreview({
  activeLanguage,
  duration,
  playbackRate,
}: StudioVideoPreviewProps) {
  return (
    <section className="border-surface-3 bg-surface-1 flex flex-col gap-3 rounded-3xl border p-4 shadow-soft">
      <header className="flex items-center justify-between text-sm">
        <span className="text-muted font-medium">{activeLanguage} 영상</span>
        <span className="text-muted">
          {duration}s · {playbackRate.toFixed(1)}x
        </span>
      </header>
      <div className="border-surface-3 relative overflow-hidden rounded-2xl border bg-black/5">
        <div className="pb-[56.25%]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Button variant="secondary" size="lg">
            <Play className="h-5 w-5" />
            재생
          </Button>
        </div>
      </div>
    </section>
  )
}
