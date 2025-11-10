import { useState } from 'react'

import { HTTPError } from 'ky'
import { CloudUpload, Upload } from 'lucide-react'
import { useNavigate } from 'react-router-dom'


import { routes } from '@/shared/config/routes'
import { cn } from '@/shared/lib/utils'
import { useUiStore } from '@/shared/store/useUiStore'
import { Button } from '@/shared/ui/Button'
import { Checkbox } from '@/shared/ui/Checkbox'
import { Dialog, DialogContent, DialogTitle } from '@/shared/ui/Dialog'
import { Input } from '@/shared/ui/Input'
import { Label } from '@/shared/ui/Label'

import { usePrepareUploadMutation, useFinishUploadMutation } from '../hooks/useVoiceSampleStorage'

type VoiceSampleCreationModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VoiceSampleCreationModal({ open, onOpenChange }: VoiceSampleCreationModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [testText, setTestText] = useState('')
  const [consentChecked, setConsentChecked] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStage, setUploadStage] = useState<'idle' | 'preparing' | 'uploading' | 'finalizing'>(
    'idle',
  )

  const prepareUploadMutation = usePrepareUploadMutation()
  const finishUploadMutation = useFinishUploadMutation()
  const showToast = useUiStore((state) => state.showToast)
  const navigate = useNavigate()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setAudioFile(file)
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!name.trim()) {
      return
    }

    if (!audioFile) {
      showToast({
        id: 'voice-sample-no-file',
        title: '파일 필요',
        description: '음성 파일을 업로드해주세요.',
      })
      return
    }

    if (!consentChecked) {
      return
    }

    try {
      // 1. 업로드 준비
      setUploadStage('preparing')
      setUploadProgress(10)
      const { upload_url, fields, object_key } = await prepareUploadMutation.mutateAsync({
        filename: audioFile.name,
        content_type: audioFile.type || 'audio/mpeg',
      })

      // 2. S3에 파일 업로드
      setUploadStage('uploading')
      setUploadProgress(30)

      // XMLHttpRequest로 진행률 추적
      await uploadFileWithProgress({
        uploadUrl: upload_url,
        fields,
        file: audioFile,
        onProgress: (percent) => {
          setUploadProgress(30 + percent * 0.5) // 30% ~ 80%
        },
      })

      // 3. DB에 저장
      setUploadStage('finalizing')
      setUploadProgress(85)
      await finishUploadMutation.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        is_public: isPublic,
        object_key,
      })

      setUploadProgress(100)
      showToast({
        id: 'voice-sample-created',
        title: '음성 샘플 생성 완료',
        autoDismiss: 2500,
      })
      handleClose()
    } catch (error) {
      console.error('Failed to create voice sample:', error)

      // 401 에러 처리 (인증 필요)
      if (error instanceof HTTPError && error.response.status === 401) {
        showToast({
          id: 'voice-sample-unauthorized',
          title: '로그인이 필요합니다',
          description: '음성 샘플을 업로드하려면 로그인이 필요합니다.',
          autoDismiss: 3000,
        })
        handleClose()
        setTimeout(() => {
          navigate(routes.login)
        }, 500)
        return
      }

      // 기타 에러 처리
      let errorMessage = '업로드 중 오류가 발생했습니다.'
      if (error instanceof HTTPError) {
        try {
          const errorText = await error.response.text()
          if (errorText) {
            try {
              const errorData = JSON.parse(errorText) as { detail?: string; message?: string }
              errorMessage = errorData.detail || errorData.message || errorMessage
            } catch {
              errorMessage = errorText || errorMessage
            }
          } else {
            errorMessage = error.message || errorMessage
          }
        } catch {
          errorMessage = error.message || errorMessage
        }
      } else if (error instanceof Error) {
        errorMessage = error.message
      }

      showToast({
        id: 'voice-sample-error',
        title: '업로드 실패',
        description: errorMessage,
      })
      setUploadStage('idle')
      setUploadProgress(0)
    }
  }

  const handleClose = () => {
    setName('')
    setDescription('')
    setIsPublic(true)
    setAudioFile(null)
    setTestText('')
    setConsentChecked(false)
    setUploadStage('idle')
    setUploadProgress(0)
    onOpenChange(false)
  }

  const isUploading = uploadStage !== 'idle'
  const stageMessages = {
    preparing: '업로드 준비 중...',
    uploading: '파일 업로드 중...',
    finalizing: '저장 중...',
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <DialogTitle>음성샘플 만들기</DialogTitle>
        </div>

        <form
          onSubmit={(e) => {
            void handleSubmit(e)
          }}
          className="space-y-6"
        >
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">이름</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="성우 이름을 입력하세요"
              required
              disabled={isUploading}
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
              disabled={isUploading}
            />
          </div>

          {/* Public/Private Toggle */}
          <div className="space-y-2">
            <Label>공개/비공개 토글</Label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsPublic(true)}
                disabled={isUploading}
                className={cn(
                  'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                  isPublic
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-surface-2 text-muted hover:bg-surface-3',
                  isUploading && 'cursor-not-allowed opacity-50',
                )}
              >
                공개
              </button>
              <button
                type="button"
                onClick={() => setIsPublic(false)}
                disabled={isUploading}
                className={cn(
                  'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                  !isPublic
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-surface-2 text-muted hover:bg-surface-3',
                  isUploading && 'cursor-not-allowed opacity-50',
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
                className="bg-orange-500 text-white hover:bg-orange-600"
                disabled={isUploading}
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
                disabled={isUploading}
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
                    {isUploading && (
                      <div className="mt-4 space-y-2">
                        <div className="bg-surface-3 h-2 w-full rounded-full">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <p className="text-muted text-xs">
                          {stageMessages[uploadStage]} {Math.round(uploadProgress)}%
                        </p>
                      </div>
                    )}
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
              disabled={isUploading}
            />
          </div>

          {/* Test Button */}
          <Button type="button" variant="secondary" className="w-full" disabled={isUploading}>
            테스트 해보기
          </Button>

          {/* Consent Checkbox */}
          <div className="flex items-start gap-3">
            <Checkbox
              id="consent"
              checked={consentChecked}
              onCheckedChange={(checked) => setConsentChecked(checked === true)}
              disabled={isUploading}
            />
            <Label htmlFor="consent" className="text-muted cursor-pointer text-xs leading-relaxed">
              업로드한 음성샘플의 권한을 확인하고, 생성된 콘텐츠를 불법적이거나 사기성 목적으로
              사용하지 않겠습니다.
            </Label>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isUploading}>
              취소
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={!name.trim() || !audioFile || !consentChecked || isUploading}
            >
              {isUploading
                ? `${stageMessages[uploadStage]} ${Math.round(uploadProgress)}%`
                : '음성 샘플 만들기'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// 진행률 추적이 포함된 업로드 함수
async function uploadFileWithProgress({
  uploadUrl,
  fields,
  file,
  onProgress,
}: {
  uploadUrl: string
  fields?: Record<string, string>
  file: File
  onProgress: (percent: number) => void
}) {
  const formData = new FormData()

  if (fields) {
    Object.entries(fields).forEach(([key, value]) => {
      formData.append(key, value)
    })
  }
  formData.append('file', file)

  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percent = (e.loaded / e.total) * 100
        onProgress(percent)
      }
    })

    xhr.addEventListener('load', () => {
      if (xhr.status === 204 || xhr.status === 200) {
        resolve()
      } else {
        reject(new Error(`Upload failed: ${xhr.status}`))
      }
    })

    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'))
    })

    xhr.open('POST', uploadUrl)
    xhr.send(formData)
  })
}
