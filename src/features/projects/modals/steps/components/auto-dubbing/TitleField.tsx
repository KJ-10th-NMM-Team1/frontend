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
      <Label htmlFor="episode-title">에피소드 제목</Label>
      <div>
        <Input id="episode-title" placeholder="예) 크래프톤 정글 홍보 영상" {...registration} />
        <ValidationMessage message={error} />
      </div>
    </div>
  )
}
