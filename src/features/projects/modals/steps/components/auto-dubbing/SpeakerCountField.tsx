import type { UseFormRegisterReturn } from 'react-hook-form'

import { Label } from '@/shared/ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/Select'
import { ValidationMessage } from '@/shared/ui/ValidationMessage'

type SpeakerCountFieldProps = {
  registration: UseFormRegisterReturn
  value: number
  error?: string
}

export function AudioSpeakerCountField({ registration, value, error }: SpeakerCountFieldProps) {
  const { onChange, name } = registration

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <Label htmlFor="speaker-count">화자 수</Label>
        <Select
          name={name}
          value={String(value)}
          onValueChange={(val) => {
            onChange({ target: { name, value: Number(val) } })
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="화자 수 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">자동 탐색</SelectItem>
            <SelectItem value="1">1명</SelectItem>
            <SelectItem value="2">2명</SelectItem>
            <SelectItem value="3">3명</SelectItem>
            <SelectItem value="4">4명</SelectItem>
            <SelectItem value="5">5명</SelectItem>
            <SelectItem value="6">6명</SelectItem>
            <SelectItem value="7">7명</SelectItem>
            <SelectItem value="8">8명</SelectItem>
            <SelectItem value="9">9명</SelectItem>
            <SelectItem value="10">10명</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <p className="text-muted text-xs">권장: 1~5명, 최대 10명까지 설정할 수 있습니다.</p>
        <ValidationMessage message={error} />
      </div>
    </div>
  )
}
