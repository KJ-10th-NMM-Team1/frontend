import { useCallback, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import type { CreateProjectFormValues } from '../types/createProject'

const defaultValues: CreateProjectFormValues = {
  videoFile: null,
  ownerCode: '',
}

export function useCreateProjectForm() {
  const {
    handleSubmit,
    reset: resetInternal,
    setValue,
    watch,
    formState,
  } = useForm<CreateProjectFormValues>({
    mode: 'onSubmit',
    defaultValues,
  })

  const videoFile = watch('videoFile')
  const ownerCode = watch('ownerCode') ?? ''

  const setVideoFile = useCallback(
    (file: File | null) => {
      setValue('videoFile', file, { shouldDirty: true, shouldTouch: true })
    },
    [setValue]
  )

  const setOwnerCode = useCallback(
    (code: string) => {
      setValue('ownerCode', code, { shouldDirty: true, shouldTouch: true })
    },
    [setValue]
  )

  const reset = useCallback(() => {
    resetInternal(defaultValues)
  }, [resetInternal])

  const canSubmit = useMemo(() => Boolean(videoFile && ownerCode), [videoFile, ownerCode])

  return {
    formState,
    handleSubmit,
    setVideoFile,
    setOwnerCode,
    reset,
    videoFile,
    ownerCode,
    hasVideo: Boolean(videoFile),
    canSubmit,
  }
}
