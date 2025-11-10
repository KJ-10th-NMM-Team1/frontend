import { ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'

import { routes } from '@/shared/config/routes'
import { trackEvent } from '@/shared/lib/analytics'
import { Button } from '@/shared/ui/Button'

type ProjectStudioPanelProps = {
  projectId: string
}

export function ProjectStudioPanel({ projectId }: ProjectStudioPanelProps) {
  return (
    <aside className="border-surface-3 flex items-center rounded-3xl border bg-white p-6">
      <div className="space-y-3">
        <p className="text-foreground text-lg font-semibold">더빙 스튜디오</p>
        <p className="text-muted text-sm">더빙 스튜디오에서 더빙 영상을 직접 편집해보세요</p>
        <Button
          asChild
          onClick={() => trackEvent('enter_editor_click', { projectId })}
          className="w-full"
        >
          <Link to={routes.editor(projectId)}>
            <ExternalLink className="h-4 w-4" />
            더빙 스튜디오 열기
          </Link>
        </Button>
      </div>
    </aside>
  )
}
