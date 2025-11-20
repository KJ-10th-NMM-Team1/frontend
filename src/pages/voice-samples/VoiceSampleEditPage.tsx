import { useEffect, useMemo, useState } from 'react'

import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import type { VoiceSample } from '@/entities/voice-sample/types'
import {
  fetchVoiceSample,
  prepareVoiceSampleAvatarUpload,
  finalizeVoiceSampleAvatarUpload,
  updateVoiceSample,
} from '@/features/voice-samples/api/voiceSamplesApi'
import { useAccents } from '@/features/accents/hooks/useAccents'
import { useLanguage } from '@/features/languages/hooks/useLanguage'
import { queryKeys } from '@/shared/config/queryKeys'
import { routes } from '@/shared/config/routes'
import { VoiceCloningLayout } from '@/pages/voice-cloning/components/VoiceCloningLayout'
import {
  VoiceAvatarUploader,
  VoiceAttributesSection,
  VoiceCategorySelector,
  VoiceDescriptionField,
  VoiceNameField,
} from '@/features/voice-samples/components'
import { Button } from '@/shared/ui/Button'

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
  const [gender, setGender] = useState('any')
  const [age, setAge] = useState('any')
  const [accent, setAccent] = useState('any')
  const [labelFields, setLabelFields] = useState<Array<'accent' | 'gender' | 'age'>>([])
  const [categories, setCategories] = useState<string[]>([])
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: languageResponse, isLoading: languagesLoading } = useLanguage()
  const languageOptions = useMemo(() => languageResponse ?? [], [languageResponse])

  const { data: accentResponse, isLoading: accentsLoading } = useAccents(languageCode)
  const accentOptions = useMemo(() => accentResponse ?? [], [accentResponse])

  useEffect(() => {
    if (!sample) return
    const normalizeOptional = (value?: string | null) => {
      if (!value) return 'any'
      const trimmed = value.trim()
      return trimmed.length === 0 ? 'any' : trimmed
    }
    const normalizedAccent = normalizeOptional(sample.accent)
    const normalizedGender = normalizeOptional(sample.gender)
    const normalizedAge = normalizeOptional(sample.age)

    setName(sample.name ?? '')
    setNotes(sample.description ?? '')
    setLanguageCode(sample.country ?? 'ko')
    setGender(normalizedGender)
    setAge(normalizedAge)
    setAccent(normalizedAccent)
    setCategories(sample.category ?? [])
    setAvatarPreview(sample.avatarImageUrl ?? null)
    const initialFields: Array<'accent' | 'gender' | 'age'> = []
    if (normalizedAccent !== 'any') initialFields.push('accent')
    if (normalizedGender !== 'any') initialFields.push('gender')
    if (normalizedAge !== 'any') initialFields.push('age')
    setLabelFields(initialFields)
  }, [sample])

  useEffect(() => {
    if (!avatarFile) return
    const url = URL.createObjectURL(avatarFile)
    setAvatarPreview(url)
    return () => {
      URL.revokeObjectURL(url)
    }
  }, [avatarFile])

  const handleAvatarUpload = async (sampleId: string) => {
    if (!avatarFile) return
    const { upload_url, fields, object_key } = await prepareVoiceSampleAvatarUpload(sampleId, {
      filename: avatarFile.name,
      content_type: avatarFile.type || 'image/png',
    })
    const formData = new FormData()
    Object.entries(fields).forEach(([key, value]) => formData.append(key, value))
    formData.append('file', avatarFile)
    await fetch(upload_url, {
      method: 'POST',
      body: formData,
      credentials: 'omit',
    })
    await finalizeVoiceSampleAvatarUpload(sampleId, { object_key })
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!id || !name.trim()) return
    try {
      setIsSubmitting(true)
      const includeAccent = labelFields.includes('accent')
      const includeGender = labelFields.includes('gender')
      const includeAge = labelFields.includes('age')
      await updateVoiceSample(id, {
        name: name.trim(),
        description: notes.trim() || undefined,
        country: languageCode,
        gender: includeGender && gender !== 'any' ? gender : undefined,
        age: includeAge && age !== 'any' ? age : undefined,
        accent: includeAccent && accent !== 'any' ? accent : undefined,
        category: categories.length > 0 ? categories : undefined,
      })
      if (avatarFile) {
        await handleAvatarUpload(id)
      }
      void queryClient.invalidateQueries({ queryKey: ['voice-library'], exact: false })
      queryClient.setQueryData(queryKeys.voiceSamples.detail(id), (prev: VoiceSample | undefined) =>
        prev
          ? {
              ...prev,
              name,
              description: notes,
              country: languageCode,
              gender: gender === 'any' ? undefined : gender,
              age: age === 'any' ? undefined : age,
              accent: accent === 'any' ? undefined : accent,
              category: categories.length > 0 ? categories : undefined,
            }
          : prev,
      )
      navigate(routes.voiceLibrary)
    } catch (error) {
      console.error('보이스 샘플 수정 실패:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted">
        보이스 정보를 불러오는 중...
      </div>
    )
  }

  if (!sample) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted">
        보이스 정보를 찾을 수 없습니다.
      </div>
    )
  }

  return (
    <VoiceCloningLayout
      title="Voice Sample"
      subtitle="보이스 샘플 수정"
      description="보이스 등록 폼과 동일한 레이아웃으로 모든 필드를 수정할 수 있습니다."
    >
      <form
        onSubmit={(e) => {
          void handleSubmit(e)
        }}
        className="space-y-6 bg-white p-6"
      >
        <VoiceNameField name={name} onChange={setName} disabled={isSubmitting} />

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
          disabled={isSubmitting}
        />

        <VoiceCategorySelector selected={categories} onChange={setCategories} disabled={isSubmitting} />

        <VoiceAvatarUploader
          avatarPreview={avatarPreview}
          onFileChange={(file) => setAvatarFile(file)}
          disabled={isSubmitting}
          helperText="512x512 이하 PNG/JPG 권장, 미선택 시 기존 또는 기본 이미지가 사용됩니다."
        />

        <VoiceDescriptionField value={notes} onChange={setNotes} disabled={isSubmitting} />
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={isSubmitting}>
            취소
          </Button>
          <Button type="submit" variant="primary" disabled={!name.trim() || isSubmitting}>
            {isSubmitting ? '수정 중...' : '수정하기'}
          </Button>
        </div>
      </form>
    </VoiceCloningLayout>
  )
}
