import { type ReactNode, useCallback } from 'react'

import * as Dialog from '@radix-ui/react-dialog'

import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/Button'

type CloseReason = 'escape' | 'backdrop' | 'action' | 'programmatic'

type ModalTemplateProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onClose?: (reason: CloseReason) => void
  disableBackdropClose?: boolean
  title: string
  description?: string
  children: ReactNode
  primaryAction?: {
    label: string
    onAction: () => void | Promise<void>
    loading?: boolean
  }
  secondaryActionLabel?: string
  onSecondaryAction?: () => void
}

/**
 * ModalTemplate는 팀원들이 복제해 사용할 수 있는 규칙 예제입니다.
 * - `open`/`onOpenChange`로 제어형 패턴을 유지합니다.
 * - `onClose(reason)`으로 닫힘 사유를 상위 로직에 전달합니다.
 * - 라우트-모달 패턴 시 `open` 상태를 URL 쿼리/파라미터에 동기화하세요.
 */
export function ModalTemplate({
  open,
  onOpenChange,
  onClose,
  disableBackdropClose = false,
  title,
  description,
  children,
  primaryAction,
  secondaryActionLabel,
  onSecondaryAction,
}: ModalTemplateProps) {
  const handleClose = useCallback(
    (reason: CloseReason) => {
      onClose?.(reason)
      onOpenChange(false)
    },
    [onClose, onOpenChange],
  )

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => (!next ? handleClose('programmatic') : onOpenChange(true))}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content
          className="border-surface-3 bg-surface-1 fixed left-1/2 top-1/2 w-[min(640px,90vw)] -translate-x-1/2 -translate-y-1/2 rounded-3xl border p-6 shadow-2xl"
          onEscapeKeyDown={(event) => {
            event.preventDefault()
            handleClose('escape')
          }}
          onPointerDownOutside={(event) => {
            if (disableBackdropClose) {
              event.preventDefault()
              return
            }
            handleClose('backdrop')
          }}
        >
          <div className="space-y-2">
            <Dialog.Title className="text-foreground text-lg font-semibold">{title}</Dialog.Title>
            {description ? (
              <Dialog.Description className="text-muted text-sm">{description}</Dialog.Description>
            ) : null}
          </div>
          <div className="mt-4">{children}</div>
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            {secondaryActionLabel ? (
              <Button type="button" variant="ghost" onClick={onSecondaryAction}>
                {secondaryActionLabel}
              </Button>
            ) : null}
            {primaryAction ? (
              <Button
                type="button"
                onClick={() => {
                  void (async () => {
                    await primaryAction.onAction()
                    handleClose('action')
                  })()
                }}
                disabled={primaryAction.loading}
              >
                {primaryAction.label}
              </Button>
            ) : null}
            <Dialog.Close asChild>
              <Button type="button" variant="outline" onClick={() => handleClose('programmatic')}>
                닫기
              </Button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export function ModalSection({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('bg-surface-2 rounded-2xl p-4', className)}>{children}</div>
}

export function ModalField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-muted text-xs font-medium uppercase tracking-wide">{label}</p>
      <p className="text-foreground text-sm">{value}</p>
    </div>
  )
}
