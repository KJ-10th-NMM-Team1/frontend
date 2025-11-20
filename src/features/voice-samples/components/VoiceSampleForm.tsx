import { useEffect, useMemo, useRef, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import { HTTPError } from 'ky'
import ReactCountryFlag from 'react-country-flag'
import { Link } from 'react-router-dom'
import { Minus } from 'lucide-react'

import { env } from '@/shared/config/env'
import { queryKeys } from '@/shared/config/queryKeys'
import { useLanguage } from '@/features/languages/hooks/useLanguage'
import { routes } from '@/shared/config/routes'
import { useAccents } from '@/features/accents/hooks/useAccents'
import { useUiStore } from '@/shared/store/useUiStore'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Label } from '@/shared/ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/Select'

import { useFinishUploadMutation, usePrepareUploadMutation } from '../hooks/useVoiceSampleStorage'
import {
  finalizeVoiceSampleAvatarUpload,
  prepareVoiceSampleAvatarUpload,
} from '../api/voiceSamplesApi'

const DEFAULT_AVATAR =
  'https://ui-avatars.com/api/?name=Voice&background=EEF2FF&color=1E1B4B&size=128'

const languageCountryMap: Record<string, string> = {
  ko: 'KR',
  en: 'US',
  ja: 'JP',
  zh: 'CN',
  es: 'ES',
  fr: 'FR',
  de: 'DE',
  it: 'IT',
  pt: 'PT',
  ru: 'RU',
}

const getCountryCode = (code?: string) => {
  if (!code) return 'US'
  const normalized = code.toLowerCase()
  return languageCountryMap[normalized] ?? normalized.slice(0, 2).toUpperCase()
}

