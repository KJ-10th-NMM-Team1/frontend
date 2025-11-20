import { useEffect, useMemo, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import type { Language } from '@/entities/language/types'
import { useLanguage } from '@/features/languages/hooks/useLanguage'
import { trackEvent } from '@/shared/lib/analytics'
import { parseTagsInput, stringifyTags } from '@/shared/lib/tags'
import { Button } from '@/shared/ui/Button'
import { DialogDescription, DialogTitle } from '@/shared/ui/Dialog'
import { Progress } from '@/shared/ui/Progress'

import { stageMessageMap } from '../hooks/useUploadProgressController'
import type { UploadProgressState } from '../types'

import { SourceLanguageField } from './components/auto-dubbing/SourceLanguageField'
import { AudioSpeakerCountField } from './components/auto-dubbing/SpeakerCountField'
import { TargetLanguagesField } from './components/auto-dubbing/TargetLanguagesField'
import { TagsField } from './components/auto-dubbing/TagsField'
import { TitleField } from './components/auto-dubbing/TitleField'

export const autoDubbingSettingsSchema = z
  .object({
    title: z.string().min(2, '제목은 2자 이상이어야 합니다.'),
    detectAutomatically: z.boolean(),
    replaceVoiceSamples: z.boolean(),
    // 빈 문자열도 통과시킴
    sourceLanguage: z.string().min(1, '언어를 선택해주세요').or(z.literal('')),
    targetLanguages: z.array(z.string()).min(1, '타겟 언어를 최소 1개 선택하세요.'),
    speakerCount: z.coerce.number().min(0).max(10),
    tagsInput: z.string().optional(),
  })
  .refine((data) => (data.detectAutomatically ? true : data.sourceLanguage.length > 0), {
    path: ['sourceLanguage'],
    message: '원어를 선택하세요.',
  })

export type AutoDubbingSettingsFormValues = z.infer<typeof autoDubbingSettingsSchema>
export type AutoDubbingSettingsValues = AutoDubbingSettingsFormValues & { tags: string[] }

type AutoDubbingSettingsStepProps = {
  initialValues: AutoDubbingSettingsValues
  uploadProgress: UploadProgressState
  onBack: () => void
  onSubmit: (values: AutoDubbingSettingsValues) => void
}

export function AutoDubbingSettingsStep({
  initialValues,
  uploadProgress,
  onBack,
  onSubmit,
}: AutoDubbingSettingsStepProps) {
  const form = useForm<AutoDubbingSettingsFormValues>({
    resolver: zodResolver(autoDubbingSettingsSchema),
    defaultValues: {
      ...initialValues,
      tagsInput: initialValues.tagsInput ?? stringifyTags(initialValues.tags ?? []),
    },
  })

  const {
    handleSubmit,
    register,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = form

  const detectAutomatically = watch('detectAutomatically')
  const replaceVoiceSamples = watch('replaceVoiceSamples')
  const sourceLanguage = watch('sourceLanguage')
  const speakerCount = watch('speakerCount')
  const watchedTargetLanguages = watch('targetLanguages')
  const tagsInputValue = watch('tagsInput') ?? ''
  const parsedTags = useMemo(() => parseTagsInput(tagsInputValue), [tagsInputValue])
  const selectedTargets = useMemo(() => watchedTargetLanguages ?? [], [watchedTargetLanguages])
  const [pendingTarget, setPendingTarget] = useState<string>('')

  const { data: languageResponse } = useLanguage()

  const languageItems = useMemo(() => languageResponse ?? [], [languageResponse])
  const languageLabelMap = useMemo<Record<string, string>>(
    () =>
      Object.fromEntries(
        languageItems.map((language) => [language.language_code, language.name_ko]),
      ),
    [languageItems],
  )
  const availableTargetOptions = useMemo<Language[]>(
    () => languageItems.filter((language) => !selectedTargets.includes(language.language_code)),
    [languageItems, selectedTargets],
  )

  useEffect(() => {
    if (!sourceLanguage && languageItems.length > 0) {
      setValue('sourceLanguage', languageItems[0].language_code, { shouldDirty: false })
    }
  }, [languageItems, setValue, sourceLanguage])

  useEffect(() => {
    if (!pendingTarget && availableTargetOptions.length > 0) {
      setPendingTarget(availableTargetOptions[0].language_code)
      return
    }
    if (
      pendingTarget &&
      !availableTargetOptions.some((option) => option.language_code === pendingTarget)
    ) {
      setPendingTarget(availableTargetOptions[0]?.language_code ?? '')
    }
  }, [availableTargetOptions, pendingTarget])

  const submit = handleSubmit((values) => {
    const payload: AutoDubbingSettingsValues = {
      ...values,
      tags: parsedTags,
    }
    trackEvent('proj_details_submit', {
      title: payload.title,
      src: detectAutomatically ? 'auto' : payload.sourceLanguage,
      tgts: payload.targetLanguages,
      speakers: payload.speakerCount,
      tags: payload.tags,
    })
    onSubmit(payload)
  })

  const handleDetectChange = (checked: boolean) => {
    setValue('detectAutomatically', checked, { shouldDirty: true })
  }

  const handleReplaceVoiceSamplesChange = (checked: boolean) => {
    setValue('replaceVoiceSamples', checked, { shouldDirty: true })
  }

  const handleSourceLanguageChange = (value: string) => {
    setValue('sourceLanguage', value, { shouldDirty: true })
  }

  const handleAddTarget = () => {
    if (!pendingTarget) return
    setValue('targetLanguages', [...selectedTargets, pendingTarget], {
      shouldDirty: true,
      shouldValidate: true,
    })
    setPendingTarget('')
  }

  const handleRemoveTarget = (language: string) => {
    setValue(
      'targetLanguages',
      selectedTargets.filter((item) => item !== language),
      { shouldDirty: true, shouldValidate: true },
    )
  }

  const isProcessing =
    uploadProgress.stage !== 'idle' &&
    // uploadProgress.stage !== 'done' &&
    uploadProgress.stage !== 'error'
  const progressLabel = uploadProgress.message ?? stageMessageMap[uploadProgress.stage]

  return (
    <form
      onSubmit={(event) => {
        void submit(event)
      }}
      className="space-y-3"
      aria-busy={isProcessing}
    >
      <DialogTitle>2단계 — 자동 더빙 설정</DialogTitle>
      <DialogDescription>
        제목과 언어, 화자 수를 지정하면 에피소드 자동 번역을 시작합니다.
      </DialogDescription>

      <TitleField registration={register('title')} error={errors.title?.message} />

      <TagsField
        registration={register('tagsInput')}
        previewTags={parsedTags}
        error={errors.tagsInput?.message}
      />

      <TargetLanguagesField
        selectedTargets={selectedTargets}
        availableOptions={availableTargetOptions}
        languageLabelMap={languageLabelMap}
        pendingTarget={pendingTarget}
        onPendingChange={setPendingTarget}
        onAddTarget={handleAddTarget}
        onRemoveTarget={handleRemoveTarget}
        error={errors.targetLanguages?.message}
      />

      <AudioSpeakerCountField
        registration={register('speakerCount', { valueAsNumber: true })}
        value={speakerCount}
        error={errors.speakerCount?.message}
      />

      <SourceLanguageField
        detectAutomatically={detectAutomatically}
        replaceVoiceSamples={replaceVoiceSamples}
        onDetectChange={handleDetectChange}
        onReplaceVoiceSamplesChange={handleReplaceVoiceSamplesChange}
        languages={languageItems}
        sourceLanguage={sourceLanguage}
        onSourceLanguageChange={handleSourceLanguageChange}
        error={errors.sourceLanguage?.message}
      />

      {uploadProgress.stage !== 'idle' ? (
        <div className="border-surface-4 bg-surface-1/50 rounded-3xl border border-dashed p-4">
          <Progress value={uploadProgress.progress} label={progressLabel} />
          {uploadProgress.stage === 'error' ? (
            <p className="text-danger mt-2 text-xs">문제가 지속되면 잠시 후 다시 시도해주세요.</p>
          ) : null}
        </div>
      ) : null}

      <div className="flex justify-between gap-3 pt-4">
        <Button
          variant="ghost"
          type="button"
          onClick={onBack}
          disabled={isSubmitting || isProcessing}
        >
          이전
        </Button>
        <Button type="submit" disabled={isSubmitting || isProcessing}>
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              처리 중...
            </>
          ) : (
            '다음'
          )}
        </Button>
      </div>
    </form>
  )
}
