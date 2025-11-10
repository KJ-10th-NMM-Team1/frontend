import { AudioLines } from 'lucide-react'

import { trackEvent } from '@/shared/lib/analytics'
import { useUiStore } from '@/shared/store/useUiStore'

export function UploadCard() {
  const openProjectCreation = useUiStore((state) => state.openProjectCreation)

  return (
    <button
      type="button"
      className="bg-primary text-primary-foreground hover:bg-primary shadow-primary/30 translation hover:bg-primary-hover flex h-28 w-full items-center gap-4 rounded-[24px] px-8 text-left text-2xl font-semibold text-white shadow-lg outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
      onClick={() => {
        trackEvent('open_create_modal')
        openProjectCreation('source')
      }}
    >
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-white">
        <AudioLines className="h-10 w-10" aria-hidden />
      </span>

      <div className="flex flex-col gap-1">
        <span className="leading-tight">더빙·자막 만들기</span>
        <span className="text-sm leading-tight">AI 자동 더빙 영상을 만들어보세요</span>
      </div>
    </button>
  )
}
