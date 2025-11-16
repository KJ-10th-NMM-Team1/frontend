import { BookOpenCheck, Clapperboard, Home, Mic, UserRound } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { routes } from '@/shared/config/routes'
import { useUiStore } from '@/shared/store/useUiStore'

type NavItem = {
  label: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  to?: string
  onClick?: () => void
}

const primaryNav: NavItem[] = [
  { label: '워크스페이스', to: routes.workspace, icon: Home },
  { label: '보이스 라이브러리', to: routes.voiceLibrary, icon: BookOpenCheck },
  { label: '보이스 클로닝', to: routes.voiceCloning, icon: Mic },
]

const secondaryNav: Omit<NavItem, 'onClick'>[] = [
  {
    label: '더빙 스튜디오',
    icon: Clapperboard,
    to: '#',
  },
]

const tertiaryNav: NavItem[] = [{ label: '내 정보', to: routes.myinfo, icon: UserRound }]

export function AppSidebar() {
  const openProjectCreation = useUiStore((state) => state.openProjectCreation)

  const buildNav: NavItem[] = secondaryNav.map((item) =>
    item.label === '더빙 스튜디오'
      ? { ...item, to: undefined, onClick: () => openProjectCreation('source') }
      : item,
  )

  return (
    <aside className="bg-[#F1F5F9] hidden w-64 shrink-0 flex-col px-5 py-8 shadow-sm lg:flex">
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
          <p className="text-muted text-xs font-semibold uppercase tracking-[0.3em]">Build</p>
          <nav className="mt-3 space-y-1">
            {buildNav.map((item) => (
              <SidebarLink key={item.label} item={item} />
            ))}
          </nav>
        </div>
        <div className="flex flex-1 flex-col justify-end gap-3">
          <p className="text-muted text-xs font-semibold uppercase tracking-[0.3em]">Account</p>
          <nav className="mt-3 space-y-1">
            {tertiaryNav.map((item) => (
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

  if (item.onClick) {
    return (
      <button
        type="button"
        onClick={item.onClick}
        className="text-muted hover:bg-surface-2 hover:text-foreground flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition-colors"
      >
        <Icon className="h-4 w-4" />
        {item.label}
      </button>
    )
  }

  return (
    <NavLink
      to={item.to ?? '#'}
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
