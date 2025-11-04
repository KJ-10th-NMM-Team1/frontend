import { useModal } from '@/hooks/useModal'
import { useCallback } from 'react'
import type { CreateTranslatorPayload } from '../types/createTranslator'
import { useCreateTranslatorForm } from './useCreateTranslatorForm'

interface UseCreateTranslatorModalOptions {
  onSubmit(data: CreateTranslatorPayload): Promise<void> | void
}

export function useCreateTranslatorModal(options: UseCreateTranslatorModalOptions) {
  const form = useCreateTranslatorForm()
  const modal = useModal({ reset: form.reset })

  const submit = useCallback(
    async (values: CreateTranslatorPayload) => {
      await options.onSubmit(values)
      modal.close()
    },
    [modal, options]
  )

  return {
    ...modal,
    form,
    submit,
  }
}
