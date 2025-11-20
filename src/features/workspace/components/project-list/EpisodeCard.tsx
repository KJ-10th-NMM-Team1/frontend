import { useMemo, type MouseEvent } from 'react'

import { MoreVertical } from 'lucide-react'
import { Link } from 'react-router-dom'
import ReactCountryFlag from 'react-country-flag'

import type { Language } from '@/entities/language/types'
import type { ProjectSummary, ProjectTarget } from '@/entities/project/types'
import { useLanguage } from '@/features/languages/hooks/useLanguage'
import { env } from '@/shared/config/env'
import { routes } from '@/shared/config/routes'
import { formatPercent } from '@/shared/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/Dropdown'

const EMPTY_LANGUAGES: Language[] = []
const gradients = [
  'from-emerald-400 via-teal-500 to-cyan-500',
  'from-purple-500 via-indigo-500 to-sky-500',
  'from-rose-400 via-orange-400 to-amber-400',
]
const DAY = 1000 * 60 * 60 * 24
const languageCountryMap: Record<string, string> = {
  ko: 'KR',
  en: 'US',
  ja: 'JP',
  zh: 'CN',
  es: 'ES',
  fr: 'FR',
  de: 'DE',
}
const stageLabelMap: Record<string, string> = {
  upload: '전처리 중',
  vad: '전처리 중',
  stt: 'STT 진행 중',
  mt: '번역 중',
  rag: '대본 생성 중',
  voice_mapping: '화자 매핑 중',
  tts: 'TTS 진행 중',
  packaging: '결과 마무리 중',
  outputs: '결과 저장 중',
  sync_started: '결과 동기화 중',
  sync_completed: '결과 동기화 완료',
  mux_started: '비디오 합성 중',
  mux_completed: '비디오 합성 완료',
  done: '처리 완료',
}

// 영상길이
const formatDuration = (seconds = 0) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// 상태
export const projectStatusLabelMap: Record<string, '업로드' | '편집중' | '완료' | '실패'> = {
  uploading: '업로드',
  processing: '업로드',
  uploaded: '업로드',
  editing: '편집중',
  done: '완료',
  completed: '완료',
  failed: '실패',
}
const projectStatusClassMap: Record<'업로드' | '편집중' | '완료' | '실패', string> = {
  업로드: 'bg-amber-200 text-amber-900',
  편집중: 'bg-sky-200 text-sky-900',
  완료: 'bg-emerald-200 text-emerald-900',
  실패: 'bg-rose-200 text-rose-900',
}
export function getProjectStatusLabel(status?: string) {
  return projectStatusLabelMap[status ?? ''] ?? '업로드'
}
const projectTargetStatusLabelMap: Record<string, '업로드' | '처리중' | '완료' | '실패'> = {
  pending: '업로드',
  processing: '처리중',
  completed: '완료',
  failed: '실패',
}
function getProjectTargetStatusLabel(status?: string) {
  return projectTargetStatusLabelMap[status ?? ''] ?? '업로드'
}
const projectTargetStatusClassMap: Record<'업로드' | '처리중' | '완료' | '실패', string> = {
  업로드: 'bg-amber-200 text-amber-900',
  처리중: 'bg-sky-200 text-sky-900',
  완료: 'bg-emerald-200 text-emerald-900',
  실패: 'bg-rose-200 text-rose-900',
}

// 등록일
function formatRegisteredAt(dateString?: string) {
  if (!dateString) return null

  const createdAt = new Date(dateString)
  if (Number.isNaN(createdAt.getTime())) return null

  const today = new Date()
  const diffDays = Math.floor((today.getTime() - createdAt.getTime()) / DAY)

  if (diffDays <= 0) return '오늘 등록'
  if (diffDays === 1) return '어제 등록'
  return `${diffDays}일 전 등록`
}

// 진행률
export function getProjectProgressFromTargets(targets: ProjectTarget[] = []) {
  if (targets.length === 0) return 0
  const sum = targets.reduce((acc, target) => acc + (target.progress ?? 0), 0)
  return Math.round(sum / targets.length)
}

const parseProgressValue = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  if (typeof value === 'string') {
    const parsed = Number(value)
    if (!Number.isNaN(parsed)) {
      return parsed
    }
  }
  return undefined
}

const clampProgress = (value: number) => Math.min(Math.max(value, 0), 100)
const PROGRESS_CIRCLE_RADIUS = 28
const PROGRESS_CIRCLE_CIRCUMFERENCE = 2 * Math.PI * PROGRESS_CIRCLE_RADIUS

type EpisodeCardProps = {
  project: ProjectSummary
  onEdit?: (project: ProjectSummary) => void
  onDelete?: (project: ProjectSummary) => void
}

