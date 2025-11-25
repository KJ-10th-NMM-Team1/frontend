import { useEffect, useMemo, useState } from 'react'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'

import type { VoiceSample } from '@/entities/voice-sample/types'
import {
  VoiceAvatarUploader,
  VoiceCategorySelector,
  VoiceDescriptionField,
  VoiceLanguageField,
  VoiceNameField,
  VoiceTagsField,
  VoiceVisibilityAndLicense,
} from '@/features/voice-samples/components'
import {
  fetchVoiceSample,
  updateVoiceSample,
  prepareVoiceSampleAvatarUpload,
  finalizeVoiceSampleAvatarUpload,
} from '@/features/voice-samples/api/voiceSamplesApi'
import { useLanguage } from '@/features/languages/hooks/useLanguage'
import { getPresetAvatarUrl } from '@/features/voice-samples/components/voiceSampleFieldUtils'
import { VoiceCloningLayout } from '@/pages/voice-cloning/components/VoiceCloningLayout'
import { queryKeys } from '@/shared/config/queryKeys'
import { routes } from '@/shared/config/routes'
import { Button } from '@/shared/ui/Button'
import { Label } from '@/shared/ui/Label'

export default function VoiceSampleEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const stateSample = (location.state as { sample?: VoiceSample } | undefined)?.sample

  const { data: sampleFromApi, isLoading } = useQuery({
    queryKey: queryKeys.voiceSamples.detail(id ?? ''),
    queryFn: () => {
      if (!id) throw new Error('샘플 ID가 없습니다.')
      return fetchVoiceSample(id)
    },
    enabled: Boolean(id),
    initialData: stateSample,
  })

  const sample = sampleFromApi

  const [name, setName] = useState('')
  const [notes, setNotes] = useState('')
  const [languageCode, setLanguageCode] = useState('ko')
  const [categories, setCategories] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [avatarPreset, setAvatarPreset] = useState<string | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarImageFile, setAvatarImageFile] = useState<File | null>(null)
  const [isPublic, setIsPublic] = useState(false)
  const [licenseCode, setLicenseCode] = useState<string>('commercial')
  const [canCommercialUse, setCanCommercialUse] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: languageResponse } = useLanguage()
  const languageOptions = useMemo(() => languageResponse ?? [], [languageResponse])

  useEffect(() => {
    if (!sample) return
    setName(sample.name ?? '')
    setNotes(sample.description ?? '')
    setLanguageCode(sample.country ?? 'ko')
    setCategories(sample.category ?? [])
    setTags(sample.tags ?? [])
    const nextPreset = sample.avatarPreset ?? 'default'
    setAvatarPreset(nextPreset)
    setAvatarPreview(getPresetAvatarUrl(nextPreset) ?? sample.avatarImageUrl ?? null)
    setIsPublic(sample.isPublic ?? false)
    setLicenseCode(sample.licenseCode ?? 'commercial')
    setCanCommercialUse(sample.canCommercialUse ?? true)
  }, [sample])

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
      // 파일이 없으면 기존 이미지나 프리셋으로 복원
      if (sample) {
        const nextPreset = sample.avatarPreset ?? 'default'
        setAvatarPreset(nextPreset)
        setAvatarPreview(getPresetAvatarUrl(nextPreset) ?? sample.avatarImageUrl ?? null)
      }
    }
  }

  const uploadFileWithProgress = async ({
    uploadUrl,
    fields,
    file,
  }: {
    uploadUrl: string
    fields?: Record<string, string>
    file: File
  }) => {
    const formData = new FormData()

    if (fields) {
      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value)
      })
    }
    formData.append('file', file)

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`)
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!id || !name.trim()) return
    try {
      setIsSubmitting(true)
      await updateVoiceSample(id, {
        name: name.trim(),
        description: notes.trim() || undefined,
        country: languageCode,
        category: categories.length > 0 ? categories : undefined,
        tags: tags.length > 0 ? tags : undefined,
        avatar_preset: avatarPreset ?? undefined,
        license_code: licenseCode,
        can_commercial_use: canCommercialUse,
        is_public: isPublic,
      })

      // 이미지 파일이 있으면 업로드
      if (avatarImageFile) {
        try {
          const { upload_url, fields, object_key: avatarObjectKey } =
            await prepareVoiceSampleAvatarUpload(id, {
              filename: avatarImageFile.name,
              content_type: avatarImageFile.type || 'image/png',
            })

          await uploadFileWithProgress({
            uploadUrl: upload_url,
            fields,
            file: avatarImageFile,
          })

          await finalizeVoiceSampleAvatarUpload(id, {
            object_key: avatarObjectKey,
          })
        } catch (error) {
          console.error('아바타 이미지 업로드 실패:', error)
          // 이미지 업로드 실패해도 수정은 성공한 것으로 처리
        }
      }

      void queryClient.invalidateQueries({ queryKey: ['voice-library'], exact: false })
      queryClient.setQueryData(queryKeys.voiceSamples.detail(id), (prev: VoiceSample | undefined) =>
        prev
          ? {
              ...prev,
              name,
              description: notes,
              country: languageCode,
              category: categories.length > 0 ? categories : undefined,
              tags: tags.length > 0 ? tags : undefined,
              avatarPreset: avatarPreset ?? undefined,
              avatarImageUrl: avatarImageFile
                ? avatarPreview
                : getPresetAvatarUrl(avatarPreset) ?? prev.avatarImageUrl,
              licenseCode,
              canCommercialUse,
              isPublic,
            }
          : prev,
      )
      navigate(routes.voiceLibrary)
    } catch (error) {
      console.error('내 목소리 수정 실패:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted">
        음성 정보를 불러오는 중...
      </div>
    )
  }

  if (!sample) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted">
        음성 정보를 찾을 수 없습니다.
      </div>
    )
  }

  return (
    <VoiceCloningLayout
      title="Voice Sample"
      subtitle="내 목소리 수정"
      description="내 목소리의 이름과 설명을 수정할 수 있습니다."
      step="details"
    >
      <div className="p-8 sm:p-12">
        <form
          onSubmit={(e) => {
            void handleSubmit(e)
          }}
          className="space-y-6"
        >
          <VoiceNameField name={name} onChange={setName} disabled={isSubmitting} />
          <VoiceLanguageField
            value={languageCode}
          onChange={setLanguageCode}
          options={languageOptions}
          disabled={isSubmitting}
        />

          <VoiceCategorySelector selected={categories} onChange={setCategories} disabled={isSubmitting} />
        <VoiceTagsField tags={tags} onChange={setTags} disabled={isSubmitting} />

        <VoiceAvatarUploader
          avatarPreview={avatarPreview}
          selectedPreset={avatarPreset}
          onPresetChange={(preset) => {
            setAvatarPreset(preset)
            setAvatarPreview(getPresetAvatarUrl(preset) ?? null)
            setAvatarImageFile(null)
          }}
          onImageFileChange={handleAvatarImageFileChange}
          disabled={isSubmitting}
          helperText="512x512 이하 PNG/JPG 권장, 미선택 시 기존 또는 기본 이미지가 사용됩니다."
        />

        <VoiceVisibilityAndLicense
          licenseCode={licenseCode}
          isPublic={isPublic}
          disabled={isSubmitting}
          onLicenseChange={handleLicenseChange}
          onPublicToggle={handlePublicToggle}
        />

          <VoiceDescriptionField value={notes} onChange={setNotes} disabled={isSubmitting} />
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
            <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={isSubmitting}>
              취소
            </Button>
            <Button type="submit" variant="primary" disabled={!name.trim() || isSubmitting}>
              {isSubmitting ? '수정 중...' : '수정하기'}
            </Button>
          </div>
        </form>
      </div>
    </VoiceCloningLayout>
  )
}
