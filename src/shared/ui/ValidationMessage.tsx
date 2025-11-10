import type { ReactNode } from 'react'

import { cn } from '@/shared/lib/utils'

type ValidationMessageProps = {
  message?: ReactNode
  className?: string
}

export function ValidationMessage({ message, className }: ValidationMessageProps) {
  const hasMessage = Boolean(message)

  return (
    <p
      aria-live="polite"
      role={hasMessage ? 'alert' : undefined}
      className={cn(
        'text-danger min-h-1 text-[11px] font-semibold leading-tight',
        'bg-danger/10 inline-flex w-fit items-center gap-1.5 rounded-full',
        'transition-all duration-150',
        hasMessage ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-1 opacity-0',
        className,
      )}
    >
      <span className="bg-danger h-1.5 w-1.5 rounded-full" aria-hidden="true" />
      {message ?? ' '}
    </p>
  )
}
