import type { PropsWithChildren } from 'react'
import { useState } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { useLanguage } from '@/features/languages/hooks/useLanguage'

import { env } from '../../shared/config/env'
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

function LanguagePreloader() {
  useLanguage()
  return null
}

export function AppProviders({ children }: PropsWithChildren) {
  const [queryClient] = useState<QueryClient>(() => createQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <LanguagePreloader />
      {children}
      <ReactQueryDevtools initialIsOpen={false} position="left" />
      <AppToaster appName={env.appName} />
    </QueryClientProvider>
  )
}
