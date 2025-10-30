import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { Video, Clock, Globe, MoreVertical } from 'lucide-react'
import { Button } from './ui/button'

interface Language {
  code: string
  name: string
  subtitle: boolean
  dubbing: boolean
  progress?: number
  status?: 'pending' | 'processing' | 'review' | 'completed'
  translator?: string
}

interface ProjectCardProps {
  project: {
    id: string
    name: string
    languages: Language[]
    status: 'uploading' | 'processing' | 'completed' | 'failed'
    uploadProgress?: number
    createdAt: string
    thumbnail?: string
  }
  onClick?: () => void
}

const getLanguageStatusLabel = (status?: string) => {
  switch (status) {
    case 'pending':
      return '대기 중'
    case 'processing':
      return '처리 중'
    case 'review':
      return '검토 중'
    case 'completed':
      return '완료'
    default:
      return '진행 중'
  }
}

const getProjectStatusLabel = (status: string) => {
  switch (status) {
    case 'uploading':
      return '업로드 중'
    case 'processing':
      return '처리 중'
    case 'completed':
      return '완료'
    case 'failed':
      return '실패'
    default:
      return status
  }
}

const getProjectStatusStyle = (status: string) => {
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

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const clampProgress = (value?: number) => Math.min(Math.max(value ?? 0, 0), 100)

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onClick}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
              {project.thumbnail ? (
                <img
                  src={project.thumbnail}
                  alt={project.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <Video className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base truncate">{project.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{project.createdAt}</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className={`text-xs px-2 py-1 rounded ${getProjectStatusStyle(project.status)}`}>
              {getProjectStatusLabel(project.status)}
            </span>
            {(project.status === 'uploading' || project.status === 'processing') && (
              <span className="text-xs text-gray-500">
                {clampProgress(project.uploadProgress).toFixed(0)}%
              </span>
            )}
          </div>
          {(project.status === 'uploading' || project.status === 'processing') && (
            <Progress value={clampProgress(project.uploadProgress)} />
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Globe className="w-3 h-3" />
            <span>타겟 언어 진행도</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {project.languages.map((lang) => {
              const progressValue = clampProgress(lang.progress)
              return (
                <div
                  key={lang.code}
                  className="rounded-lg border border-gray-200/70 bg-white/80 p-3 shadow-sm hover:shadow transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-1 items-center">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {lang.name}
                        </Badge>
                      </div>
                      <div className="flex gap-1 text-xs text-gray-500 ">
                        <span
                          className={`px-2 py-0.5 rounded-full ${
                            lang.subtitle ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          자막
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full ${
                            lang.dubbing
                              ? 'bg-green-50 text-green-600'
                              : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          더빙
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{progressValue.toFixed(0)}%</span>
                  </div>
                  {progressValue != 100 && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-gray-500 gap-3 text-sm">
                        <span style={{ whiteSpace: 'nowrap' }}>진행도</span>
                        <Progress value={progressValue} className="h-1" />
                      </div>
                    </div>
                  )}
                  {lang.translator && (
                    <p className="mt-2 text-xs text-gray-500">번역가: {lang.translator}</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {project.status === 'completed' && (
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" className="flex-1">
              미리보기
            </Button>
            <Button size="sm" className="flex-1">
              다운로드
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
