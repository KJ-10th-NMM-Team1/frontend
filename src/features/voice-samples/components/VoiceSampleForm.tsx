import { useEffect, useMemo, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import { HTTPError } from 'ky'

import { env } from '@/shared/config/env'
import { queryKeys } from '@/shared/config/queryKeys'
import { routes } from '@/shared/config/routes'
import { useUiStore } from '@/shared/store/useUiStore'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Label } from '@/shared/ui/Label'

import { useFinishUploadMutation, usePrepareUploadMutation } from '../hooks/useVoiceSampleStorage'
import {
  finalizeVoiceSampleAvatarUpload,
  prepareVoiceSampleAvatarUpload,
} from '../api/voiceSamplesApi'

const DEFAULT_AVATAR =
  'https://ui-avatars.com/api/?name=Voice&background=EEF2FF&color=1E1B4B&size=128'

type VoiceSampleFormProps = {
  initialFile?: File | null
  hideFileUpload?: boolean
  onCancel?: () => void
  onSuccess?: () => void
}

export function VoiceSampleForm({
  initialFile = null,
  hideFileUpload = false,
  onCancel,
  onSuccess,
}: VoiceSampleFormProps) {
  const [name, setName] = useState('')
  const [country, setCountry] = useState('ko')
  const [gender, setGender] = useState('any')
  const [audioFile, setAudioFile] = useState<File | null>(initialFile)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStage, setUploadStage] = useState<'idle' | 'preparing' | 'uploading' | 'finalizing'>(
    'idle',
  )
  const isUploading = uploadStage !== 'idle'

  const prepareUploadMutation = usePrepareUploadMutation()
  const finishUploadMutation = useFinishUploadMutation()
  const queryClient = useQueryClient()
  const showToast = useUiStore((state) => state.showToast)

  useEffect(() => {
    setAudioFile(initialFile)
  }, [initialFile])

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview(null)
      return
    }
    const url = URL.createObjectURL(avatarFile)
    setAvatarPreview(url)
    return () => {
      URL.revokeObjectURL(url)
    }
  }, [avatarFile])

  const selectedFileName = useMemo(() => audioFile?.name ?? '선택된 파일이 없습니다', [audioFile])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setAudioFile(file)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!name.trim() || !audioFile) return

    try {
      setUploadStage('preparing')
      setUploadProgress(10)
      const { upload_url, fields, object_key } = await prepareUploadMutation.mutateAsync({
        filename: audioFile.name,
        content_type: audioFile.type || 'audio/mpeg',
        country,
      })

      setUploadStage('uploading')
      setUploadProgress(30)
      await uploadFileWithProgress({
        uploadUrl: upload_url,
        fields,
        file: audioFile,
        onProgress: (percent) => {
          setUploadProgress(30 + percent * 0.5)
        },
      })

      setUploadStage('finalizing')
      setUploadProgress(85)
      const createdSample = await finishUploadMutation.mutateAsync({
        name: name.trim(),
        description: notes.trim() || undefined,
        is_public: true,
        object_key,
        country,
        gender,
      })

      if (avatarFile && createdSample.id) {
        try {
          const {
            upload_url,
            fields,
            object_key: avatarKey,
          } = await prepareVoiceSampleAvatarUpload(createdSample.id, {
            filename: avatarFile.name,
            content_type: avatarFile.type || 'image/png',
          })

          await uploadFileWithProgress({
            uploadUrl: upload_url,
            fields,
            file: avatarFile,
            onProgress: () => {},
          })

          await finalizeVoiceSampleAvatarUpload(createdSample.id, { object_key: avatarKey })
        } catch (error) {
          console.error('Failed to upload avatar image', error)
          showToast({
            id: 'voice-sample-avatar-error',
            title: '아바타 업로드 실패',
            description: '이미지를 업로드하는 중 문제가 발생했습니다.',
          })
        }
      }

      setUploadProgress(100)
      showToast({
        id: 'voice-sample-created',
        title: '보이스 클론 저장 완료',
        description: '음성 샘플링 처리 중입니다...',
        autoDismiss: 2500,
      })
      resetForm()
      onSuccess?.()

      if (createdSample.id) {
        const source = new EventSource(
          `${env.apiBaseUrl}/api/voice-samples/${createdSample.id}/stream`,
        )

        source.addEventListener('message', (event) => {
          try {
            const eventData = typeof event.data === 'string' ? event.data : String(event.data)
            const data = JSON.parse(eventData) as {
              sample_id?: string
              audio_sample_url?: string | null
              has_audio_sample?: boolean
              error?: string
            }

            if (data.has_audio_sample && data.audio_sample_url) {
              source.close()
              void queryClient.invalidateQueries({
                queryKey: queryKeys.voiceSamples.all,
                exact: false,
              })
              showToast({
                id: 'voice-sample-processed',
                title: '보이스 클론 처리 완료',
                description: '음성 샘플링이 완료되었습니다.',
                autoDismiss: 3000,
              })
            } else if (data.error) {
              source.close()
              showToast({
                id: 'voice-sample-stream-error',
                title: '상태 확인 실패',
                description: data.error,
                autoDismiss: 3000,
              })
            }
          } catch (error) {
            console.error('Failed to parse SSE data:', error)
          }
        })

        source.onerror = (error) => {
          console.error('SSE connection error:', error)
          source.close()
        }
      }
    } catch (error) {
      console.error('Failed to create voice sample:', error)

      if (error instanceof HTTPError && error.response.status === 401) {
        showToast({
          id: 'voice-sample-unauthorized',
          title: '로그인이 필요합니다',
          description: '음성 샘플을 업로드하려면 로그인이 필요합니다.',
          autoDismiss: 3000,
        })
        window.setTimeout(() => {
          window.location.href = routes.login
        }, 500)
        return
      }

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

  const resetForm = () => {
    setName('')
    setCountry('ko')
    setGender('any')
    setAvatarFile(null)
    setAvatarPreview(null)
    setUploadStage('idle')
    setUploadProgress(0)
    setNotes('')
    if (!hideFileUpload) {
      setAudioFile(null)
    }
  }

  return (
    <form
      onSubmit={(e) => {
        void handleSubmit(e)
      }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <Label htmlFor="name">이름</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="AI 성우 이름"
          required
          disabled={isUploading}
        />
      </div>

      {!hideFileUpload ? (
        <div className="space-y-2">
          <Label>음성 파일</Label>
          <div className="space-y-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => document.getElementById('voice-file-upload')?.click()}
              disabled={isUploading}
            >
              파일 업로드
            </Button>
            <input
              id="voice-file-upload"
              type="file"
              accept="audio/wav,audio/mpeg,audio/mp3"
              onChange={handleFileChange}
              className="hidden"
              disabled={isUploading}
            />
            <div className="rounded-xl border border-dashed border-surface-4 p-4 text-center">
              <p className="text-sm font-medium">{selectedFileName}</p>
              {audioFile ? (
                <p className="text-xs text-muted">{(audioFile.size / 1024 / 1024).toFixed(2)} MB</p>
              ) : (
                <p className="text-xs text-muted">10~60초 길이의 음성 파일을 업로드해주세요.</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <Label>선택된 녹음 파일</Label>
          <div className="rounded-xl border border-dashed border-surface-4 p-4 text-sm">
            {selectedFileName}
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="country">국적</Label>
          <select
            id="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="focus-visible:outline-hidden w-full rounded-xl border border-surface-4 bg-surface-1 px-4 py-3 text-sm text-foreground focus-visible:ring-accent"
            disabled={isUploading}
          >
            <option value="ko">한국어</option>
            <option value="en">English</option>
            <option value="ja">日本語</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="gender">성별</Label>
          <select
            id="gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="focus-visible:outline-hidden w-full rounded-xl border border-surface-4 bg-surface-1 px-4 py-3 text-sm text-foreground focus-visible:ring-accent"
            disabled={isUploading}
          >
            <option value="any">모든 성별</option>
            <option value="female">여성</option>
            <option value="male">남성</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>아바타 이미지 (선택)</Label>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => document.getElementById('avatar-upload')?.click()}
            disabled={isUploading}
            className="rounded-full border border-dashed border-surface-4 p-1 transition hover:border-primary disabled:opacity-50"
          >
            <div className="h-16 w-16 overflow-hidden rounded-full">
              <img
                src={avatarPreview ?? DEFAULT_AVATAR}
                alt="voice avatar"
                className="h-full w-full object-cover"
              />
            </div>
          </button>
          <div className="space-y-1 text-xs text-muted">
            <p>원하는 이미지를 등록해 보이스 썸네일을 꾸밀 수 있어요.</p>
            <p>512x512 이하 PNG/JPG 권장, 미선택 시 기본 이미지가 사용됩니다.</p>
            {avatarFile ? <p className="text-sm text-foreground">{avatarFile.name}</p> : null}
          </div>
          <input
            id="avatar-upload"
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={(event) => setAvatarFile(event.target.files?.[0] ?? null)}
            disabled={isUploading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">설명</Label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="이 목소리에 대한 정보를 간단히 적어주세요."
          rows={3}
          className="focus-visible:outline-hidden w-full rounded-xl border border-surface-4 bg-surface-1 px-4 py-3 text-sm text-foreground shadow-inner shadow-black/5 transition focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isUploading}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isUploading}>
            취소
          </Button>
        ) : null}
        <Button
          type="submit"
          variant="primary"
          disabled={!name.trim() || !audioFile || isUploading}
        >
          {isUploading ? `${Math.round(uploadProgress)}%` : '보이스 클론 저장'}
        </Button>
      </div>
    </form>
  )
}

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
