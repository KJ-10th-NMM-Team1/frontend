import * as TabsPrimitive from '@radix-ui/react-tabs'

import { cn } from '../lib/utils'

export function TabsRoot(props: TabsPrimitive.TabsProps) {
  return <TabsPrimitive.Root {...props} />
}

export function TabsList({ className, ...props }: TabsPrimitive.TabsListProps) {
  return (
    <TabsPrimitive.List
      className={cn(
        'border-surface-4 bg-surface-2 inline-flex h-11 items-center gap-2 rounded-full border p-1',
        className,
      )}
      {...props}
    />
  )
}

export function TabsTrigger({ className, ...props }: TabsPrimitive.TabsTriggerProps) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'text-muted focus-visible:outline-hidden focus-visible:ring-accent data-[state=active]:bg-foreground data-[state=active]:text-surface-1 inline-flex h-9 items-center justify-center rounded-full px-4 text-sm font-medium transition focus-visible:ring-2 focus-visible:ring-offset-2',
        className,
      )}
      {...props}
    />
  )
}

export function TabsContent({ className, ...props }: TabsPrimitive.TabsContentProps) {
  return (
    <TabsPrimitive.Content
      className={cn(
        'focus-visible:outline-hidden focus-visible:ring-accent mt-6 focus-visible:ring-2',
        className,
      )}
      {...props}
    />
  )
}
