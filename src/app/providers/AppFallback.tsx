import { Spinner } from '../../shared/ui/Spinner'

export function AppFallback() {
  return (
    <div className="bg-surface-1 text-foreground flex min-h-screen flex-col items-center justify-center">
      <Spinner size="lg" />
      <p className="text-muted mt-4 text-sm">Preparing interface…</p>
    </div>
  )
}
