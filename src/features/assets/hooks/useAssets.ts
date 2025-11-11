import { useQuery } from '@tanstack/react-query'

import type { AssetEntry } from '@/entities/asset/types'
import { queryKeys } from '@/shared/config/queryKeys'

import { fetchAssets } from '../api/assetsApi'

export function useAssets(projectId: string, languageCode?: string) {
  return useQuery<AssetEntry[]>({
    queryKey: queryKeys.assets.list(projectId, languageCode),
    queryFn: () => fetchAssets(projectId, languageCode),
    enabled: Boolean(projectId),
  })
}
