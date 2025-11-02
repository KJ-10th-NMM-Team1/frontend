import { useCallback, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import type { CreateProjectFormValues } from '../types/createProject'

const defaultValues: CreateProjectFormValues = {
  videoFile: null,
}

export interface UseCreateProjectFormOptions {
  defaultValues?: Partial<CreateProjectFormValues>
}

export function useCreateProjectForm(options: UseCreateProjectFormOptions = {}) {
  const {
    handleSubmit,
    reset: resetInternal,
    setValue,
    watch,
    formState,
  } = useForm<CreateProjectFormValues>({
    mode: 'onSubmit',
    defaultValues: {
      ...defaultValues,
      ...options.defaultValues,
    },
  })

  const videoFile = watch('videoFile')

  const setVideoFile = useCallback(
    (file: File | null) => {
      setValue('videoFile', file, { shouldDirty: true, shouldTouch: true })
    },
    [setValue]
  )

  const reset = useCallback(() => {
    resetInternal({
      ...defaultValues,
      ...options.defaultValues,
    })
  }, [resetInternal, options.defaultValues])

  const canSubmit = useMemo(() => Boolean(videoFile), [videoFile])

  return {
    formState,
    handleSubmit,
    setVideoFile,
    reset,
    videoFile,
    hasVideo: Boolean(videoFile),
    canSubmit,
  }
}
