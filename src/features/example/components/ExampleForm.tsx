import { useEffect } from 'react'

import { useForm } from 'react-hook-form'

import type { ExampleItem, ExampleStatus } from '@/entities/example/types'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Label } from '@/shared/ui/Label'
import { ValidationMessage } from '@/shared/ui/ValidationMessage'

const statusOptions: { value: ExampleStatus; label: string }[] = [
  { value: 'draft', label: '초안' },
  { value: 'in-progress', label: '진행 중' },
  { value: 'done', label: '완료' },
]

export type ExampleFormValues = {
  name: string
  owner: string
  status: ExampleStatus
}

type ExampleFormProps = {
  mode: 'create' | 'edit'
  defaultValues?: ExampleItem
  isSubmitting: boolean
  onSubmit: (values: ExampleFormValues) => void
  onCancel: () => void
}

export function ExampleForm({
  mode,
  defaultValues,
  isSubmitting,
  onSubmit,
  onCancel,
}: ExampleFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExampleFormValues>({
    defaultValues: defaultValues
      ? {
          name: defaultValues.name,
          owner: defaultValues.owner,
          status: defaultValues.status,
        }
      : {
          name: '',
          owner: '',
          status: 'draft',
        },
  })

  useEffect(() => {
    if (defaultValues) {
      reset({
        name: defaultValues.name,
        owner: defaultValues.owner,
        status: defaultValues.status,
      })
    } else {
      reset({ name: '', owner: '', status: 'draft' })
    }
  }, [defaultValues, reset])

  return (
    <form
      onSubmit={(event) => {
        void handleSubmit((values) => {
          onSubmit(values)
        })(event)
      }}
      className="grid gap-4 md:grid-cols-3"
    >
      <div className="space-y-2">
        <Label htmlFor="example-form-name">프로젝트 이름</Label>
        <Input
          id="example-form-name"
          placeholder="예: 신규 더빙 캠페인"
          {...register('name', { required: '이름을 입력하세요' })}
        />
        <ValidationMessage message={errors.name?.message} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="example-form-owner">담당자</Label>
        <Input
          id="example-form-owner"
          placeholder="예: Amy"
          {...register('owner', { required: '담당자를 입력하세요' })}
        />
        <ValidationMessage message={errors.owner?.message} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="example-form-status">상태</Label>
        <select
          id="example-form-status"
          className="border-surface-4 bg-surface-1 text-foreground focus-visible:outline-hidden focus-visible:ring-accent h-11 w-full rounded-xl border px-4 text-sm shadow-inner shadow-black/5 focus-visible:ring-2 focus-visible:ring-offset-2"
          {...register('status')}
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-wrap justify-end gap-3 md:col-span-3">
        {mode === 'edit' ? (
          <Button type="button" variant="ghost" onClick={onCancel}>
            취소
          </Button>
        ) : null}
        <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
          {isSubmitting ? '처리 중…' : mode === 'edit' ? '수정 완료' : '추가'}
        </Button>
      </div>
    </form>
  )
}
