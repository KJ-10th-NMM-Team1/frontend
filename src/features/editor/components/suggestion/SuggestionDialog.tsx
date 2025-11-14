import {
  AlignJustify,
  ArrowLeftRight,
  ArrowRight,
  ChevronsLeftRight,
  RefreshCw,
} from 'lucide-react'

import type { SuggestionContext } from '@/entities/suggestion/types'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/shared/ui/Dialog'
import { Button } from '@/shared/ui/Button'

type SuggestionDialogProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onRequestSuggestion: (context: SuggestionContext) => Promise<void> | void
  suggestionText: string
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  languageLabel: string
}

export function SuggestionDialog({
  isOpen,
  onOpenChange,
  onRequestSuggestion,
  suggestionText,
  currentPage,
  totalPages,
  onPageChange,
  languageLabel,
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
        <div className="flex items-center justify-between gap-4">
          <DialogTitle>AI 제안 받기</DialogTitle>
          <DialogTitle className="text-muted mr-5 text-sm font-medium">{languageLabel}</DialogTitle>
        </div>
        <DialogDescription asChild>
          <div className="flex flex-wrap items-center gap-2">
            {suggestionOptions.map(({ code, label, icon: Icon }) => (
              <Button
                key={code}
                type="button"
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => {
                  void onRequestSuggestion(code)
                }}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Button>
            ))}
            <div className="ml-auto flex items-center gap-2">
              <Button
                type="button"
                size="xs"
                variant="ghost"
                disabled={currentPage <= 1}
                onClick={() => onPageChange(currentPage - 1)}
              >
                이전
              </Button>
              <span className="text-muted text-sm font-medium">
                {currentPage} / {totalPages}
              </span>
              <Button
                type="button"
                size="xs"
                variant="ghost"
                disabled={currentPage >= totalPages}
                onClick={() => onPageChange(currentPage + 1)}
              >
                다음
              </Button>
            </div>
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
