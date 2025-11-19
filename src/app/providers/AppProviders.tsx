import type { PropsWithChildren } from 'react'
import { useState } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { useAuthRestore } from '@/features/auth/hooks/useAuthRestore'
// import { PipelineStatusManager } from '@/features/projects/components/PipelineStatusManager'

import { env } from '../../shared/config/env'
import { Spinner } from '../../shared/ui/Spinner'
import { AppToaster } from '../../shared/ui/Toaster'

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 30,
        retry: 2,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 1,
      },
    },
  })
}

function AuthRestorer({ children }: PropsWithChildren) {
  const { isRestoring } = useAuthRestore()

  if (isRestoring) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return <>{children}</>
}

export function AppProviders({ children }: PropsWithChildren) {
  const [queryClient] = useState<QueryClient>(() => createQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <AuthRestorer>
        {/* <PipelineStatusManager /> */}
        {children}
      </AuthRestorer>
      <ReactQueryDevtools initialIsOpen={false} position="left" />
      <AppToaster appName={env.appName} />
    </QueryClientProvider>
  )
}
