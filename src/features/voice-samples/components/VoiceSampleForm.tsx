import { useEffect, useMemo, useRef, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import { HTTPError } from 'ky'
import { Link } from 'react-router-dom'

import { useAccents } from '@/features/accents/hooks/useAccents'
import { useLanguage } from '@/features/languages/hooks/useLanguage'
import { routes } from '@/shared/config/routes'
import { env } from '@/shared/config/env'
import { queryKeys } from '@/shared/config/queryKeys'
import { useUiStore } from '@/shared/store/useUiStore'
import { Button } from '@/shared/ui/Button'
import { Label } from '@/shared/ui/Label'

import { useFinishUploadMutation, usePrepareUploadMutation } from '../hooks/useVoiceSampleStorage'
import {
  finalizeVoiceSampleAvatarUpload,
  prepareVoiceSampleAvatarUpload,
} from '../api/voiceSamplesApi'

import {
  VoiceAvatarUploader,
  VoiceAttributesSection,
  VoiceCategorySelector,
  VoiceDescriptionField,
  VoiceNameField,
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
  const [gender, setGender] = useState('any')
  const [age, setAge] = useState('any')
  const [accent, setAccent] = useState('any')
  const [labelFields, setLabelFields] = useState<Array<'accent' | 'gender' | 'age'>>([])
  const [categories, setCategories] = useState<string[]>([])
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
  const { data: languageResponse, isLoading: languagesLoading } = useLanguage()
  const languageOptions = useMemo(() => languageResponse ?? [], [languageResponse])

  const { data: accentResponse, isLoading: accentsLoading } = useAccents(languageCode)
  const accentOptions = useMemo(() => accentResponse ?? [], [accentResponse])

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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setAudioFile(file)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!name.trim() || !audioFile) return

    const includeAccent = labelFields.includes('accent')
    const includeGender = labelFields.includes('gender')
    const includeAge = labelFields.includes('age')

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
        is_public: true,
        object_key,
        country: languageCode,
        gender: includeGender && gender !== 'any' ? gender : undefined,
        age: includeAge && age !== 'any' ? age : undefined,
        accent: includeAccent && accent !== 'any' ? accent : undefined,
        category: categories.length > 0 ? categories : undefined,
        is_builtin: false,
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
        } catch (error: unknown) {
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
    setGender('any')
    setAge('any')
    setAccent('any')
    setLabelFields([])
    setCategories([])
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
      <VoiceNameField name={name} onChange={setName} disabled={isUploading} />

      {!hideFileUpload ? (
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-foreground">음성 파일</Label>
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

      <VoiceAttributesSection
        languageCode={languageCode}
        onLanguageChange={setLanguageCode}
        languages={languageOptions}
        languagesLoading={languagesLoading}
        accent={accent}
        onAccentChange={setAccent}
        accentOptions={accentOptions}
        accentsLoading={accentsLoading}
        gender={gender}
        onGenderChange={setGender}
        age={age}
        onAgeChange={setAge}
        labelFields={labelFields}
        onLabelFieldsChange={setLabelFields}
        disabled={isUploading}
      />

      <VoiceCategorySelector
        selected={categories}
        onChange={setCategories}
        disabled={isUploading}
      />

      <VoiceAvatarUploader
        avatarPreview={avatarPreview}
        onFileChange={(file) => setAvatarFile(file)}
        disabled={isUploading}
        helperText="512x512 이하 PNG/JPG 권장, 미선택 시 기본 이미지가 사용됩니다."
      />

      <VoiceDescriptionField value={notes} onChange={setNotes} disabled={isUploading} />
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          className="mt-1 h-5 w-5 rounded border-surface-4 text-primary focus:ring-accent"
          defaultChecked
          readOnly
        />
        <div className="space-y-1 text-sm leading-relaxed text-muted">
          <p>
            음성 파일을 업로드함으로써 필요한 권리와 동의를 모두 확보했으며, 생성된 콘텐츠를 불법적이거나
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
