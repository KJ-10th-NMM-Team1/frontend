import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/shared/ui/Dialog'
import { Button } from '@/shared/ui/Button'
import { Badge } from '@/shared/ui/Badge'
import type { VoiceSample } from '@/entities/voice-sample/types'
import { cn } from '@/shared/lib/utils'

interface VoicePurchaseModalProps {
  open: boolean
  sample: VoiceSample | null
  creditBalance: number
  cost: number
  isProcessing?: boolean
  onClose: () => void
  onConfirm: () => void
  onChargeCredits: () => void
}

export function VoicePurchaseModal({
  open,
  sample,
  creditBalance,
  cost,
  isProcessing = false,
  onClose,
  onConfirm,
  onChargeCredits,
}: VoicePurchaseModalProps) {
  const remaining = creditBalance - cost
  const insufficient = remaining < 0
  const isPublicVoice = sample?.isPublic !== false
  const licenseLabel =
    sample?.canCommercialUse === false ? '비상업 전용 (추가 불가)' : '상업 사용 가능'

  const canAdd = !insufficient && sample && sample.canCommercialUse !== false && isPublicVoice

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-w-[63rem]">
        <div className="space-y-3">
          <DialogTitle>내 목소리에 추가</DialogTitle>
          <DialogDescription>
            선택한 목소리를 내 라이브러리에 추가하기 위해 크레딧을 차감합니다.
          </DialogDescription>
        </div>

        {sample ? (
          <div className="rounded-2xl border border-surface-3 bg-surface-1 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">{sample.name}</p>
                <p className="text-xs text-muted">상업용 + 공개 상태인 경우에만 추가 가능합니다.</p>
              </div>
              <Badge tone={sample.canCommercialUse === false ? 'default' : 'success'}>
                {sample.canCommercialUse === false ? '비상업용' : '상업용 가능'}
              </Badge>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-white/60 p-3">
                <p className="text-xs text-muted">현재 크레딧</p>
                <p className="text-lg font-semibold text-foreground">
                  {creditBalance.toLocaleString()} 크레딧
                </p>
              </div>
              <div className="rounded-xl bg-white/60 p-3">
                <p className="text-xs text-muted">차감 크레딧</p>
                <p className="text-lg font-semibold text-foreground">
                  -{cost.toLocaleString()} 크레딧
                </p>
              </div>
              <div
                className={cn(
                  'rounded-xl p-3',
                  insufficient ? 'bg-amber-100 text-amber-800' : 'bg-surface-2 text-foreground',
                )}
              >
                <p className="text-xs text-muted">차감 후 크레딧</p>
                <p className="text-lg font-semibold">{remaining.toLocaleString()} 크레딧</p>
                {insufficient && (
                  <p className="text-[11px]">잔액이 부족합니다. 크레딧을 충전해주세요.</p>
                )}
              </div>
              <div className="rounded-xl bg-surface-2 p-3">
                <p className="text-xs text-muted">라이선스 / 기간</p>
                <p className="text-sm font-semibold text-foreground">{licenseLabel}</p>
                <p className="text-xs text-muted">사용 기간: 무제한</p>
                <p className="text-xs text-muted">
                  공개 상태: {isPublicVoice ? '공개' : '비공개 (추가 불가)'}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onChargeCredits} size="sm">
              크레딧 충전하기
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose} size="sm">
              취소
            </Button>
            <Button onClick={onConfirm} disabled={!canAdd || isProcessing} size="sm">
              {isProcessing ? '처리 중...' : '크레딧 차감 후 추가'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
