import { Outlet } from 'react-router-dom'

import { EditorHeader } from '../../features/layout/components/header/EditorHeader'

export function EditorLayout() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-surface-1 text-foreground">
      <EditorHeader />
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  )
}