import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group'

import { cn } from '../lib/utils'

export const ToggleGroup = ToggleGroupPrimitive.Root

export function ToggleGroupItem({
  className,
  ...props
}: ToggleGroupPrimitive.ToggleGroupItemProps) {
  return (
    <ToggleGroupPrimitive.Item
      className={cn(
        'text-muted data-[state=on]:border-primary/70 data-[state=on]:bg-primary/10 data-[state=on]:text-primary flex h-10 items-center justify-center rounded-full border border-transparent px-4 text-sm font-medium transition',
        className,
      )}
      {...props}
    />
  )
}
