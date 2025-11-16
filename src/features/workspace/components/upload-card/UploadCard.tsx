import { AudioLines } from 'lucide-react'

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

export function CreateEpisodeButton({ className, label = '더빙·자막 만들기' }: CreateEpisodeButtonProps) {
  const openProjectCreation = useUiStore((state) => state.openProjectCreation)

  return (
    <Button
      type="button"
      size="md"
      className={cn(
        'rounded-full bg-gradient-to-r from-primary to-primary/80 px-6 py-3 text-base font-semibold shadow-soft hover:from-primary-hover hover:to-primary/80',
        className,
      )}
      onClick={() => {
        trackEvent('open_create_modal')
        openProjectCreation('source')
      }}
    >
      <AudioLines className="h-5 w-5" aria-hidden />
      {label}
    </Button>
  )
}

export function UploadCard({ className }: UploadCardProps) {
  return <CreateEpisodeButton className={className} />
}
