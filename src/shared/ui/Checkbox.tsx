import { forwardRef } from 'react'

import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { Check } from 'lucide-react'

import { cn } from '../lib/utils'

type CheckboxProps = CheckboxPrimitive.CheckboxProps

export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ className, ...props }, ref) => {
    const rootClassName = cn(
      'border-surface-4 bg-surface-1 focus-visible:outline-hidden focus-visible:ring-accent data-[state=checked]:bg-primary data-[state=checked]:border-primary flex h-5 w-5 items-center justify-center rounded-md border shadow-inner shadow-black/5 focus-visible:ring-2 focus-visible:ring-offset-2',
      typeof className === 'string' ? className : undefined,
    )

    return (
      <CheckboxPrimitive.Root ref={ref} className={rootClassName} {...props}>
        <CheckboxPrimitive.Indicator>
          <Check className="text-primary-foreground h-3.5 w-3.5" />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
    )
  },
)

Checkbox.displayName = 'Checkbox'
