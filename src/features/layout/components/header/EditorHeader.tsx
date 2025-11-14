import { ArrowLeft, ChevronDown } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'

import { useLanguage } from '@/features/languages/hooks/useLanguage'
import { useProject } from '@/features/projects/hooks/useProjects'
import { useAuthStore } from '@/shared/store/useAuthStore'
import { Button } from '@/shared/ui/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/Dropdown'

export function EditorHeader() {
  const navigate = useNavigate()
  const { projectId = '', languageCode = '' } = useParams<{
    projectId: string
    languageCode: string
  }>()

  const { data: project } = useProject(projectId)
  const { data: languages } = useLanguage()
  const { userName, signOut } = useAuthStore()

  const targetLanguage = languages?.find((lang) => lang.language_code === languageCode)

  const handleLogout = () => {
    signOut()
    navigate('/auth/login')
  }

  return (
    <header className="border-surface-3 bg-surface-2 flex h-12 items-center justify-between border-b px-4">
      {/* Left Section: Back Button and Logo */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/projects/${projectId}`)}
          className="h-8 w-8 p-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="h-6" />
      </div>

      {/* Center Section: Project Title and Target Language */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-foreground font-medium">{project?.title || 'Loading...'}</span>
        {targetLanguage && (
          <>
            <span className="text-muted">/</span>
            <span className="text-muted">{targetLanguage.name_ko}</span>
          </>
        )}
      </div>

      {/* Right Section: User Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-1.5">
            <span className="text-sm">{userName || 'User'}</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => navigate('/workspace')}>워크스페이스</DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/projects')}>프로젝트 목록</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>로그아웃</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
