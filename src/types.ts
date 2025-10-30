export type RoleType = 'owner' | 'translator' | 'reviewer'

export interface User {
  id: string
  name: string
  role: RoleType
  avatarUrl?: string
  languages?: string[]
}

export interface ProjectMember {
  id: string
  name: string
  role: RoleType
  assignedLanguages?: string[]
}

export type LanguageStatus = 'pending' | 'processing' | 'review' | 'completed'

export interface Language {
  code: string
  name: string
  subtitle: boolean
  dubbing: boolean
  progress?: number
  status?: LanguageStatus
  translatorId?: string
  reviewerId?: string
  deadline?: string
}

export type ProjectStatus = 'uploading' | 'processing' | 'completed' | 'failed'

export interface Project {
  id: string
  name: string
  languages: Language[]
  status: ProjectStatus
  uploadProgress?: number
  createdAt: string
  thumbnail?: string
  members: ProjectMember[]
  seriesTitle?: string
  episodeTitle?: string
  deadline?: string
  reviewerId?: string
  ownerId?: string
}
