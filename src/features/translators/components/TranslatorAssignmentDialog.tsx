import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import type { Language } from '@/types'

const UNASSIGNED_TRANSLATOR_VALUE = '__UNASSIGNED__'

export interface TranslatorAssignmentDialogProps {
  open: boolean
  languages: Language[]
  translatorOptions: string[]
  assignmentDraft: Record<string, string>
  reviewDraft: Record<string, boolean>
  onChangeAssignment(languageCode: string, translator?: string): void
  onChangeReview(languageCode: string, reviewed: boolean): void
  onClose(): void
  onConfirm(): void
}

export function TranslatorAssignmentDialog(props: TranslatorAssignmentDialogProps) {
  const {
    open,
    languages,
    translatorOptions,
    assignmentDraft,
    reviewDraft,
    onChangeAssignment,
    onChangeReview,
    onClose,
    onConfirm,
  } = props

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose()
      }}
    >
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>번역가 지정 · 번역 검토</DialogTitle>
          <p className="text-xs text-gray-500">
            RAG/LLM 교정 이후 각 언어별 번역가를 지정하고 검수 상태를 업데이트하세요.
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {languages.map((lang) => {
            const translatorValue = assignmentDraft[lang.code] ?? UNASSIGNED_TRANSLATOR_VALUE
            const reviewed = reviewDraft[lang.code] ?? false
            const options =
              lang.translator && !translatorOptions.includes(lang.translator)
                ? [lang.translator, ...translatorOptions]
                : translatorOptions

            return (
              <div
                key={lang.code}
                className="rounded-lg border border-gray-200 bg-white p-4 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {lang.name}
                    </Badge>
                    <div className="flex gap-1 text-[11px] text-gray-500">
                      {lang.subtitle && (
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-blue-600">
                          자막
                        </span>
                      )}
                      {lang.dubbing && (
                        <span className="rounded-full bg-green-50 px-2 py-0.5 text-green-600">
                          더빙
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`text-xs ${reviewed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}
                  >
                    {reviewed ? '검수 완료' : '검수 필요'}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-gray-500">번역가</Label>
                  <Select
                    value={translatorValue}
                    onValueChange={(value) =>
                      onChangeAssignment(
                        lang.code,
                        value === UNASSIGNED_TRANSLATOR_VALUE ? undefined : value
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="번역가 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={UNASSIGNED_TRANSLATOR_VALUE}>미지정</SelectItem>
                      {options.map((translator) => (
                        <SelectItem key={translator} value={translator}>
                          {translator}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                  <div>
                    <p className="text-sm font-medium">번역 검수 완료</p>
                    <p className="text-xs text-gray-500">
                      사내 검수가 끝났다면 스위치를 켜 주세요.
                    </p>
                  </div>
                  <Switch
                    checked={reviewed}
                    onCheckedChange={(checked) => onChangeReview(lang.code, checked)}
                  />
                </div>

                {lang.dubbing && (
                  <p className="rounded-lg border border-dashed px-3 py-3 text-xs text-gray-500">
                    더빙 언어는 별도 화면에서 목소리 매핑을 진행해야 합니다.!!!!!!!!!!!
                  </p>
                )}
              </div>
            )
          })}
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button onClick={onConfirm}>저장</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
