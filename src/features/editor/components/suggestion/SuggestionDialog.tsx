import {
  AlignJustify,
  ArrowLeftRight,
  ArrowRight,
  ChevronsLeftRight,
  RefreshCw,
} from 'lucide-react'

import { SuggestionContext } from '@/entities/suggestion/types'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/shared/ui/Dialog'
import { Button } from '@/shared/ui/Button'

type SuggestionDialogProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onRequestSuggestion: (context: SuggestionContext) => void
  suggestionText: string
}

export function SuggestionDialog({
  isOpen,
  onOpenChange,
  onRequestSuggestion,
  suggestionText,
}: SuggestionDialogProps) {
  const suggestionOptions = [
    { code: SuggestionContext.Short, label: '짧게', icon: ChevronsLeftRight },
    { code: SuggestionContext.SlightlyShorter, label: '조금 짧게', icon: ArrowLeftRight },
    { code: SuggestionContext.Retranslate, label: '다시 번역', icon: RefreshCw },
    { code: SuggestionContext.SlightlyLonger, label: '조금 길게', icon: ArrowRight },
    { code: SuggestionContext.Long, label: '길게', icon: AlignJustify },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>AI 제안 받기</DialogTitle>
        <DialogDescription asChild>
          <div className="flex flex-wrap items-center gap-2">
            {suggestionOptions.map(({ code, label, icon: Icon }) => (
              <Button
                key={code}
                type="button"
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => onRequestSuggestion(code)}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Button>
            ))}
            <span className="text-muted ml-auto text-sm font-medium">
              한국어 <span className="text-foreground font-semibold">&lt;1/1&gt;</span>
            </span>
          </div>
        </DialogDescription>
        {suggestionText && (
          <div className="mt-4">
            <DialogTitle className="text-muted text-sm font-semibold">AI 제안 결과</DialogTitle>
            <textarea
              className="bg-surface-1 text-foreground border-surface-3 mt-2 w-full resize-none rounded-2xl border p-3 text-sm shadow-inner"
              rows={5}
              readOnly
              value={suggestionText}
            />
          </div>
        )}
        <div className="mt-4 flex justify-end">
          <Button type="button" onClick={() => onOpenChange(false)}>
            닫기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
