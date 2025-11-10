type ProgressProps = {
  value: number
  label?: string
}

export function Progress({ value, label }: ProgressProps) {
  return (
    <div className="space-y-2">
      {label ? <p className="text-muted text-xs font-medium">{label}</p> : null}
      <div className="bg-surface-4 h-2 w-full overflow-hidden rounded-full">
        <div
          className="bg-primary h-full rounded-full transition-all duration-300"
          style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
        />
      </div>
    </div>
  )
}
