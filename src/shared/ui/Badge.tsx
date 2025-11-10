import type { HTMLAttributes } from 'react'

import { cn } from '../lib/utils'

const colorMap: Record<string, { wrapper: string; dot: string }> = {
  processing: {
    wrapper: 'border-info/40 bg-info/10 text-info',
    dot: 'bg-info',
  },
  editing: {
    wrapper: 'border-warning/40 bg-warning/15 text-warning-darker',
    dot: 'bg-warning',
  },
  review: {
    wrapper: 'border-accent/40 bg-accent/15 text-accent-darker',
    dot: 'bg-accent',
  },
  done: {
    wrapper: 'border-success/40 bg-success/15 text-success-darker',
    dot: 'bg-success',
  },
  default: {
    wrapper: 'border-surface-4 bg-surface-3 text-muted',
    dot: 'bg-muted',
  },
}

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: keyof typeof colorMap
}

export function Badge({ className, tone = 'default', children, ...props }: BadgeProps) {
  const colors = colorMap[tone] ?? colorMap.default
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium',
        colors.wrapper,
        className,
      )}
      {...props}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', colors.dot)} aria-hidden="true" />
      {children}
    </span>
  )
}
