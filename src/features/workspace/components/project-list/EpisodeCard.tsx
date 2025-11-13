import { useMemo, type MouseEvent } from 'react'

import { MoreVertical } from 'lucide-react'
import { Link } from 'react-router-dom'

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
import { Progress } from '@/shared/ui/Progress'

const EMPTY_LANGUAGES: Language[] = []
const gradients = [
  'from-emerald-400 via-teal-500 to-cyan-500',
  'from-purple-500 via-indigo-500 to-sky-500',
  'from-rose-400 via-orange-400 to-amber-400',
]
const DAY = 1000 * 60 * 60 * 24

// 영상길이
const formatDuration = (seconds = 0) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// 상태
const projectStatusLabelMap: Record<string, '업로드' | '편집중' | '완료' | '실패'> = {
  uploading: '업로드',
  processing: '업로드',
  uploaded: '업로드',
  editing: '편집중',
  completed: '완료',
  failed: '실패',
}
const projectStatusClassMap: Record<'업로드' | '편집중' | '완료' | '실패', string> = {
  업로드: 'bg-yellow-600/90 text-white',
  편집중: 'bg-blue-600/90 text-white',
  완료: 'bg-emerald-600/90 text-white',
  실패: 'bg-rose-600/90 text-white',
}
function getProjectStatusLabel(status?: string) {
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
  업로드: 'bg-yellow-600/90 text-white',
  처리중: 'bg-blue-600/90 text-white',
  완료: 'bg-emerald-600/90 text-white',
  실패: 'bg-rose-600/90 text-white',
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
  const overlayWidth = 100 - Math.min(Math.max(overallProgress, 0), 100)

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
  const sourceLangLabel = languageMap[project.source_language] ?? project.source_language
  const targetLangLabels =
    project.targets?.map((target) => languageMap[target.language_code] ?? target.language_code) ??
    []
  const thumbnaileUrl =
    project.thumbnail?.kind === 's3'
      ? `https://${env.awsS3Bucket}.s3.${env.awsRegion}.amazonaws.com/${project.thumbnail.key}`
      : project.thumbnail?.url

  return (
    <Link
      to={routes.projectDetail(project.id)}
      className="border-surface-3 bg-surface-1/95 focus-visible:outline-hidden hover:border-primary/60 block overflow-hidden rounded-3xl border shadow-soft transition hover:-translate-y-0.5 hover:shadow-xl"
    >
      <div className="relative aspect-video overflow-hidden">
        {showActions && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="에피소드 작업"
                className="focus-visible:outline-hidden focus-visible:ring-primary/40 absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/85 text-gray-900 shadow hover:bg-white focus-visible:ring-2"
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
        {/* 어둡게 덮는 오버레이 */}
        <div
          className="absolute inset-y-0 right-0 bg-black/60 transition-[width] duration-700 ease-out"
          style={{ width: `${overlayWidth}%` }}
        />
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
          <p className="text-muted text-xs">
            사용 언어: {sourceLangLabel} → {(targetLangLabels ?? []).join(', ')}
          </p>
          <p className="text-muted text-xs">{registeredLabel}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-full">
            <Progress value={overallProgress} />
          </div>
          <span className="text-muted text-xs font-semibold">{formatPercent(overallProgress)}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {project.targets?.map((t) => {
            const label = languageMap[t.language_code] ?? t.language_code
            const statusLabel = getProjectTargetStatusLabel(t.status)
            const statusClass = projectTargetStatusClassMap[statusLabel]
            return (
              <span
                key={t.id}
                className={`rounded-full px-3 py-1 text-[11px] font-semibold ${statusClass}`}
              >
                {label} - {t.progress ?? 0}% ({statusLabel})
              </span>
            )
          })}
        </div>
      </div>
    </Link>
  )
}
