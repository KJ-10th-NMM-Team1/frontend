import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import type { CreateTranslatorFormValues } from '../types/createTranslator'

const defaultValues: CreateTranslatorFormValues = {
  name: '',
  email: '',
  languages: '',
  status: 'active',
}

export function useCreateTranslatorForm() {
  const form = useForm<CreateTranslatorFormValues>({
    mode: 'onChange',
    defaultValues,
  })

  const rawReset = form.reset
  const reset = useCallback(
    (values?: Partial<CreateTranslatorFormValues>) => {
      rawReset({
        ...defaultValues,
        ...values,
      })
    },
    [rawReset]
  )

  return {
    ...form,
    reset,
  } as typeof form & {
    reset(values?: Partial<CreateTranslatorFormValues>): void
  }
}
