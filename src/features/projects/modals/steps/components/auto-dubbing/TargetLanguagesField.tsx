import { PlusCircle, X } from 'lucide-react'

import { Button } from '@/shared/ui/Button'
import { Label } from '@/shared/ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/Select'
import { ValidationMessage } from '@/shared/ui/ValidationMessage'

type TargetLanguagesFieldProps = {
  selectedTargets: string[]
  availableOptions: string[]
  pendingTarget: string
  onPendingChange: (value: string) => void
  onAddTarget: () => void
  onRemoveTarget: (language: string) => void
  error?: string
}

export function TargetLanguagesField({
  selectedTargets,
  availableOptions,
  pendingTarget,
  onPendingChange,
  onAddTarget,
  onRemoveTarget,
  error,
}: TargetLanguagesFieldProps) {
  return (
    <div className="space-y-3">
      <Label>타겟 언어</Label>
      <div className="">
        <div className="border-surface-4 flex flex-col gap-3 rounded-2xl border border-dashed p-4">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="flex-1">
              <Select value={pendingTarget} onValueChange={onPendingChange}>
                <SelectTrigger>
                  <SelectValue placeholder="추가할 언어를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {availableOptions.length === 0 ? (
                    <SelectItem disabled value="__no-option">
                      선택 가능한 언어가 없습니다
                    </SelectItem>
                  ) : (
                    availableOptions.map((language) => (
                      <SelectItem key={language} value={language}>
                        {language}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              variant="secondary"
              className="md:w-40"
              disabled={!pendingTarget}
              onClick={onAddTarget}
            >
              <PlusCircle className="h-4 w-4" />
              언어 추가
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedTargets.length === 0 ? (
              <p className="text-muted text-sm">추가된 타겟 언어가 없습니다.</p>
            ) : (
              selectedTargets.map((language) => (
                <span
                  key={language}
                  className="bg-surface-1 text-foreground border-surface-4 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm"
                >
                  {language}
                  <button
                    type="button"
                    className="text-muted hover:text-danger transition"
                    aria-label={`${language} 제거`}
                    onClick={() => onRemoveTarget(language)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))
            )}
          </div>
        </div>

        <ValidationMessage message={error} />
      </div>
    </div>
  )
}
