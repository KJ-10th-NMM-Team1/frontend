import { isRouteErrorResponse, useRouteError } from 'react-router-dom'

import { Button } from '../../shared/ui/Button'

export function RouteErrorBoundary() {
  const error = useRouteError()
  const status = isRouteErrorResponse(error) ? error.status : 500
  const message = isRouteErrorResponse(error)
    ? error.statusText
    : error instanceof Error
      ? error.message
      : 'Something went wrong'

  return (
    <div className="bg-surface-1 text-foreground flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="border-surface-3 bg-surface-2 max-w-md space-y-6 rounded-3xl border p-10 shadow-lg shadow-black/5">
        <p className="text-muted text-sm font-medium">Unexpected error</p>
        <h1 className="text-foreground text-5xl font-semibold tracking-tight">{status}</h1>
        <p className="text-muted text-base leading-relaxed">{message}</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild variant="primary">
            <a href="/">Go back home</a>
          </Button>
        </div>
      </div>
    </div>
  )
}
