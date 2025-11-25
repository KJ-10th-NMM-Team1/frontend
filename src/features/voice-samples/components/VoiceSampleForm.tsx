import { useEffect, useMemo, useRef, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import { HTTPError } from 'ky'
import { Link } from 'react-router-dom'

import { useLanguage } from '@/features/languages/hooks/useLanguage'
import { routes } from '@/shared/config/routes'
import { env } from '@/shared/config/env'
import { queryKeys } from '@/shared/config/queryKeys'
import { useUiStore } from '@/shared/store/useUiStore'
import { Button } from '@/shared/ui/Button'
import { Label } from '@/shared/ui/Label'

import { useFinishUploadMutation, usePrepareUploadMutation } from '../hooks/useVoiceSampleStorage'
import {
  prepareVoiceSampleAvatarUpload,
  finalizeVoiceSampleAvatarUpload,
} from '../api/voiceSamplesApi'

import { getPresetAvatarUrl } from './voiceSampleFieldUtils'

import {
  VoiceAvatarUploader,
  VoiceCategorySelector,
  VoiceDescriptionField,
  VoiceNameField,
  VoiceTagsField,
  VoiceLanguageField,
  VoiceVisibilityAndLicense,
} from './index'

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
  const [languageCode, setLanguageCode] = useState('ko')
  const [categories, setCategories] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [audioFile, setAudioFile] = useState<File | null>(initialFile)
  const [avatarPreset, setAvatarPreset] = useState<string | null>('default')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(getPresetAvatarUrl('default') ?? null)
  const [avatarImageFile, setAvatarImageFile] = useState<File | null>(null)
  const [notes, setNotes] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [licenseCode, setLicenseCode] = useState<string>('commercial')
  const [canCommercialUse, setCanCommercialUse] = useState(true)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStage, setUploadStage] = useState<'idle' | 'preparing' | 'uploading' | 'finalizing'>(
    'idle',
  )
  const isUploading = uploadStage !== 'idle'

  const prepareUploadMutation = usePrepareUploadMutation()
  const finishUploadMutation = useFinishUploadMutation()
  const queryClient = useQueryClient()
  const showToast = useUiStore((state) => state.showToast)
  const { data: languageResponse } = useLanguage()
  const languageOptions = useMemo(() => languageResponse ?? [], [languageResponse])

  // EventSource를 ref로 관리하여 cleanup 가능하도록 함
  const eventSourceRef = useRef<EventSource | null>(null)

  // 컴포넌트 언마운트 시 EventSource cleanup
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (languageOptions.length === 0) return
    const exists = languageOptions.some((lang) => lang.language_code === languageCode)
    if (!exists) {
      setLanguageCode(languageOptions[0].language_code)
    }
  }, [languageOptions, languageCode])

  useEffect(() => {
    setAudioFile(initialFile)
  }, [initialFile])

  useEffect(() => {
    if (!avatarPreset) {
      if (!avatarImageFile) {
        setAvatarPreview(null)
      }
      return
    }
    if (!avatarImageFile) {
      setAvatarPreview(getPresetAvatarUrl(avatarPreset) ?? null)
    }
  }, [avatarPreset, avatarImageFile])

  const handleAvatarImageFileChange = (file: File | null) => {
    setAvatarImageFile(file)
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      setAvatarPreset(null)
    } else {
      setAvatarPreview(getPresetAvatarUrl('default') ?? null)
      setAvatarPreset('default')
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setAudioFile(file)
  }

  const handleLicenseChange = (value: string) => {
    setLicenseCode(value)
    if (value === 'noncommercial') {
      setCanCommercialUse(false)
    } else {
      setCanCommercialUse(true)
    }
  }

  const handlePublicToggle = (checked: boolean) => {
    if (checked) {
      const confirmed = window.confirm(
        '경고: 이 목소리를 공개로 전환하면 AI 학습에 사용되거나 타인에게 노출되며, 이후에는 영구적으로 삭제가 불가능합니다. 계속하시겠습니까?',
      )
      if (!confirmed) {
        setIsPublic(false)
        return
      }
      setIsPublic(true)
    } else {
      setIsPublic(false)
      setCanCommercialUse(false)
    }
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
        country: languageCode,
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
        is_public: isPublic,
        object_key,
        country: languageCode,
        category: categories.length > 0 ? categories : undefined,
        is_builtin: false,
        tags: tags.length > 0 ? tags : undefined,
        avatar_preset: avatarPreset ?? undefined,
        license_code: licenseCode,
        can_commercial_use: canCommercialUse,
      })

      // 이미지 파일이 있으면 업로드
      if (avatarImageFile && createdSample.id) {
        try {
          setUploadProgress(90)
          const { upload_url, fields, object_key: avatarObjectKey } =
            await prepareVoiceSampleAvatarUpload(createdSample.id, {
              filename: avatarImageFile.name,
              content_type: avatarImageFile.type || 'image/png',
            })

          await uploadFileWithProgress({
            uploadUrl: upload_url,
            fields,
            file: avatarImageFile,
            onProgress: (percent) => {
              setUploadProgress(90 + percent * 0.05)
            },
          })

          await finalizeVoiceSampleAvatarUpload(createdSample.id, {
            object_key: avatarObjectKey,
          })
        } catch (error) {
          console.error('아바타 이미지 업로드 실패:', error)
          // 이미지 업로드 실패해도 보이스샘플 생성은 성공한 것으로 처리
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
      void queryClient.invalidateQueries({ queryKey: ['voice-library'], exact: false })

      if (createdSample.id) {
        // 기존 EventSource가 있으면 먼저 닫기
        if (eventSourceRef.current) {
          eventSourceRef.current.close()
          eventSourceRef.current = null
        }

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
              eventSourceRef.current = null
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
              eventSourceRef.current = null
              showToast({
                id: 'voice-sample-stream-error',
                title: '상태 확인 실패',
                description: data.error,
                autoDismiss: 3000,
              })
            }
          } catch (error: unknown) {
            console.error('Failed to parse SSE data:', error)
          }
        })

        source.onerror = (error: Event) => {
          console.error('SSE connection error:', error)
          source.close()
          eventSourceRef.current = null
        }

        // ref에 저장하여 cleanup 시 사용
        eventSourceRef.current = source
      }
    } catch (error: unknown) {
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
    setLanguageCode('ko')
    setCategories([])
    setTags([])
    setAvatarPreset('default')
    setAvatarPreview(getPresetAvatarUrl('default') ?? null)
    setAvatarImageFile(null)
    setUploadStage('idle')
    setUploadProgress(0)
    setNotes('')
    setIsPublic(false)
    setLicenseCode('commercial')
    setCanCommercialUse(true)
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
      <VoiceNameField name={name} onChange={setName} disabled={isUploading} />
      <VoiceLanguageField
        value={languageCode}
        onChange={setLanguageCode}
        options={languageOptions}
        disabled={isUploading}
      />

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
              <p className="text-xs text-muted">
                {audioFile
                  ? '파일이 선택되었습니다. 필요 시 다른 파일로 교체할 수 있습니다.'
                  : '10~60초 길이의 음성 파일을 업로드해주세요.'}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <VoiceCategorySelector selected={categories} onChange={setCategories} disabled={isUploading} />
      <VoiceTagsField tags={tags} onChange={setTags} disabled={isUploading} />

      <VoiceAvatarUploader
        avatarPreview={avatarPreview}
        selectedPreset={avatarPreset}
        onPresetChange={setAvatarPreset}
        onImageFileChange={handleAvatarImageFileChange}
        disabled={isUploading}
        helperText="기본 아바타 중 하나를 선택하거나 직접 이미지를 업로드하세요."
      />

      <VoiceVisibilityAndLicense
        licenseCode={licenseCode}
        isPublic={isPublic}
        disabled={isUploading}
        onLicenseChange={handleLicenseChange}
        onPublicToggle={handlePublicToggle}
      />

      <VoiceDescriptionField value={notes} onChange={setNotes} disabled={isUploading} />
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          className="mt-1 h-5 w-5 rounded border-surface-4 text-primary focus:ring-accent"
          defaultChecked
          readOnly
        />
        <div className="space-y-1 text-sm leading-relaxed text-muted-foreground">
          <p>
            음성 파일에 필요한 권리와 동의를 모두 확보했으며, 생성된 콘텐츠를 불법적이거나
            부정한 목적으로 사용하지 않겠다는 점에 동의합니다. 실제 서비스와 동일한 수준의 정책을 참고용으로
            제공합니다.
          </p>
          <div className="flex flex-wrap gap-3 text-primary underline underline-offset-4">
            <Link to={routes.termsOfService}>이용약관</Link>
            <Link to={routes.prohibitedPolicy}>금지 콘텐츠 및 사용 정책</Link>
            <Link to={routes.privacyPolicy}>개인정보 처리방침</Link>
          </div>
        </div>
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
          {isUploading ? `${Math.round(uploadProgress)}%` : '내 목소리 저장'}
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
