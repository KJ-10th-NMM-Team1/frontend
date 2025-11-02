import { useEffect, useRef } from 'react'
import { useDisclosure } from './useDisclosure'

interface UseModalOptions {
  onOpen?(): void
  onClose?(): void
  reset?(): void // 모달이 닫힐 때 초기화가 필요하면 전달
}

export function useModal(options: UseModalOptions = {}) {
  const { onOpen, onClose, reset } = options
  const disclosure = useDisclosure()
  const wasOpenRef = useRef(disclosure.isOpen)

  useEffect(() => {
    const wasOpen = wasOpenRef.current
    const isOpen = disclosure.isOpen

    if (!wasOpen && isOpen) {
      onOpen?.()
    }
    if (wasOpen && !isOpen) {
      onClose?.()
      reset?.()
    }

    wasOpenRef.current = isOpen
  }, [disclosure.isOpen, onOpen, onClose, reset])

  return disclosure
}
