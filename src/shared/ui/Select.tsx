import * as SelectPrimitive from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'

import { cn } from '../lib/utils'

export const Select = SelectPrimitive.Root
export const SelectValue = SelectPrimitive.Value

export function SelectTrigger({ className, ...props }: SelectPrimitive.SelectTriggerProps) {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        'border-surface-4 bg-surface-1 text-foreground focus-visible:outline-hidden focus-visible:ring-accent flex h-11 w-full items-center justify-between rounded-xl border px-4 text-sm shadow-inner shadow-black/5 focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <SelectValue />
      <SelectPrimitive.Icon>
        <ChevronDown className="text-muted h-4 w-4" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

export function SelectContent({ className, ...props }: SelectPrimitive.SelectContentProps) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        className={cn(
          'border-surface-4 bg-surface-1 z-50 min-w-[12rem] overflow-hidden rounded-2xl border shadow-xl shadow-black/10',
          className,
        )}
        {...props}
      >
        <SelectPrimitive.Viewport className="p-2">{props.children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

export function SelectItem({ className, children, ...props }: SelectPrimitive.SelectItemProps) {
  return (
    <SelectPrimitive.Item
      className={cn(
        'text-foreground data-[highlighted]:bg-surface-3/70 relative flex cursor-pointer select-none items-center gap-2 rounded-xl px-3 py-2 text-sm data-[state=checked]:font-medium',
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemIndicator className="absolute left-2 flex items-center">
        <Check className="h-3.5 w-3.5" />
      </SelectPrimitive.ItemIndicator>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}
