import type { UseFormRegisterReturn } from 'react-hook-form'

import { Input } from '@/shared/ui/Input'
import { Label } from '@/shared/ui/Label'
import { ValidationMessage } from '@/shared/ui/ValidationMessage'

type TagsFieldProps = {
  registration: UseFormRegisterReturn
  previewTags: string[]
  error?: string
}

export function TagsField({ registration, previewTags, error }: TagsFieldProps) {
  return (
    <div className="space-y-1">
      <Label htmlFor="episode-tags">태그 (선택)</Label>
      <Input
        id="episode-tags"
        placeholder="SNS 해시태그처럼 자유롭게 적어주세요. (예: #게임 #튜토리얼)"
        {...registration}
      />
      <div className="flex items-center justify-between text-xs text-muted">
        <span>쉼표 또는 띄어쓰기로 구분, 최대 10개까지 입력됩니다.</span>
        {previewTags.length > 0 ? (
          <span className="text-foreground/70">
            적용 예정: {previewTags.map((tag) => `#${tag}`).join(' ')}
          </span>
        ) : null}
      </div>
      <ValidationMessage message={error} />
    </div>
  )
}
