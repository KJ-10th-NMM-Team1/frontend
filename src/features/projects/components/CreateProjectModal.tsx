import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { useCreateProjectForm } from '../hooks/useCreateProjectForm'
import {
  ModalBody,
  ModalContainer,
  ModalFooterSection,
  ModalHeaderSection,
  ModalRoot,
} from '@/components/ui/modal'

interface CreateProjectModalProps {
  isOpen: boolean
  onClose(): void
  form: ReturnType<typeof useCreateProjectForm>
  onSubmit(): Promise<void> | void
}

export function CreateProjectModal({ isOpen, onClose, form, onSubmit }: CreateProjectModalProps) {
  const { handleSubmit, setVideoFile, videoFile, hasVideo, reset, formState } = form

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    setVideoFile(file)
  }

  const handleRemoveFile = () => {
    setVideoFile(null)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <ModalRoot open={isOpen} onOpenChange={(open) => (!open ? handleClose() : undefined)}>
      <ModalContainer>
        <form
          onSubmit={handleSubmit(async () => {
            await onSubmit()
          })}
        >
          <ModalHeaderSection title="새 프로젝트 업로드" description="영상 파일을 업로드하세요." />

          <ModalBody>
            <div className="space-y-2">
              <Label htmlFor="create-project-video">영상 파일</Label>
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                {!videoFile ? (
                  <label className="flex cursor-pointer flex-col items-center gap-2 text-sm text-muted-foreground">
                    <input
                      id="create-project-video"
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <span>클릭하여 영상 파일을 선택하거나 드래그 앤 드롭하세요.</span>
                    <span className="text-xs text-muted-foreground/80">
                      MP4, MOV 등을 지원합니다.
                    </span>
                  </label>
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <span className="truncate text-sm">{videoFile.name}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={handleRemoveFile}>
                      파일 제거
                    </Button>
                  </div>
                )}
              </div>
              {formState.errors.videoFile ? (
                <p className="text-xs text-destructive">{formState.errors.videoFile.message}</p>
              ) : null}
            </div>
          </ModalBody>

          <ModalFooterSection>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={formState.isSubmitting}
            >
              취소
            </Button>
            <Button type="submit" disabled={!hasVideo || formState.isSubmitting}>
              {formState.isSubmitting ? '업로드 중…' : '프로젝트 생성'}
            </Button>
          </ModalFooterSection>
        </form>
      </ModalContainer>
    </ModalRoot>
  )
}
