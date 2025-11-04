import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ModalBody,
  ModalContainer,
  ModalFooterSection,
  ModalHeaderSection,
  ModalRoot,
} from '@/components/ui/modal'
import type { useCreateTranslatorForm } from '../hooks/useCreateTranslatorForm'
import type { CreateTranslatorPayload } from '../types/createTranslator'

interface CreateTranslatorModalProps {
  isOpen: boolean
  onClose(): void
  form: ReturnType<typeof useCreateTranslatorForm>
  onSubmit(payload: CreateTranslatorPayload): Promise<void> | void
}

export function CreateTranslatorModal({
  isOpen,
  onClose,
  form,
  onSubmit,
}: CreateTranslatorModalProps) {
  const {
    handleSubmit,
    register,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = form

  const [rawName = '', rawEmail = ''] = watch(['name', 'email'])
  const trimmedName = rawName.trim()
  const trimmedEmail = rawEmail.trim()
  const isSubmitDisabled = isSubmitting || trimmedName.length === 0 || trimmedEmail.length === 0

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleFormSubmit = handleSubmit(async (values) => {
    const payload: CreateTranslatorPayload = {
      name: values.name.trim(),
      email: values.email.trim(),
      status: values.status ?? 'active',
      languages: (values.languages ?? '')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean),
    }
    await onSubmit(payload)
  })

  return (
    <ModalRoot open={isOpen} onOpenChange={(open) => (!open ? handleClose() : undefined)}>
      <ModalContainer>
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <ModalHeaderSection title="새 번역가 등록" description="번역가 기본 정보를 입력하세요." />

          <ModalBody className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="translator-name">이름</Label>
              <Input
                id="translator-name"
                placeholder="홍길동"
                {...register('name', { required: '이름을 입력하세요.' })}
              />
              {errors.name ? (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="translator-email">이메일</Label>
              <Input
                id="translator-email"
                placeholder="translator@example.com"
                {...register('email', {
                  required: '이메일을 입력하세요.',
                  pattern: {
                    value: /\S+@\S+\.\S+/,
                    message: '유효한 이메일 주소가 아닙니다.',
                  },
                })}
              />
              {errors.email ? (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="translator-languages">가능 언어</Label>
              <Input
                id="translator-languages"
                placeholder="예: ko, en, jp"
                {...register('languages')}
              />
              <p className="text-xs text-muted-foreground">쉼표로 구분해 여러 언어를 입력하세요.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="translator-status">상태</Label>
              <select
                id="translator-status"
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                {...register('status')}
              >
                <option value="active">활성</option>
                <option value="inactive">비활성</option>
              </select>
            </div>
          </ModalBody>

          <ModalFooterSection>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              취소
            </Button>
            <Button type="submit" disabled={isSubmitDisabled}>
              {isSubmitting ? '등록 중…' : '번역가 등록'}
            </Button>
          </ModalFooterSection>
        </form>
      </ModalContainer>
    </ModalRoot>
  )
}
