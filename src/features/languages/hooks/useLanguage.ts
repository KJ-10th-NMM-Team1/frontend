import { useQuery } from '@tanstack/react-query'

import type { LanguageResponse } from '@/entities/language/types'
import { apiGet } from '@/shared/api/client'

export function useLanguage() {
  return useQuery<LanguageResponse>({
    queryKey: ['languages'],
    queryFn: () => {
      const result = apiGet<LanguageResponse>('api/languages')
      console.log('api/languages response:', result)
      return result
    },
    staleTime: Infinity,
    gcTime: Infinity,
  })
}
