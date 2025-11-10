import { useState } from 'react'

import { CloudUpload, Upload, X } from 'lucide-react'

import type { VoiceSamplePayload } from '@/entities/voice-sample/types'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/Button'
import { Checkbox } from '@/shared/ui/Checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/shared/ui/Dialog'
import { Input } from '@/shared/ui/Input'
import { Label } from '@/shared/ui/Label'

import { useCreateVoiceSample } from '../hooks/useVoiceSamples'

type VoiceSampleCreationModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VoiceSampleCreationModal({
  open,
  onOpenChange,
}: VoiceSampleCreationModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [testText, setTestText] = useState('')
  const [consentChecked, setConsentChecked] = useState(false)

  const createMutation = useCreateVoiceSample()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setAudioFile(file)
    }
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    if (!name.trim()) {
      return
    }

    if (!consentChecked) {
      return
    }

    const payload: VoiceSamplePayload = {
      name: name.trim(),
      description: description.trim() || undefined,
      isPublic,
      audioFile: audioFile || undefined,
      testText: testText.trim() || undefined,
    }

    void (async () => {
      try {
        await createMutation.mutateAsync(payload)
        handleClose()
      } catch (error) {
        console.error('Failed to create voice sample:', error)
      }
    })()
  }

  const handleClose = () => {
    setName('')
    setDescription('')
    setIsPublic(true)
    setAudioFile(null)
    setTestText('')
    setConsentChecked(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <DialogTitle>음성샘플 만들기</DialogTitle>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">이름</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="성우 이름을 입력하세요"
              required
            />
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="description">설명</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="뉴스 아나운서로 어울리는 30대 남자 목소리"
            />
          </div>

          {/* Public/Private Toggle */}
          <div className="space-y-2">
            <Label>공개/비공개 토글</Label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsPublic(true)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  isPublic
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-surface-2 text-muted hover:bg-surface-3',
                )}
              >
                공개
              </button>
              <button
                type="button"
                onClick={() => setIsPublic(false)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  !isPublic
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-surface-2 text-muted hover:bg-surface-3',
                )}
              >
                비공개
              </button>
            </div>
          </div>

          {/* Audio Upload Section */}
          <div className="space-y-2">
            <Label>목소리 오디오를 업로드해주세요</Label>
            <div className="space-y-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => document.getElementById('audio-upload')?.click()}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                <CloudUpload className="h-4 w-4" />
                파일 업로드
              </Button>
              <input
                id="audio-upload"
                type="file"
                accept="audio/wav,audio/mp3,audio/mpeg"
                onChange={handleFileChange}
                className="hidden"
              />

              <div
                className={cn(
                  'border-surface-3 bg-surface-2 rounded-xl border p-8 text-center',
                  audioFile && 'border-primary',
                )}
              >
                {audioFile ? (
                  <div className="space-y-2">
                    <Upload className="text-primary mx-auto h-8 w-8" />
                    <p className="text-foreground text-sm font-medium">{audioFile.name}</p>
                    <p className="text-muted text-xs">
                      {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="text-muted mx-auto h-8 w-8" />
                    <p className="text-muted text-sm">업로드 한 파일이 없습니다</p>
                    <p className="text-muted text-xs">목소리 오디오를 업로드해주세요.</p>
                    <p className="text-muted text-xs">WAV 혹은 MP3</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Test Text Input */}
          <div className="space-y-2">
            <Label htmlFor="test-text">테스트할 내용을 입력해주세요.</Label>
            <textarea
              id="test-text"
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              placeholder="테스트할 텍스트를 입력하세요"
              className="border-surface-4 bg-surface-1 text-foreground focus-visible:outline-hidden focus-visible:ring-accent flex min-h-[100px] w-full rounded-xl border px-4 py-3 text-sm shadow-inner shadow-black/5 transition focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              rows={4}
            />
          </div>

          {/* Test Button */}
          <Button type="button" variant="secondary" className="w-full">
            테스트 해보기
          </Button>

          {/* Consent Checkbox */}
          <div className="flex items-start gap-3">
            <Checkbox
              id="consent"
              checked={consentChecked}
              onCheckedChange={(checked) => setConsentChecked(checked === true)}
            />
            <Label
              htmlFor="consent"
              className="text-muted text-xs leading-relaxed cursor-pointer"
            >
              업로드한 음성샘플의 권한을 확인하고, 생성된 콘텐츠를 불법적이거나 사기성 목적으로
              사용하지 않겠습니다.
            </Label>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              취소
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={!name.trim() || !consentChecked || createMutation.isPending}
            >
              {createMutation.isPending ? '생성 중...' : '음성 샘플 만들기'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

