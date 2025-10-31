import { useCallback } from 'react'
import { useModal } from '../../../hooks/useModal'
import { useCreateProjectForm } from './useCreateProjectForm'
import type { CreateProjectPayload } from '../types/createProject'

interface UseCreateProjectModalOptions {
  onSubmit(project: CreateProjectPayload): Promise<void> | void
}

export function useCreateProjectModal(options: UseCreateProjectModalOptions) {
  const form = useCreateProjectForm()
  const modal = useModal({ reset: form.reset })

  const submit = useCallback(async () => {
    if (!form.canSubmit) return
    // form.actions.setIsUploading(true)

    await options.onSubmit({
      videoFile: form.videoFile!,
    })

    // form.actions.setIsUploading(false)
    modal.close()
  }, [form, modal, options])

  return {
    ...modal,
    form,
    submit,
  }
}
