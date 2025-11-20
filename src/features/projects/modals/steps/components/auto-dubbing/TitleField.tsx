import type { UseFormRegisterReturn } from 'react-hook-form'

import { Input } from '@/shared/ui/Input'
import { Label } from '@/shared/ui/Label'
import { ValidationMessage } from '@/shared/ui/ValidationMessage'

type TitleFieldProps = {
  registration: UseFormRegisterReturn
  error?: string
}

export function TitleField({ registration, error }: TitleFieldProps) {
  return (
    <div className="space-y-1">
      <Label htmlFor="episode-title">
        에피소드 제목 <span className="text-danger ml-1">*</span>
      </Label>
      <div>
        <Input id="episode-title" placeholder="자동 더빙할 영상의 제목을 입력해 주세요" {...registration} />
        <ValidationMessage message={error} />
      </div>
    </div>
  )
}
