import { Outlet, ScrollRestoration } from 'react-router-dom'

import { AppFooter } from '../../features/layout/components/footer/AppFooter'
import { AppHeader } from '../../features/layout/components/header/AppHeader'

export function RootLayout() {
  return (
    <div className="bg-surface-1 text-foreground flex min-h-screen flex-col">
      <AppHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <AppFooter />
      <ScrollRestoration />
    </div>
  )
}