export function EpisodeCard({ project, onEdit, onDelete }: EpisodeCardProps) {
  const showActions = Boolean(onEdit || onDelete)
  const gradient = gradients[Math.abs(project.id.charCodeAt(0)) % gradients.length]
  const statusLabel = getProjectStatusLabel(project.status)
  const statusClass = projectStatusClassMap[statusLabel]
  const registeredLabel = formatRegisteredAt(project.createdAt)
  const overallProgress = getProjectProgressFromTargets(project.targets ?? [])
  const rawOverallProgressSnake: unknown = project.overall_progress
  const rawOverallProgressCamel: unknown = project.overallProgress
  const backendProgress =
    parseProgressValue(rawOverallProgressSnake) ?? parseProgressValue(rawOverallProgressCamel)
  const liveProgressRaw = backendProgress ?? overallProgress
  const liveProgress = Number.isFinite(liveProgressRaw) ? liveProgressRaw : 0
  const normalizedProgress = clampProgress(liveProgress)
  const overlayWidth = 100 - normalizedProgress
  const progressCircleOffset =
    PROGRESS_CIRCLE_CIRCUMFERENCE - (normalizedProgress / 100) * PROGRESS_CIRCLE_CIRCUMFERENCE
  const livePercentLabel = formatPercent(normalizedProgress)
  const pipelineStage = project.current_stage
  const stageKey = pipelineStage?.toLowerCase()
  const stageLabel =
    (stageKey && stageLabelMap[stageKey]) || (statusLabel === '업로드' ? '처리 중' : undefined)
  const isRunning = project.status === 'processing' || project.status === 'uploading'
  const isFailed = project.status === 'failed'

  const handleEditClick = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    onEdit?.(project)
  }

  const handleDeleteClick = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    onDelete?.(project)
  }

  // 타겟 언어
  const { data } = useLanguage()
  const languageItems = data ?? EMPTY_LANGUAGES
  const languageMap = useMemo(() => {
    const map: Record<string, string> = {}
    languageItems.forEach((lang) => {
      map[lang.language_code] = lang.name_ko
    })
    return map
  }, [languageItems])

  const thumbnaileUrl =
    project.thumbnail?.kind === 's3' && project.thumbnail?.key
      ? `https://${env.awsS3Bucket}.s3.${env.awsRegion}.amazonaws.com/${project.thumbnail.key}`
      : project.thumbnail?.url
  const primaryTargetLanguage = project.targets?.[0]?.language_code
  const episodeLink = primaryTargetLanguage
    ? routes.editor(project.id, primaryTargetLanguage)
    : routes.projectDetail(project.id)

  return (
    <Link
      to={episodeLink}
      className="focus-visible:outline-hidden group block overflow-hidden rounded-3xl border shadow-soft transition hover:-translate-y-0.5 hover:shadow-xl"
    >
      <div className="relative aspect-video overflow-hidden">
        {showActions && (
          <div className="pointer-events-none absolute right-3 top-3 z-10 opacity-0 transition-opacity group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="에피소드 작업"
                  className="focus-visible:outline-hidden flex h-8 w-8 items-center justify-center rounded-full bg-white/85 text-gray-900 shadow hover:bg-white focus-visible:ring-2 focus-visible:ring-primary/40"
                  onClick={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                  }}
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && <DropdownMenuItem onClick={handleEditClick}>수정</DropdownMenuItem>}
                {onDelete && (
                  <DropdownMenuItem className="text-danger" onClick={handleDeleteClick}>
                    삭제
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        {project.thumbnail ? (
          <img
            src={thumbnaileUrl}
            alt={''}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-80`} />
        )}
        <div
          className="absolute inset-y-0 right-0 bg-black/60 transition-[width] duration-700 ease-out"
          style={{ width: `${overlayWidth}%` }}
        />
        {/* 상태별 오버레이 */}
        {isRunning ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/55">
            <div className="relative h-16 w-16">
              <svg
                className="h-full w-full -rotate-90"
                viewBox="0 0 64 64"
                role="img"
                aria-hidden="true"
              >
                <circle
                  className="text-white/25"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="transparent"
                  r={PROGRESS_CIRCLE_RADIUS}
                  cx="32"
                  cy="32"
                />
                <circle
                  className="text-primary"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeLinecap="round"
                  fill="transparent"
                  r={PROGRESS_CIRCLE_RADIUS}
                  cx="32"
                  cy="32"
                  strokeDasharray={PROGRESS_CIRCLE_CIRCUMFERENCE}
                  strokeDashoffset={progressCircleOffset}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
                {livePercentLabel}
              </span>
            </div>
            {stageLabel ? <p className="text-[11px] font-medium text-white">{stageLabel}</p> : null}
          </div>
        ) : isFailed ? (
          <div className="absolute inset-0 bg-black/60" />
        ) : null}

        {/* 텍스트 영역 */}
        <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
          <span
            className={`absolute bottom-2 left-2 rounded-md px-2 py-0.5 text-xs font-semibold ${statusClass}`}
          >
            {statusLabel}
          </span>
          {project.duration_seconds != null && (
            <span className="absolute bottom-2 right-2 rounded-md bg-black/70 px-2 py-0.5 text-xs font-medium text-white">
              {formatDuration(project.duration_seconds)}
            </span>
          )}
        </div>
      </div>
      <div className="space-y-2 p-4">
        <div className="space-y-1">
          <p className="line-clamp-1 text-lg font-semibold">{project.title}</p>
          <p className="text-xs text-muted">{registeredLabel}</p>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {project.targets?.map((t) => {
            const languageCode = t.language_code.toLowerCase()
            const label = languageMap[languageCode] ?? t.name ?? t.language_code
            const statusLabel = getProjectTargetStatusLabel(t.status)
            const statusClass = projectTargetStatusClassMap[statusLabel]
            const countryCode =
              languageCountryMap[languageCode] ?? languageCode.slice(0, 2).toUpperCase()

            return (
              <span
                key={t.id ?? `${t.projectId}-${languageCode}`}
                className={`rounded-full px-1 text-[11px] font-semibold ${statusClass}`}
              >
                <ReactCountryFlag
                  countryCode={countryCode}
                  svg
                  title={`${label} ${statusLabel}`}
                  style={{ width: '2.5em', height: '2.5em' }}
                />
              </span>
            )
          })}
        </div>
      </div>
    </Link>
  )
}
