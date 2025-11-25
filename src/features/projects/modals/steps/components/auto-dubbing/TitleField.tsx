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
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor="episode-title" className="text-lg font-semibold">
          에피소드 제목
        </Label>
        <span className="inline-flex items-center rounded-full bg-primary-container px-2 py-0.5 text-[11px] font-semibold leading-none text-on-primary-container">
          필수
        </span>
      </div>
      <div>
        <Input
          id="episode-title"
          placeholder="자동 더빙할 영상의 제목을 입력해 주세요"
          {...registration}
        />
        <ValidationMessage message={error} />
      </div>
    </div>
  )
}
