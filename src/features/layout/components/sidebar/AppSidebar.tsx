import { BookOpenCheck, Clapperboard, Home, Mic, UserRound } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { routes } from '@/shared/config/routes'

type NavItem = {
  label: string
  to: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

const primaryNav: NavItem[] = [
  { label: '워크스페이스', to: routes.workspace, icon: Home },
  { label: '보이스 라이브러리', to: routes.voiceLibrary, icon: BookOpenCheck },
  { label: '보이스 클로닝', to: routes.voiceCloning, icon: Mic },
  // '/editor' 자체는 프로젝트 ID가 필요하지만, 최상위 경로로 이동하도록 처리
  { label: '더빙 스튜디오', to: '/editor', icon: Clapperboard },
]

const secondaryNav: NavItem[] = [{ label: '내 정보', to: routes.myinfo, icon: UserRound }]

export function AppSidebar() {
  return (
    <aside className="border-surface-3/80 bg-surface-1/95 hidden w-64 shrink-0 flex-col border-r px-5 py-8 shadow-sm lg:flex">
      <div className="flex flex-1 flex-col gap-8">
        <div>
          <p className="text-muted text-xs font-semibold uppercase tracking-[0.3em]">Explore</p>
          <nav className="mt-3 space-y-1">
            {primaryNav.map((item) => (
              <SidebarLink key={item.label} item={item} />
            ))}
          </nav>
        </div>
        <div>
          <p className="text-muted text-xs font-semibold uppercase tracking-[0.3em]">Account</p>
          <nav className="mt-3 space-y-1">
            {secondaryNav.map((item) => (
              <SidebarLink key={item.label} item={item} />
            ))}
          </nav>
        </div>
      </div>
    </aside>
  )
}

function SidebarLink({ item }: { item: NavItem }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        [
          'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors',
          isActive
            ? 'bg-primary text-primary-foreground shadow-soft'
            : 'text-muted hover:bg-surface-2 hover:text-foreground',
        ].join(' ')
      }
    >
      <Icon className="h-4 w-4" />
      {item.label}
    </NavLink>
  )
}
