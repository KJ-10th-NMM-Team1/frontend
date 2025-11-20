import { Waves } from 'lucide-react'

import { cn } from '@/shared/lib/utils'

type LibraryTab = 'library' | 'mine'

interface VoiceLibraryTabsProps {
  activeTab: LibraryTab
  onChange: (tab: LibraryTab) => void
}

export function VoiceLibraryTabs({ activeTab, onChange }: VoiceLibraryTabsProps) {
  const baseBtn =
    'inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors'

  return (
    <div className="flex items-center gap-4">
      {/* Explore (탐색) */}
      <button
        type="button"
        onClick={() => onChange('library')}
        className={cn(
          baseBtn,
          activeTab === 'library'
            ? 'border border-surface-3 bg-surface-1 text-foreground shadow-sm'
            : 'text-muted hover:text-foreground',
        )}
      >
        <Waves className="h-4 w-4" />
        <span>탐색</span>
      </button>

      {/* My Voices (내 목소리) */}
      <button
        type="button"
        onClick={() => onChange('mine')}
        className={cn(
          baseBtn,
          activeTab === 'mine'
            ? 'border border-surface-3 bg-surface-1 text-foreground shadow-sm'
            : 'text-muted hover:text-foreground',
        )}
      >
        내 목소리
      </button>

    </div>
  )
}
