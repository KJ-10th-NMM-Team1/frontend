import type { ReactNode } from 'react'

import * as Dialog from '@radix-ui/react-dialog'

import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/Button'

type CloseReason = 'escape' | 'backdrop' | 'action' | 'programmatic'

type ModalProps = {
  open: boolean
  onOpenChange: (next: boolean, reason?: CloseReason) => void
  title?: string
  description?: string
  dismissibleBackdrop?: boolean
  children?: ReactNode
  footer?: ReactNode
}

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  dismissibleBackdrop = false,
  children,
  footer,
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(next) => onOpenChange(next, 'programmatic')}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm data-[state=closed]:animate-[modal-fade-out_0.2s_ease] data-[state=open]:animate-[modal-fade-in_0.25s_ease]" />
        <Dialog.Content
          className="border-surface-3 bg-surface-1 focus-visible:outline-hidden fixed left-1/2 top-1/2 z-[61] w-[min(640px,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-3xl border p-6 shadow-2xl will-change-transform data-[state=closed]:animate-[modal-slide-down_0.2s_ease] data-[state=open]:animate-[modal-slide-up_0.3s_ease]"
          onEscapeKeyDown={(event) => {
            event.preventDefault()
            onOpenChange(false, 'escape')
          }}
          onPointerDownOutside={(event) => {
            if (!dismissibleBackdrop) {
              event.preventDefault()
              return
            }
            onOpenChange(false, 'backdrop')
          }}
        >
          {(title || description) && (
            <div className="space-y-1">
              {title ? (
                <Dialog.Title className="text-foreground text-lg font-semibold">
                  {title}
                </Dialog.Title>
              ) : null}
              {description ? (
                <Dialog.Description className="text-muted text-sm">
                  {description}
                </Dialog.Description>
              ) : null}
            </div>
          )}
          <div className="mt-4 space-y-4">{children}</div>
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            {footer}
            <Dialog.Close asChild>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false, 'programmatic')}
              >
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
  return (
    <section className={cn('border-surface-4 bg-surface-2 rounded-2xl border p-4', className)}>
      {children}
    </section>
  )
}

export function ModalField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-muted text-xs font-medium uppercase tracking-wide">{label}</p>
      <div className="text-foreground text-sm">{value}</div>
    </div>
  )
}
