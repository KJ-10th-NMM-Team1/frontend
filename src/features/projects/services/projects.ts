import { getApiUrl } from '@/config'
import { handleResponse } from '@/lib/http'
import type { Language, LanguageStatus, Project, ProjectStatus } from '@/types'

interface RawProject {
  _id: string
  title?: string
  status?: string
  video_source?: string | null
  created_at?: string
  updated_at?: string
}

const projectStatusMap: Record<string, ProjectStatus> = {
  upload_ready: 'uploading',
  uploaded: 'processing',
  done: 'completed',
  failed: 'failed',
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

const mapProject = (raw: RawProject): Project => {
  const status = mapProjectStatus(raw.status)
  const languages = createDefaultLanguages(status)

  const derivedName = raw.title || raw.video_source?.split('/').pop() || '새 프로젝트'

  return {
    id: raw._id,
    name: derivedName,
    languages,
    status,
    uploadProgress: status === 'completed' ? 100 : status === 'processing' ? 50 : 0,
    createdAt: formatDateTime(raw.created_at),
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
