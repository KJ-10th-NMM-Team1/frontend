import type { UseFormRegisterReturn } from 'react-hook-form'

import { Input } from '@/shared/ui/Input'
import { Label } from '@/shared/ui/Label'
import { ValidationMessage } from '@/shared/ui/ValidationMessage'

type SpeakerCountFieldProps = {
  registration: UseFormRegisterReturn
  error?: string
}

export function AudioSpeakerCountField({ registration, error }: SpeakerCountFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <Label htmlFor="speaker-count">화자 수</Label>
        {/* <Input id="speaker-count" type="number" min={1} max={10} {...registration} /> */}
        <select id="seaker-count" className="rounded-md border px-3 py-2" {...registration}>
          <option value="auto">자동인식</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="6">6</option>
          <option value="7">7</option>
          <option value="8">8</option>
          <option value="9">9</option>
          <option value="10">10</option>
        </select>
      </div>

      <div>
        <p className="text-muted text-xs">권장: 1~5명, 최대 10명까지 설정할 수 있습니다.</p>
        {/* <ValidationMessage message={error} /> */}
      </div>
    </div>
  )
}
