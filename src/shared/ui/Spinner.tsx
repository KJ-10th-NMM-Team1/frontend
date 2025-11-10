import { cn } from '../lib/utils'

type SpinnerProps = {
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap: Record<NonNullable<SpinnerProps['size']>, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-[3px]',
  lg: 'h-10 w-10 border-[3px]',
}

export function Spinner({ size = 'md' }: SpinnerProps) {
  return (
    <span
      className={cn(
        'border-primary inline-block animate-spin rounded-full border-r-transparent',
        sizeMap[size],
      )}
    />
  )
}
