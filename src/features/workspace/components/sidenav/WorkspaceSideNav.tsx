import { BookOpenCheck, FolderKanban, LifeBuoy, MessagesSquare, Waves } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

import { routes } from '@/shared/config/routes'
import { cn } from '@/shared/lib/utils'

const navItems = [
  {
    icon: FolderKanban,
    label: '프로젝트 목록',
    id: 'projects',
  },
  {
    icon: Waves,
    label: '보이스 샘플',
    id: 'voice-samples',
  },
  {
    icon: BookOpenCheck,
    label: '용어 사전',
    id: 'glossary',
  },
  {
    icon: MessagesSquare,
    label: '이용 가이드',
    id: 'guide',
  },
  {
    icon: LifeBuoy,
    label: '문의',
    id: 'support',
  },
]

export function WorkspaceSideNav() {
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const activeSection = params.get('section') ?? 'projects'
  const basePath = location.pathname.startsWith(routes.workspace) ? routes.workspace : routes.home

  return (
    <nav className="flex flex-col gap-2">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = activeSection === item.id
        const to = `${basePath}?section=${item.id}`
        return (
          <Link
            key={item.label}
            to={to}
            className={cn(
              'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition',
              isActive
                ? 'bg-primary text-primary-foreground shadow-primary/40 shadow'
                : 'text-muted hover:bg-surface-3 hover:text-foreground',
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
