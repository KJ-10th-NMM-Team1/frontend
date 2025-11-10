import type { InputHTMLAttributes } from 'react'
import { forwardRef } from 'react'

import { cn } from '../lib/utils'

type InputProps = InputHTMLAttributes<HTMLInputElement>

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          'border-surface-4 bg-surface-1 text-foreground focus-visible:outline-hidden focus-visible:ring-accent flex h-11 w-full rounded-xl border px-4 text-sm shadow-inner shadow-black/5 transition focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      />
    )
  },
)

Input.displayName = 'Input'
