import { useQuery } from '@tanstack/react-query'

import { apiGet } from '@/shared/api/client'
import type { AccentResponse } from '@/entities/accent/types'

export function useAccents(languageCode?: string) {
  return useQuery<AccentResponse>({
    queryKey: ['accents', languageCode],
    queryFn: () =>
      apiGet<AccentResponse>('api/accents', {
        searchParams: languageCode ? { language_code: languageCode } : undefined,
      }),
    enabled: !!languageCode,
  })
}
