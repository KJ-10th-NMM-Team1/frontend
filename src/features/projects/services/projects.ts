import { getApiUrl } from '@/config'
import { handleResponse } from '@/lib/http'
import type {
  Language,
  LanguageStatus,
  Project,
  ProjectDetail,
  ProjectSegment,
  ProjectSegmentIssue,
  ProjectStatus,
  SegmentAssetKeys,
} from '@/types'

interface RawProject {
  id: string
  title?: string
  status?: string
  video_source?: string | null
  created_at?: string
  updated_at?: string
  progress?: number
  job_id?: string
  job_status?: string
  segments?: RawSegment[]
  segment_assets_prefix?: string
  issue_count?: number
}

interface RawSegmentIssue extends Record<string, unknown> {
  issue_id?: string
  issueId?: string
  issue_context?: string | null
  issueContext?: string | null
}

interface RawSegment {
  segment_id?: string
  seg_id?: string
  segment_text?: string
  seg_txt?: string
  translate_context?: string
  trans_txt?: string
  score?: number
  start_point?: number
  end_point?: number
  start?: number
  end?: number
  length?: number
  sub_langth?: number
  issues?: RawSegmentIssue[]
  assets?: Record<string, string | undefined>
  source_key?: string
  bgm_key?: string
  tts_key?: string
  mix_key?: string
  video_key?: string
}

const projectStatusMap: Record<string, ProjectStatus> = {
  pending: 'uploading',
  upload_done: 'uploading',
  processing: 'processing',
  in_progress: 'processing',
  completed: 'completed',
  done: 'completed',
  failed: 'failed',
  review: 'review',
}

const languageStatusMap: Record<string, LanguageStatus> = {
  uploaded: 'processing',
  processing: 'processing',
  completed: 'completed',
  failed: 'pending',
}

const formatDateTime = (value?: string): string => {
  if (!value) {
    return new Date().toISOString()
  }
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
}

const mapProjectStatus = (rawStatus?: string): ProjectStatus => {
  if (!rawStatus) return 'processing'
  return projectStatusMap[rawStatus] ?? (rawStatus as ProjectStatus)
}

const createDefaultLanguages = (status: ProjectStatus): Language[] => {
  const languageStatus = languageStatusMap[status] ?? 'processing'
  const progress =
    status === 'completed' ? 100 : status === 'processing' ? 50 : status === 'failed' ? 0 : 10
  return [
    {
      code: 'dub',
      name: 'Target',
      subtitle: true,
      dubbing: true,
      progress,
      status: languageStatus,
    },
  ]
}

const generateSegmentId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2)
}

const extractSegmentAssets = (raw: RawSegment): SegmentAssetKeys | undefined => {
  const assets = raw.assets ?? {}
  const sourceKey = raw.source_key ?? assets.source_key ?? assets.sourceKey
  const bgmKey = raw.bgm_key ?? assets.bgm_key ?? assets.bgmKey
  const ttsKey = raw.tts_key ?? assets.tts_key ?? assets.ttsKey
  const mixKey = raw.mix_key ?? assets.mix_key ?? assets.mixKey
  const videoKey = raw.video_key ?? assets.video_key ?? assets.videoKey

  if (!sourceKey && !bgmKey && !ttsKey && !mixKey && !videoKey) {
    return undefined
  }
  return {
    sourceKey,
    bgmKey,
    ttsKey,
    mixKey,
    videoKey,
  }
}

const mapSegmentIssues = (issues?: RawSegmentIssue[]): ProjectSegmentIssue[] | undefined => {
  if (!issues || issues.length === 0) {
    return undefined
  }
  return issues.map((issue) => ({
    issueId: (issue.issue_id ?? issue.issueId)?.toString(),
    issueContext: issue.issue_context ?? issue.issueContext ?? null,
    ...issue,
  }))
}

const mapSegment = (raw: RawSegment): ProjectSegment => {
  const start = raw.start_point ?? raw.start ?? 0
  const end = raw.end_point ?? raw.end ?? 0
  const length = raw.length ?? raw.sub_langth ?? (end > start ? end - start : 0)
  const idSource =
    raw.segment_id ??
    raw.seg_id ??
    (Number.isFinite(start) || Number.isFinite(end) ? `${start}-${end}` : undefined)

  return {
    id: idSource ? String(idSource) : generateSegmentId(),
    text: raw.segment_text ?? raw.seg_txt ?? '',
    translation: raw.translate_context ?? raw.trans_txt ?? '',
    start,
    end,
    length,
    score: raw.score,
    issues: mapSegmentIssues(raw.issues),
    assets: extractSegmentAssets(raw),
  }
}

const mapProject = (raw: RawProject): Project => {
  const status = mapProjectStatus(raw.status)
  const languages = createDefaultLanguages(status)

  const derivedName = raw.title || raw.video_source?.split('/').pop() || '새 프로젝트'

  return {
    id: raw.id,
    name: derivedName,
    languages,
    status,
    uploadProgress: raw.progress,
    createdAt: formatDateTime(raw.created_at),
    segmentAssetsPrefix: raw.segment_assets_prefix,
    segments: undefined,
    jobId: raw.job_id,
    jobStatus: raw.job_status as Project['jobStatus'],
    issue_count: raw.issue_count,
  }
}

export const fetchProjects = async (): Promise<Project[]> => {
  const res = await fetch(getApiUrl('/api/projects'), {
    method: 'GET',
    credentials: 'include',
  })
  const data = await handleResponse<RawProject[]>(res)
  return data.map(mapProject)
}

export const fetchProjectDetail = async (projectId: string): Promise<ProjectDetail> => {
  const res = await fetch(getApiUrl(`/api/projects/${projectId}`), {
    method: 'GET',
    credentials: 'include',
  })
  const data = await handleResponse<RawProject>(res)
  const base = mapProject(data)
  const segments = data.segments ? data.segments.map(mapSegment) : []
  return {
    ...base,
    segments,
    segmentAssetsPrefix: data.segment_assets_prefix ?? base.segmentAssetsPrefix,
  }
}

export const fetchProjectsByOwner = async (): Promise<Project[]> => {
  const res = await fetch(getApiUrl(`/api/projects/me`), {
    method: 'GET',
    credentials: 'include',
  })
  const data = await handleResponse<RawProject[]>(res)
  return data.map(mapProject)
}

export const getProjectStatusLabel = (status: string) => {
  switch (status) {
    case 'uploading':
      return '업로드'
    case 'processing':
      return '처리 중'
    case 'completed':
      return '완료'
    case 'failed':
      return '실패'
    case 'review':
      return '검수대기'
    default:
      return status
  }
}

export const getProjectStatusStyle = (status: string) => {
  switch (status) {
    case 'uploading':
      return 'bg-blue-100 text-blue-700'
    case 'processing':
      return 'bg-yellow-100 text-yellow-700'
    case 'completed':
      return 'bg-green-100 text-green-700'
    case 'failed':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}
