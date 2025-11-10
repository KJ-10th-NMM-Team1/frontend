import type { ButtonHTMLAttributes } from 'react'
import { forwardRef } from 'react'

import { Slot } from '@radix-ui/react-slot'
import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

import { cn } from '../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md border text-sm font-medium transition-colors duration-150 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 whitespace-nowrap translation-all',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover border-transparent',
        secondary:
          'bg-surface-2 text-foreground border border-surface-4 hover:bg-surface-3/70 shadow-inner',
        subtle:
          'bg-transparent border-transparent text-muted hover:text-foreground hover:bg-surface-3/70',
        danger: 'bg-danger text-danger-foreground border-transparent hover:bg-danger/90 shadow-sm',
        outline:
          'border-primary bg-transparent text-primary hover:bg-primary/10 hover:text-primary',
        ghost: 'border-transparent text-muted hover:bg-surface-3/70 hover:text-foreground',
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
