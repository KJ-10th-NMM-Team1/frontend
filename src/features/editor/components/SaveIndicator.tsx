import { useEffect, useState } from 'react'

import { Check, Loader2, AlertCircle } from 'lucide-react'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

type SaveIndicatorProps = {
  status: SaveStatus
  hasChanges?: boolean
}

/**
 * SaveIndicator component
 *
 * Displays save status to the left of LanguageSelector
 * - idle: Nothing shown (or "저장" if hasChanges)
 * - saving: "저장중" + spinner
 * - saved: "저장 완료" + check mark (auto-hide after 2s)
 * - error: "저장 실패" + alert icon
 */
export function SaveIndicator({ status, hasChanges = false }: SaveIndicatorProps) {
  const [showSaved, setShowSaved] = useState(false)

  // Auto-hide "saved" status after 2 seconds
  useEffect(() => {
    if (status === 'saved') {
      setShowSaved(true)
      const timer = setTimeout(() => {
        setShowSaved(false)
      }, 2000)
      return () => clearTimeout(timer)
    } else {
      setShowSaved(false)
    }
  }, [status])

  // Show saved status
  if (showSaved) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <Check className="h-4 w-4" />
        <span>저장 완료</span>
      </div>
    )
  }

  // Show saving status
  if (status === 'saving') {
    return (
      <div className="flex items-center gap-2 text-sm text-blue-600">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>저장중</span>
      </div>
    )
  }

  // Show error status
  if (status === 'error') {
    return (
      <div className="flex items-center gap-2 text-sm text-red-600">
        <AlertCircle className="h-4 w-4" />
        <span>저장 실패</span>
      </div>
    )
  }

  // Show nothing in idle state
  return null
}
