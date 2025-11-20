import type { FilterChip } from '../hooks/useVoiceLibraryFilters'

type FilterChipsBarProps = {
  chips: FilterChip[]
  onReset: () => void
}

export function FilterChipsBar({ chips, onReset }: FilterChipsBarProps) {
  if (chips.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip, index) => (
        <div
          key={`${chip.label}-${chip.value}-${index}`}
          className="flex items-center gap-2 rounded-full border border-surface-3 bg-surface-1 px-2 py-1 text-xs font-medium"
        >
          <span className="rounded-lg bg-surface-2 px-2 py-0.5 text-[11px] text-muted">
            {chip.label}
          </span>
          {chip.icon ? <span className="pl-1">{chip.icon}</span> : null}
          <span className="text-foreground">{chip.value}</span>
          <button
            type="button"
            onClick={chip.onRemove}
            className="text-muted hover:text-foreground"
            aria-label={`${chip.label} 필터 제거`}
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={onReset}
        className="ml-1 rounded-full border border-surface-3 bg-surface-1 px-3 py-1 text-xs font-semibold text-muted transition hover:border-primary hover:text-primary"
      >
        필터 초기화
      </button>
    </div>
  )
}
