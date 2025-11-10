import * as React from 'react'
import { forwardRef } from 'react'

import * as DropdownPrimitive from '@radix-ui/react-dropdown-menu'

import { cn } from '../lib/utils'

const DropdownMenu = DropdownPrimitive.Root
const DropdownMenuTrigger = DropdownPrimitive.Trigger
const DropdownMenuGroup = DropdownPrimitive.Group
const DropdownMenuPortal = DropdownPrimitive.Portal
const DropdownMenuSub = DropdownPrimitive.Sub
const DropdownMenuRadioGroup = DropdownPrimitive.RadioGroup

const DropdownMenuContent = forwardRef<
  React.ElementRef<typeof DropdownPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownPrimitive.Content>
>(({ className, sideOffset = 8, ...props }, ref) => (
  <DropdownPrimitive.Portal>
    <DropdownPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'border-surface-3 bg-surface-1 text-foreground focus-visible:outline-hidden z-50 min-w-[12rem] rounded-2xl border p-2 text-sm shadow-soft',
        'data-[side=bottom]:animate-in data-[side=bottom]:slide-in-from-bottom-2 data-[side=top]:slide-in-from-top-2',
        className,
      )}
      {...props}
    />
  </DropdownPrimitive.Portal>
))

DropdownMenuContent.displayName = DropdownPrimitive.Content.displayName

const DropdownMenuItem = forwardRef<
  React.ElementRef<typeof DropdownPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownPrimitive.Item>
>(({ className, ...props }, ref) => (
  <DropdownPrimitive.Item
    ref={ref}
    className={cn(
      'text-foreground focus:bg-surface-2 focus:text-foreground flex cursor-pointer select-none items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium outline-none',
      className,
    )}
    {...props}
  />
))
DropdownMenuItem.displayName = DropdownPrimitive.Item.displayName

const DropdownMenuLabel = forwardRef<
  React.ElementRef<typeof DropdownPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownPrimitive.Label>
>(({ className, ...props }, ref) => (
  <DropdownPrimitive.Label
    ref={ref}
    className={cn(
      'text-muted px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em]',
      className,
    )}
    {...props}
  />
))
DropdownMenuLabel.displayName = DropdownPrimitive.Label.displayName

const DropdownMenuSeparator = forwardRef<
  React.ElementRef<typeof DropdownPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownPrimitive.Separator
    ref={ref}
    className={cn('bg-surface-3 my-2 h-px w-full', className)}
    {...props}
  />
))
DropdownMenuSeparator.displayName = DropdownPrimitive.Separator.displayName

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuRadioGroup,
}
