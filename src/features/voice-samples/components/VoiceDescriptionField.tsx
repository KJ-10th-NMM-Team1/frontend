import { Label } from '@/shared/ui/Label'

export function VoiceDescriptionField({
  value,
  onChange,
  disabled,
}: {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}) {
  return (
    <div className="space-y-2 rounded-xl border border-surface-3 bg-surface-1 p-4">
      <Label htmlFor="voice-notes">설명</Label>
      <textarea
        id="voice-notes"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="이 목소리에 대한 정보를 간단히 적어주세요."
        rows={3}
        className="focus-visible:outline-hidden w-full rounded-xl border border-surface-4 bg-surface-1 px-4 py-3 text-sm text-foreground shadow-inner shadow-black/5 transition focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={disabled}
      />
    </div>
  )
}

