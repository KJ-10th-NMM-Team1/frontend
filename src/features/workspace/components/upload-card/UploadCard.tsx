import { Plus } from 'lucide-react'

import { Button } from '@/shared/ui/Button'
import { trackEvent } from '@/shared/lib/analytics'
import { cn } from '@/shared/lib/utils'
import { useUiStore } from '@/shared/store/useUiStore'

type UploadCardProps = {
  className?: string
}

type CreateEpisodeButtonProps = {
  className?: string
  label?: string
}

export function CreateEpisodeButton({
  className,
  label = '더빙·자막 만들기',
}: CreateEpisodeButtonProps) {
  const openProjectCreation = useUiStore((state) => state.openProjectCreation)

  return (
    <Button
      type="button"
      className={cn(
        'fixed bottom-20 right-20 z-40 flex h-20 w-20 items-center justify-center rounded-full bg-primary text-white shadow-xl transition hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-offset-2',
        className,
      )}
      aria-label={label}
      onClick={() => {
        trackEvent('open_create_modal')
        openProjectCreation('source')
      }}
    >
      <Plus className="h-6 w-6" aria-hidden />
    </Button>
  )
}

export function UploadCard({ className }: UploadCardProps) {
  return <CreateEpisodeButton className={className} />
}
