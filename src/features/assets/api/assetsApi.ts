import type { AssetEntry } from '@/entities/asset/types'
import { apiGet } from '@/shared/api/client'

export async function fetchAssets(projectId: string, languageCode?: string) {
  const searchParams = languageCode ? { language_code: languageCode } : undefined
  return apiGet<AssetEntry[]>(`api/assets/${projectId}`, { searchParams })
}
