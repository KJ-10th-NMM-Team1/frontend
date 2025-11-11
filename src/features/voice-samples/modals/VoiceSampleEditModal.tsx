import { useEffect, useState } from 'react'

import type { VoiceSample } from '@/entities/voice-sample/types'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/Button'
import { Dialog, DialogContent, DialogTitle } from '@/shared/ui/Dialog'
import { Input } from '@/shared/ui/Input'
import { Label } from '@/shared/ui/Label'

import { useUpdateVoiceSample } from '../hooks/useVoiceSamples'

type VoiceSampleEditModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  sample: VoiceSample | null
}

export function VoiceSampleEditModal({ open, onOpenChange, sample }: VoiceSampleEditModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(false)

  const updateMutation = useUpdateVoiceSample()

  // 샘플 데이터가 변경될 때마다 폼 초기화
  useEffect(() => {
    if (sample) {
      setName(sample.name || '')
      setDescription(sample.description || '')
      setIsPublic(sample.isPublic || false)
    }
  }, [sample])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!sample || !name.trim()) {
      return
    }

    try {
      await updateMutation.mutateAsync({
        id: sample.id,
        payload: {
          name: name.trim(),
          description: description.trim() || undefined,
          isPublic,
        },
      })
      onOpenChange(false)
    } catch (error) {
      console.error('음성 샘플 수정 실패:', error)
    }
  }

  const handleFormSubmit = (event: React.FormEvent) => {
    void handleSubmit(event)
  }

  const handleClose = () => {
    if (updateMutation.isPending) return
    onOpenChange(false)
  }

  const isSubmitting = updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <DialogTitle>음성 샘플 수정</DialogTitle>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="edit-name">이름</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="성우 이름을 입력하세요"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="edit-description">설명</Label>
            <Input
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="뉴스 아나운서로 어울리는 30대 남자 목소리"
              disabled={isSubmitting}
            />
          </div>

          {/* Public/Private Toggle */}
          <div className="space-y-2">
            <Label>공개/비공개 토글</Label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsPublic(true)}
                disabled={isSubmitting}
                className={cn(
                  'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                  isPublic
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-surface-2 text-muted hover:bg-surface-3',
                  isSubmitting && 'cursor-not-allowed opacity-50',
                )}
              >
                공개
              </button>
              <button
                type="button"
                onClick={() => setIsPublic(false)}
                disabled={isSubmitting}
                className={cn(
                  'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                  !isPublic
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-surface-2 text-muted hover:bg-surface-3',
                  isSubmitting && 'cursor-not-allowed opacity-50',
                )}
              >
                비공개
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              취소
            </Button>
            <Button type="submit" variant="primary" disabled={!name.trim() || isSubmitting}>
              {isSubmitting ? '수정 중...' : '수정하기'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
