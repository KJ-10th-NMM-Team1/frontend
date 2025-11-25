import { useMemo } from 'react'

import { Loader2 } from 'lucide-react'
import ReactCountryFlag from 'react-country-flag'

import { useLanguage } from '@/features/languages/hooks/useLanguage'
import { Button } from '@/shared/ui/Button'
import { DialogDescription, DialogTitle } from '@/shared/ui/Dialog'
import { Progress } from '@/shared/ui/Progress'

import type { ProjectCreationDraft, UploadProgressState } from '../types'
import { stageMessageMap } from '../hooks/useUploadProgressController'

const languageCountryMap: Record<string, string> = {
  ko: 'KR',
  en: 'US',
  ja: 'JP',
  zh: 'CN',
  es: 'ES',
  fr: 'FR',
  de: 'DE',
}

type SummaryStepProps = {
  draft: ProjectCreationDraft
  uploadProgress: UploadProgressState
  onBack: () => void
  onSubmit: () => void
}

export function SummaryStep({ draft, uploadProgress, onBack, onSubmit }: SummaryStepProps) {
  const isProcessing = uploadProgress.stage !== 'idle' && uploadProgress.stage !== 'error'
  const progressLabel = uploadProgress.message ?? stageMessageMap[uploadProgress.stage]

  const { data: languageResponse = [] } = useLanguage()
  const languageLabelMap = useMemo<Record<string, string>>(
    () => Object.fromEntries(languageResponse.map((lang) => [lang.language_code, lang.name_ko])),
    [languageResponse],
  )

  const sourceSummary =
    draft.sourceType === 'youtube'
      ? (draft.youtubeUrl ?? 'YouTube 링크 미입력')
      : draft.fileName
        ? `${draft.fileName} (${draft.fileSize ? `${(draft.fileSize / (1024 * 1024)).toFixed(1)}MB` : '크기 미상'})`
        : '파일 미선택'

  const sourceLanguageDisplay =
    draft.detectAutomatically || !draft.sourceLanguage ? (
      draft.detectAutomatically ? (
        '자동 인식'
      ) : (
        '미선택'
      )
    ) : (
      <LanguagePill code={draft.sourceLanguage} label={languageLabelMap[draft.sourceLanguage]} />
    )

  const targetLanguagesValue =
    draft.targetLanguages && draft.targetLanguages.length > 0 ? (
      <div className="flex justify-end gap-2">
        {draft.targetLanguages.map((lang) => (
          <LanguagePill key={lang} code={lang} label={languageLabelMap[lang]} />
        ))}
      </div>
    ) : (
      '미선택'
    )

  return (
    <div className="space-y-4">
      <DialogTitle className="text-lg">3단계 — 설정 확인</DialogTitle>
      <DialogDescription>입력한 정보를 확인하고 에피소드 생성을 완료하세요.</DialogDescription>

      <div className="rounded-3xl border border-surface-4 bg-surface-2 p-5">
        <p className="text-lg font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          설정 요약
        </p>
        <div className="mt-3 space-y-1 text-sm">
          <SummaryRow label="제목" value={draft.title || '제목 미입력'} />
          <SummaryRow label="소스" value={sourceSummary} />
          <SummaryRow label="원어" value={sourceLanguageDisplay} />
          <SummaryRow label="번역 언어" value={targetLanguagesValue} />
          <SummaryRow
            label="화자 수"
            value={`${draft.speakerCount === 0 ? '자동 탐색' : `${draft.speakerCount}명`}`}
          />
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          최종 산출물은 선택한 번역 언어별 더빙 영상으로 생성됩니다.
        </p>
      </div>

      {uploadProgress.stage !== 'idle' ? (
        <div className="rounded-3xl border border-dashed border-surface-4 bg-surface-1/50 p-4">
          <Progress value={uploadProgress.progress} label={progressLabel} />
          {uploadProgress.stage === 'error' ? (
            <p className="mt-2 text-xs text-danger">문제가 지속되면 잠시 후 다시 시도해주세요.</p>
          ) : null}
        </div>
      ) : null}

      <div className="flex justify-between gap-3 pt-4">
        <Button
          className="text-lg"
          variant="secondary"
          type="button"
          onClick={onBack}
          disabled={isProcessing}
        >
          이전
        </Button>
        <Button className="text-lg" type="button" onClick={onSubmit} disabled={isProcessing}>
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
    </div>
  )
}

const SummaryRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex items-center justify-between gap-3 whitespace-nowrap">
    <span className="text-sm uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
    <span className="overflow-hidden text-ellipsis whitespace-nowrap text-right text-sm font-medium text-foreground">
      {value}
    </span>
  </div>
)

function LanguagePill({ code, label }: { code: string; label?: string }) {
  const countryCode = languageCountryMap[code] ?? code.slice(0, 2).toUpperCase()
  const displayLabel = label ?? code.toUpperCase()
  return (
    <span className="flex items-center gap-1 rounded-full bg-surface-2 px-2 py-1 text-xs font-semibold text-foreground">
      <ReactCountryFlag countryCode={countryCode} svg style={{ width: '1.2em', height: '1.2em' }} />
      <span>{displayLabel}</span>
    </span>
  )
}
