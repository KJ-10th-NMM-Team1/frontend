import { useQuery } from '@tanstack/react-query'

import type { LanguageResponse } from '@/entities/language/types'
import { apiGet } from '@/shared/api/client'

export function useLanguage() {
  return useQuery<LanguageResponse>({
    queryKey: ['languages'],
    queryFn: () => apiGet<LanguageResponse>('api/languages'),
    staleTime: Infinity,
    gcTime: Infinity,
  })
}
