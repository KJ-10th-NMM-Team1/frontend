import type { ButtonHTMLAttributes } from 'react'
import { forwardRef } from 'react'

import { Slot } from '@radix-ui/react-slot'
import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

import { cn } from '../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md border text-sm font-medium transition-all duration-200 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 whitespace-nowrap active:scale-95',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover hover:shadow-md hover:-translate-y-[1px] border-transparent active:shadow-sm active:translate-y-0',
        secondary:
          'bg-surface-2 text-foreground border border-surface-4 hover:bg-surface-3/70 hover:shadow-md hover:-translate-y-[1px]  active:shadow-inner active:translate-y-0',
        subtle:
          'bg-transparent border-transparent text-muted hover:text-foreground hover:bg-surface-3/70 hover:shadow-sm',
        danger:
          'bg-danger text-danger-foreground border-transparent hover:bg-danger/90 hover:shadow-md hover:-translate-y-[1px] shadow-sm active:shadow-sm active:translate-y-0',
        outline:
          'border-primary bg-transparent text-primary hover:bg-primary/10 hover:text-primary hover:shadow-sm hover:border-primary/80',
        ghost:
          'border-transparent text-muted hover:bg-surface-3/70 hover:text-foreground hover:shadow-sm',
      },
      size: {
        sm: 'h-9 px-4 py-2 text-xs',
        md: 'h-10 px-5 py-2',
        lg: 'h-12 px-6 py-3 text-base',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

type ButtonProps = {
  asChild?: boolean
} & ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild = false, className, variant, size, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props} />
    )
  },
)

Button.displayName = 'Button'
