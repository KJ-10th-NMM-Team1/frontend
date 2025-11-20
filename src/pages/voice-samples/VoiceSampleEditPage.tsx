import { useEffect, useMemo, useState } from 'react'

import { useNavigate, useParams, useLocation } from 'react-router-dom'

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
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Label } from '@/shared/ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/Select'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { VoiceCloningLayout } from '@/pages/voice-cloning/components/VoiceCloningLayout'

const CATEGORY_OPTIONS = [
  'Narrative & Story',
  'Conversational',
  'Characters & Animation',
  'Social Media',
  'Entertainment & TV',
  'Advertisement',
  'Informative & Educational',
]

const DEFAULT_AVATAR =
  'https://ui-avatars.com/api/?name=Voice&background=EEF2FF&color=1E1B4B&size=128'

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
    setName(sample.name ?? '')
    setNotes(sample.description ?? '')
    setLanguageCode(sample.country ?? 'ko')
    setGender(normalizeOptional(sample.gender))
    setAge(normalizeOptional(sample.age))
    setAccent(normalizeOptional(sample.accent))
    setCategories(sample.category ?? [])
    setAvatarPreview(sample.avatarImageUrl ?? null)
    const initialFields: Array<'accent' | 'gender' | 'age'> = []
    if (normalizeOptional(sample.accent) !== 'any') initialFields.push('accent')
    if (normalizeOptional(sample.gender) !== 'any') initialFields.push('gender')
    if (normalizeOptional(sample.age) !== 'any') initialFields.push('age')
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
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6">
        <div className="space-y-2 rounded-xl border border-surface-3 bg-surface-1 p-4">
          <Label>이름</Label>
          <Input
            id="edit-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름"
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2 rounded-xl border border-surface-3 bg-white p-3 shadow-inner shadow-black/5">
          <div className="space-y-2">
            <div className="grid grid-cols-[114px,1fr] items-center gap-2 rounded-lg bg-surface-2/60 px-3 py-2">
              <Label>언어 (필수)</Label>
              <Select
                value={languageCode}
                onValueChange={(value) => setLanguageCode(value)}
                disabled={isSubmitting || languageOptions.length === 0 || languagesLoading}
              >
                <SelectTrigger className="h-11">
                  <SelectValue
                    placeholder={languagesLoading ? '언어를 불러오는 중...' : '언어를 선택하세요'}
                  />
                </SelectTrigger>
                <SelectContent>
                  {languageOptions.length === 0 ? (
                    <SelectItem value="__empty" disabled>
                      {languagesLoading ? '언어를 불러오는 중...' : '등록된 언어가 없습니다.'}
                    </SelectItem>
                  ) : (
                    languageOptions.map((language) => {
                      const code = language.language_code
                      return (
                        <SelectItem key={code} value={code}>
                          {language.name_ko}
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
                  disabled={isSubmitting || accentsLoading}
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
                  disabled={isSubmitting}
                  aria-label="억양 라벨 삭제"
                >
                  -
                </Button>
              </div>
            ) : null}

            {labelFields.includes('gender') ? (
              <div className="grid grid-cols-[114px,1fr,auto] items-center gap-2 rounded-lg bg-surface-2/60 px-3 py-2">
                <Label>성별 (선택)</Label>
                <Select
                  value={gender}
                  onValueChange={(value) => setGender(value)}
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
                  aria-label="성별 라벨 삭제"
                >
                  -
                </Button>
              </div>
            ) : null}

            {labelFields.includes('age') ? (
              <div className="grid grid-cols-[114px,1fr,auto] items-center gap-2 rounded-lg bg-surface-2/60 px-3 py-2">
                <Label>나이대 (선택)</Label>
                <Select value={age} onValueChange={(value) => setAge(value)} disabled={isSubmitting}>
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
                  disabled={isSubmitting}
                  aria-label="나이대 라벨 삭제"
                >
                  -
                </Button>
              </div>
            ) : null}

            <div className="flex items-center justify-between px-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 rounded-md px-3 text-xs"
                disabled={isSubmitting || labelFields.length >= 3}
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
                  disabled={isSubmitting}
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
                  } ${isSubmitting ? 'cursor-not-allowed opacity-60' : ''}`}
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
              disabled={isSubmitting}
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
              <p>512x512 이하 PNG/JPG 권장, 미선택 시 기존 또는 기본 이미지가 사용됩니다.</p>
              {avatarFile ? <p className="text-sm text-foreground">{avatarFile.name}</p> : null}
            </div>
            <input
              id="avatar-upload"
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
              onChange={(event) => setAvatarFile(event.target.files?.[0] ?? null)}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-notes">설명</Label>
          <textarea
            id="edit-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="이 목소리에 대한 정보를 간단히 적어주세요."
            rows={3}
            className="focus-visible:outline-hidden w-full rounded-xl border border-surface-4 bg-surface-1 px-4 py-3 text-sm text-foreground shadow-inner shadow-black/5 transition focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isSubmitting}
          />
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
    </VoiceCloningLayout>
  )
}
