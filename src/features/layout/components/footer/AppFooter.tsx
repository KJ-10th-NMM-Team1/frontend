import { Link } from 'react-router-dom'

import { env } from '@/shared/config/env'

export function AppFooter() {
  return (
    <footer className="border-surface-3 bg-surface-2/80 border-t">
      <div className="text-muted mx-auto flex w-full flex-col gap-4 px-6 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {env.appName}
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Link to="/docs/accessibility" className="hover:text-primary">
            접근성 정책
          </Link>
          <Link to="/docs/privacy" className="hover:text-primary">
            개인정보 처리방침
          </Link>
          <Link to="/docs/terms" className="hover:text-primary">
            이용약관
          </Link>
        </div>
      </div>
    </footer>
  )
}
