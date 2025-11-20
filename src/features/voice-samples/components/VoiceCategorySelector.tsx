import { VOICE_CATEGORIES } from '@/shared/constants/voiceCategories'
import { Label } from '@/shared/ui/Label'

export function VoiceCategorySelector({
  selected,
  onChange,
  disabled,
}: {
  selected: string[]
  onChange: (next: string[]) => void
  disabled?: boolean
}) {
  return (
    <div className="space-y-2 rounded-xl border border-surface-3 bg-surface-1 p-4">
      <Label>카테고리 (중복 가능)</Label>
      <div className="flex flex-wrap gap-2">
        {VOICE_CATEGORIES.map(({ code, label }) => {
          const isSelected = selected.includes(code)
          return (
            <button
              key={code}
              type="button"
              disabled={disabled}
              onClick={() => {
                const isAlreadySelected = selected.includes(code)
                const next = isAlreadySelected
                  ? selected.filter((c) => c !== code)
                  : [...selected, code]
                onChange(next)
              }}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                isSelected
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-surface-4 bg-surface-1 text-muted hover:border-primary'
              } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
            >
              {label}
            </button>
          )
        })}
      </div>
      <p className="text-xs text-muted">원하는 용도를 여러 개 선택하면 라이브러리 검색 시 더 잘 노출됩니다.</p>
    </div>
  )
}

