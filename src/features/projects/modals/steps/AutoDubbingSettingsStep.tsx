import { useEffect, useMemo, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { trackEvent } from '@/shared/lib/analytics'
import { Button } from '@/shared/ui/Button'
import { DialogDescription, DialogTitle } from '@/shared/ui/Dialog'
import { Progress } from '@/shared/ui/Progress'

import { stageMessageMap } from '../hooks/useUploadProgressController'
import type { ProjectCreationDraft, UploadProgressState } from '../types'

import { SourceLanguageField } from './components/auto-dubbing/SourceLanguageField'
import { AudioSpeakerCountField } from './components/auto-dubbing/SpeakerCountField'
import { TargetLanguagesField } from './components/auto-dubbing/TargetLanguagesField'
import { TitleField } from './components/auto-dubbing/TitleField'

const languages = ['한국어', '영어', '일본어', '스페인어', '프랑스어']

export const autoDubbingSettingsSchema = z
  .object({
    title: z.string().min(2, '제목은 2자 이상이어야 합니다.'),
    detectAutomatically: z.boolean(),
    sourceLanguage: z.string().min(1, '원어를 선택하세요.'),
    targetLanguages: z.array(z.string()).min(1, '타겟 언어를 최소 1개 선택하세요.'),
    speakerCount: z.coerce.number().min(1).max(10),
  })
  .refine((data) => (data.detectAutomatically ? true : data.sourceLanguage.length > 0), {
    path: ['sourceLanguage'],
    message: '원어를 선택하세요.',
  })

export type AutoDubbingSettingsValues = z.infer<typeof autoDubbingSettingsSchema>

type AutoDubbingSettingsStepProps = {
  initialValues: AutoDubbingSettingsValues
  draft: ProjectCreationDraft
  uploadProgress: UploadProgressState
  onBack: () => void
  onSubmit: (values: AutoDubbingSettingsValues) => void
}

export function AutoDubbingSettingsStep({
  initialValues,
  draft,
  uploadProgress,
  onBack,
  onSubmit,
}: AutoDubbingSettingsStepProps) {
  const form = useForm<AutoDubbingSettingsValues>({
    resolver: zodResolver(autoDubbingSettingsSchema),
    defaultValues: initialValues,
  })

  const {
    handleSubmit,
    register,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = form

  const detectAutomatically = watch('detectAutomatically')
  const sourceLanguage = watch('sourceLanguage')
  const speakerCount = watch('speakerCount')
  const watchedTargetLanguages = watch('targetLanguages')
  const selectedTargets = useMemo(() => watchedTargetLanguages ?? [], [watchedTargetLanguages])
  const [pendingTarget, setPendingTarget] = useState<string>('')

  const availableTargetOptions = useMemo(
    () => languages.filter((language) => !selectedTargets.includes(language)),
    [selectedTargets],
  )

  useEffect(() => {
    if (!pendingTarget && availableTargetOptions.length > 0) {
      setPendingTarget(availableTargetOptions[0])
      return
    }
    if (pendingTarget && !availableTargetOptions.includes(pendingTarget)) {
      setPendingTarget(availableTargetOptions[0] ?? '')
    }
  }, [availableTargetOptions, pendingTarget])

  const submit = handleSubmit((values) => {
    trackEvent('proj_details_submit', {
      title: values.title,
      src: detectAutomatically ? 'auto' : values.sourceLanguage,
      tgts: values.targetLanguages,
      speakers: values.speakerCount,
    })
    onSubmit(values)
  })

  const handleDetectChange = (checked: boolean) => {
    setValue('detectAutomatically', checked, { shouldDirty: true })
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

      <SourceLanguageField
        detectAutomatically={detectAutomatically}
        onDetectChange={handleDetectChange}
        languages={languages}
        sourceLanguage={sourceLanguage}
        onSourceLanguageChange={handleSourceLanguageChange}
        error={errors.sourceLanguage?.message}
      />

      <TargetLanguagesField
        selectedTargets={selectedTargets}
        availableOptions={availableTargetOptions}
        pendingTarget={pendingTarget}
        onPendingChange={setPendingTarget}
        onAddTarget={handleAddTarget}
        onRemoveTarget={handleRemoveTarget}
        error={errors.targetLanguages?.message}
      />

      <AudioSpeakerCountField
        registration={register('speakerCount', { valueAsNumber: true })}
        error={errors.speakerCount?.message}
      />

      <SettingsSummary
        title={watch('title')}
        draft={draft}
        sourceLanguage={detectAutomatically ? '자동 인식' : sourceLanguage}
        targetLanguages={selectedTargets}
        speakerCount={speakerCount}
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
            '에피소드 생성'
          )}
        </Button>
      </div>
    </form>
  )
}

type SettingsSummaryProps = {
  title: string
  draft: ProjectCreationDraft
  sourceLanguage: string
  targetLanguages: string[]
  speakerCount: number
}

function SettingsSummary({
  title,
  draft,
  sourceLanguage,
  targetLanguages,
  speakerCount,
}: SettingsSummaryProps) {
  const sourceSummary =
    draft.sourceType === 'youtube'
      ? (draft.youtubeUrl ?? 'YouTube 링크 미입력')
      : draft.fileName
        ? `${draft.fileName} (${draft.fileSize ? `${(draft.fileSize / (1024 * 1024)).toFixed(1)}MB` : '크기 미상'})`
        : '파일 미선택'

  return (
    <div className="border-surface-4 bg-surface-2 rounded-3xl border p-5">
      <p className="text-muted text-xs font-semibold uppercase tracking-[0.3em]">설정 요약</p>
      <div className="mt-3 space-y-1 text-sm">
        <SummaryRow label="제목" value={title || '제목 미입력'} />
        <SummaryRow label="소스" value={sourceSummary} />
        <SummaryRow label="원어" value={sourceLanguage} />
        <SummaryRow label="타겟 언어" value={targetLanguages.join(', ') || '미선택'} />
        <SummaryRow label="화자 수" value={`${speakerCount}명`} />
      </div>

      <p className="text-muted mt-3 text-xs">
        최종 산출물은 선택한 타겟 언어별 더빙 영상(+필요 시 자막)으로 생성됩니다.
      </p>
    </div>
  )
}

const SummaryRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between gap-3 whitespace-nowrap">
    <span className="text-muted text-xs uppercase tracking-[0.2em]">{label}</span>
    <span className="text-foreground overflow-hidden text-ellipsis whitespace-nowrap text-right text-sm font-medium">
      {value}
    </span>
  </div>
)