const CATEGORY_OPTIONS = [
  'Narrative & Story',
  'Conversational',
  'Characters & Animation',
  'Social Media',
  'Entertainment & TV',
  'Advertisement',
  'Informative & Educational',
]

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

  const selectedLanguage = languageOptions.find((lang) => lang.language_code === languageCode)
  const selectedCountryCode = getCountryCode(selectedLanguage?.language_code)
  const selectedFlagIcon = selectedLanguage ? (
    <ReactCountryFlag
      countryCode={selectedCountryCode}
      svg
      style={{ width: '1.25em', height: '1.25em' }}
      title={selectedLanguage.name_ko}
    />
  ) : null

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
      <div className="space-y-2 rounded-xl border border-surface-3 bg-surface-1 p-4">
        <Label htmlFor="name">
          이름
        </Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름"
          required
          disabled={isUploading}
        />
      </div>

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

        <div className="space-y-2 rounded-xl border border-surface-3 bg-white p-3 shadow-inner shadow-black/5">
          <div className="grid grid-cols-[114px,1fr] items-center gap-2 rounded-lg bg-surface-2/60 px-3 py-2">
            <Label>언어 (필수)</Label>
            <Select
              value={languageCode}
              onValueChange={(value) => setLanguageCode(value)}
              disabled={isUploading || languageOptions.length === 0 || languagesLoading}
            >
              <SelectTrigger className="h-11">
                <div className="flex w-full items-center gap-2">
                  {selectedFlagIcon}
                  <SelectValue
                    placeholder={languagesLoading ? '언어를 불러오는 중...' : '언어를 선택하세요'}
                  />
                </div>
              </SelectTrigger>
              <SelectContent>
                {languageOptions.length === 0 ? (
                  <SelectItem value="__empty" disabled>
                    {languagesLoading ? '언어를 불러오는 중...' : '등록된 언어가 없습니다.'}
                  </SelectItem>
                ) : (
                  languageOptions.map((language) => {
                    const code = language.language_code
                    const flagCode = getCountryCode(code)
                    return (
                      <SelectItem key={code} value={code}>
                        <span className="flex items-center gap-2">
                          <ReactCountryFlag
                            countryCode={flagCode}
                            svg
                            style={{ width: '1.25em', height: '1.25em' }}
                            title={language.name_ko}
                          />
                          {language.name_ko}
                        </span>
                      </SelectItem>
                    )
                  })
                )}
              </SelectContent>
            </Select>
          </div>

          {labelFields.includes('accent') ? (
            <div className="grid grid-cols-[114px,1fr,auto] items-center gap-2 rounded-lg bg-surface-2/60 px-3 py-2">
              <Label>억양 (선택)</Label>
              <Select
                value={accent}
                onValueChange={(value) => setAccent(value)}
                disabled={isUploading || accentsLoading}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="선택 안 함" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">선택 안 함</SelectItem>
                  {accentOptions.map((opt) => (
                    <SelectItem key={opt.code} value={opt.code}>
                      {opt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="h-9 w-9 rounded-lg border border-surface-4 bg-white shadow-inner shadow-black/10 hover:bg-surface-2"
                onClick={() => setLabelFields((prev) => prev.filter((f) => f !== 'accent'))}
                disabled={isUploading}
                aria-label="억양 라벨 삭제"
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>
          ) : null}

          {labelFields.includes('gender') ? (
            <div className="grid grid-cols-[114px,1fr,auto] items-center gap-2 rounded-lg bg-surface-2/60 px-3 py-2">
              <Label>성별 (선택)</Label>
              <Select
                value={gender}
                onValueChange={(value) => setGender(value)}
                disabled={isUploading}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="선택 안 함" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">선택 안 함</SelectItem>
                  <SelectItem value="female">여성</SelectItem>
                  <SelectItem value="male">남성</SelectItem>
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="h-9 w-9 rounded-lg border border-surface-4 bg-white shadow-inner shadow-black/10 hover:bg-surface-2"
                onClick={() => setLabelFields((prev) => prev.filter((f) => f !== 'gender'))}
                disabled={isUploading}
                aria-label="성별 라벨 삭제"
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>
          ) : null}

          {labelFields.includes('age') ? (
            <div className="grid grid-cols-[114px,1fr,auto] items-center gap-2 rounded-lg bg-surface-2/60 px-3 py-2">
              <Label>나이대 (선택)</Label>
              <Select value={age} onValueChange={(value) => setAge(value)} disabled={isUploading}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="선택 안 함" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">선택 안 함</SelectItem>
                  <SelectItem value="young">청년 (Young)</SelectItem>
                  <SelectItem value="middle_aged">중년 (Middle-aged)</SelectItem>
                  <SelectItem value="old">노년 (Old)</SelectItem>
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="h-9 w-9 rounded-lg border border-surface-4 bg-white shadow-inner shadow-black/10 hover:bg-surface-2"
                onClick={() => setLabelFields((prev) => prev.filter((f) => f !== 'age'))}
                disabled={isUploading}
                aria-label="나이대 라벨 삭제"
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>
          ) : null}

          <div className="flex items-center justify-between px-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 rounded-md px-3 text-xs"
              disabled={isUploading || labelFields.length >= 3}
              onClick={() => {
                const order: Array<'accent' | 'gender' | 'age'> = ['accent', 'gender', 'age']
                const next = order.find((f) => !labelFields.includes(f))
                if (next) {
                  setLabelFields((prev) => [...prev, next])
                }
              }}
            >
              + 라벨 추가
            </Button>
            <p className="text-xs text-muted">
              {labelFields.length >= 3
                ? '모든 라벨이 추가되었습니다.'
                : '필요한 라벨만 추가해 주세요.'}
            </p>
          </div>
        </div>

      <div className="space-y-2 rounded-xl border border-surface-3 bg-surface-1 p-4">
        <Label>카테고리 (선택, 중복 가능)</Label>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_OPTIONS.map((option) => {
            const isSelected = categories.includes(option)
            return (
              <button
                key={option}
                type="button"
                disabled={isUploading}
                onClick={() => {
                  const isAlreadySelected = categories.includes(option)
                  const next = isAlreadySelected
                    ? categories.filter((c) => c !== option)
                    : [...categories, option]
                  setCategories(next)
                }}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  isSelected
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-surface-4 bg-surface-1 text-muted hover:border-primary'
                } ${isUploading ? 'cursor-not-allowed opacity-60' : ''}`}
              >
                {option}
              </button>
            )
          })}
        </div>
        <p className="text-xs text-muted">
          원하는 용도를 여러 개 선택하면 라이브러리 검색 시 더 잘 노출됩니다.
        </p>
      </div>

      <div className="space-y-2 rounded-xl border border-surface-3 bg-surface-1 p-4">
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

      <div className="space-y-2 rounded-xl border border-surface-3 bg-surface-1 p-4">
        <Label htmlFor="notes">
          설명
        </Label>
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
