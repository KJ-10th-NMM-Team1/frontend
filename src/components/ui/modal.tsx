import * as React from 'react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog'
import { cn } from './utils'

interface ModalHeaderProps extends React.ComponentProps<typeof DialogHeader> {
  description?: React.ReactNode
}

interface ModalBodyProps extends React.ComponentProps<'div'> {}

interface ModalFooterProps extends React.ComponentProps<typeof DialogFooter> {}

export function ModalRoot(props: React.ComponentProps<typeof Dialog>) {
  return <Dialog {...props} />
}

export function ModalContainer({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogContent>) {
  return (
    <DialogContent className={cn('sm:max-w-lg', className)} {...props}>
      {children}
    </DialogContent>
  )
}

export function ModalHeaderSection({ title, description, children, ...props }: ModalHeaderProps) {
  return (
    <DialogHeader {...props}>
      <DialogTitle>{title}</DialogTitle>
      {description ? <DialogDescription>{description}</DialogDescription> : null}
      {children}
    </DialogHeader>
  )
}

export function ModalBody({ className, ...props }: ModalBodyProps) {
  return <div className={cn('space-y-6', className)} {...props} />
}

export function ModalFooterSection({ className, ...props }: ModalFooterProps) {
  return <DialogFooter className={cn('sm:flex-row sm:justify-end', className)} {...props} />
}

export const ModalClose = DialogClose

// const Modal = {
//   Root: ModalRoot,
//   Content: ModalContainer,
//   Header: ModalHeaderSection,
//   Body: ModalBody,
//   Footer: ModalFooterSection,
//   Close: ModalClose,
// }
